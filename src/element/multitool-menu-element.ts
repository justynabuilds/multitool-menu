import { MultitoolEngine, type ItemFrame } from "../core/engine.ts"
import { styles } from "../core/styles.ts"

export interface MultitoolSelectDetail {
  index: number
  label: string
  href: string | null
}

const LIFT_PX = 8 // a hovered plate slides out along its own length, like a blade pulled from the handle

/**
 * <multitool-menu label="Menu">
 *   <a href="/work">Work</a>
 *   <a href="/about">About</a>
 * </multitool-menu>
 *
 * The links are read from the light DOM and drawn as plates that swing out from the rivet on the button.
 */
export class MultitoolMenuElement extends HTMLElement {
  static observedAttributes = ["label", "open", "side", "length", "plate-height", "start-angle", "spread"]

  private root: ShadowRoot
  private btn: HTMLButtonElement
  private labelEl: HTMLSpanElement
  private rivet: HTMLSpanElement
  private layer: HTMLElement
  private plates: { a: HTMLAnchorElement; face: HTMLSpanElement; text: HTMLSpanElement }[] = []
  private engine = new MultitoolEngine({ count: 0 })
  private raf = 0
  private last = 0
  private syncing = false
  private built = false
  private motion = matchMedia("(prefers-reduced-motion: reduce)")
  private mo = new MutationObserver(() => this.build())
  private ro = new ResizeObserver(() => this.layout())

  constructor() {
    super()
    this.root = this.attachShadow({ mode: "open" })
    this.root.innerHTML = `<style>${styles}</style>
      <button class="btn" part="button" type="button" aria-expanded="false" aria-controls="menu"><span class="label"></span><span class="rivet" part="rivet"></span></button>
      <nav class="layer" id="menu" part="menu"></nav>`
    this.btn = this.root.querySelector(".btn")!
    this.labelEl = this.root.querySelector(".label")!
    this.rivet = this.root.querySelector(".rivet")!
    this.layer = this.root.querySelector(".layer")!

    this.btn.addEventListener("click", (e) => this.setOpen(!this.engine.isOpen, -1, e.detail === 0))
    this.btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" && !this.engine.isOpen) {
        e.preventDefault()
        this.setOpen(true, -1, true)
      }
    })
    this.root.addEventListener("keydown", (e) => this.onKey(e as KeyboardEvent))
    this.root.addEventListener("focusout", (e) => {
      const to = (e as FocusEvent).relatedTarget as Node | null
      if (this.engine.isOpen && to && !this.root.contains(to) && !this.contains(to)) this.setOpen(false)
    })
  }

  // ---------- public API ----------

  get open() {
    return this.engine.isOpen
  }
  set open(v: boolean) {
    this.setOpen(Boolean(v))
  }
  toggle(force?: boolean) {
    this.setOpen(force ?? !this.engine.isOpen)
  }
  /** Current motion values of one plate (used by the self-test). */
  frameOf(i: number): ItemFrame {
    return this.engine.frame(i)
  }

  // ---------- lifecycle ----------

  connectedCallback() {
    this.build()
    this.mo.observe(this, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["href", "target", "rel"] })
    this.ro.observe(this)
    addEventListener("resize", this.onResize)
    document.addEventListener("pointerdown", this.onOutside, true)
  }
  disconnectedCallback() {
    this.mo.disconnect()
    this.ro.disconnect()
    removeEventListener("resize", this.onResize)
    document.removeEventListener("pointerdown", this.onOutside, true)
    cancelAnimationFrame(this.raf)
    this.raf = 0
  }
  attributeChangedCallback(name: string) {
    if (!this.built) return
    if (name === "open") {
      if (!this.syncing) this.setOpen(this.hasAttribute("open"))
    } else if (name === "label") {
      this.labelEl.textContent = this.getAttribute("label") || "Menu"
    } else this.build()
  }

  // ---------- build and layout ----------

  private num(name: string, fallback: number) {
    const v = parseFloat(this.getAttribute(name) ?? "")
    return Number.isFinite(v) ? v : fallback
  }
  private get side() {
    return this.getAttribute("side") === "right" ? "right" : "left"
  }

  private build() {
    this.built = true
    this.labelEl.textContent = this.getAttribute("label") || "Menu"
    this.btn.setAttribute("aria-label", this.labelEl.textContent)
    const links = Array.from(this.querySelectorAll<HTMLAnchorElement>(":scope > a"))
    const wasOpen = this.hasAttribute("open")
    this.engine = new MultitoolEngine({
      count: links.length,
      startAngle: this.num("start-angle", 12),
      spread: this.num("spread", 12),
      reducedMotion: this.motion.matches,
    })
    this.layer.replaceChildren()
    this.plates = links.map((src, i) => {
      const a = document.createElement("a")
      a.className = "plate"
      a.setAttribute("part", "item")
      a.tabIndex = -1
      for (const k of ["href", "target", "rel"]) if (src.hasAttribute(k)) a.setAttribute(k, src.getAttribute(k)!)
      a.style.zIndex = String(links.length - i)
      const face = document.createElement("span")
      face.className = "face"
      face.setAttribute("part", "face")
      const text = document.createElement("span")
      text.setAttribute("part", "label")
      text.textContent = (src.textContent || "").trim()
      face.append(text)
      a.append(face)
      a.addEventListener("pointerenter", (e) => e.pointerType !== "touch" && this.hover(i, true))
      a.addEventListener("pointerleave", (e) => e.pointerType !== "touch" && this.hover(i, false))
      a.addEventListener("focus", () => this.hover(i, true))
      a.addEventListener("blur", () => this.hover(i, false))
      a.addEventListener("click", (e) => {
        if (!this.pick(i)) e.preventDefault()
      })
      this.layer.append(a)
      return { a, face, text }
    })
    if (wasOpen) {
      this.engine.setOpen(true)
      this.engine.settle()
    }
    this.syncAria()
    this.layout()
    // measure again once the page around the menu has finished updating (a nav that rearranges with the setting)
    requestAnimationFrame(() => this.layout())
  }

  private layout() {
    if (!this.plates.length) return
    const host = this.getBoundingClientRect()
    const r = this.rivet.getBoundingClientRect()
    const px = r.left + r.width / 2 - host.left
    const py = r.top + r.height / 2 - host.top
    const h = this.num("plate-height", 38)
    const room = this.side === "left" ? r.left + r.width / 2 - 12 : innerWidth - (r.left + r.width / 2) - 12
    const len = Math.max(h * 2, Math.min(this.num("length", 252), room))
    for (const { a } of this.plates) {
      const s = a.style
      s.width = `${len}px`
      s.height = `${h}px`
      s.top = `${py - h / 2}px`
      if (this.side === "left") {
        s.left = `${px - len + h / 2}px`
        s.transformOrigin = `${len - h / 2}px ${h / 2}px`
      } else {
        s.left = `${px - h / 2}px`
        s.transformOrigin = `${h / 2}px ${h / 2}px`
      }
    }
    this.render()
  }

  private onResize = () => this.layout()

  // ---------- behaviour ----------

  private setOpen(open: boolean, chosen = -1, focusFirst = false) {
    this.engine.reducedMotion = this.motion.matches
    if (!this.engine.setOpen(open, chosen)) return
    if (open) this.layout() // the button may have moved since the last measure
    this.syncing = true
    this.toggleAttribute("open", open)
    this.syncing = false
    this.syncAria()
    this.render()
    this.dispatchEvent(new CustomEvent("toggle", { detail: { open }, bubbles: true, composed: true }))
    this.kick()
    if (open && focusFirst) this.plates[0]?.a.focus()
  }

  private syncAria() {
    const open = this.engine.isOpen
    this.btn.setAttribute("aria-expanded", String(open))
    for (const p of this.plates) p.a.tabIndex = open ? 0 : -1
  }

  private hover(i: number, on: boolean) {
    if (on) this.engine.hoverEnter(i)
    else this.engine.hoverLeave(i)
    this.kick()
  }

  /** Fires `select`; returns false when a listener cancelled it. Every pick closes the menu. */
  private pick(i: number) {
    const p = this.plates[i]
    const detail: MultitoolSelectDetail = { index: i, label: p.text.textContent || "", href: p.a.getAttribute("href") }
    const ok = this.dispatchEvent(new CustomEvent("select", { detail, bubbles: true, composed: true, cancelable: true }))
    this.setOpen(false, i)
    this.btn.focus({ preventScroll: true })
    return ok
  }

  private onKey(e: KeyboardEvent) {
    if (e.key === "Escape" && this.engine.isOpen) {
      e.preventDefault()
      this.setOpen(false)
      this.btn.focus()
      return
    }
    const at = this.plates.findIndex((p) => p.a === this.root.activeElement)
    if (at < 0) return
    const n = this.plates.length
    const to = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: n - 1 }[e.key]
    if (to === undefined) return
    e.preventDefault()
    this.plates[(to + n) % n].a.focus()
  }

  private onOutside = (e: PointerEvent) => {
    if (this.engine.isOpen && !e.composedPath().includes(this)) this.setOpen(false)
  }

  // ---------- frame loop ----------

  private kick() {
    if (this.raf) return
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  private tick = (now: number) => {
    const busy = this.engine.step((now - this.last) / 1000)
    this.last = now
    this.render()
    this.raf = busy ? requestAnimationFrame(this.tick) : 0
  }

  private render() {
    const dir = this.side === "left" ? -1 : 1
    this.plates.forEach(({ a, face, text }, i) => {
      const f = this.engine.frame(i)
      // CSS rotation is clockwise: a plate pointing left swings down with a negative angle, one pointing right with a positive one
      a.style.transform = `rotate(${(dir * f.angle).toFixed(3)}deg)`
      // visible from the moment it opens, so keyboard focus can land on a plate in the first frame
      a.style.visibility = this.engine.isOpen || f.opacity > 0.002 ? "visible" : "hidden"
      face.style.opacity = f.opacity.toFixed(3)
      face.style.transform = `translate3d(${(dir * f.lift * LIFT_PX).toFixed(2)}px,0,0)`
      // the shadow is styled in CSS from --lift, so a theme can restyle it through ::part(face)
      face.style.setProperty("--lift", f.lift.toFixed(3))
      text.style.opacity = (1 - f.dim * 0.55).toFixed(3)
    })
  }
}
