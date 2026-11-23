import "../src/element/index.ts"
import type { MultitoolSelectDetail } from "../src/element/index.ts"
import { wireSite } from "./demo.ts"

/* ---------------- state ---------------- */

type Link = { label: string; href: string }
const exampleLinks = (): Link[] => [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Journal", href: "#journal" },
  { label: "Contact", href: "#contact" },
]
const initial = () => ({
  label: "Menu",
  links: exampleLinks(),
  finish: "pearl",
  buttonBg: "",
  buttonText: "",
  plateBg: "",
  plateText: "",
  font: "Same as my site",
  radius: 14,
  side: "left",
  length: 252,
  plateHeight: 38,
  startAngle: 12,
  spread: 12,
  open: true,
  device: "full",
})
const S = initial()
type Key = keyof typeof S
const MAX_LINKS = 8

const FINISH_COLOURS: Record<string, Record<string, string>> = {
  pearl: { buttonBg: "#17171A", buttonText: "#F5F5F3", plateBg: "#FFFFFF", plateText: "#141416" },
  ink: { buttonBg: "#17171A", buttonText: "#F5F5F3", plateBg: "#1C1C20", plateText: "#F4F4F2" },
  glass: { buttonBg: "#FFFFFF", buttonText: "#141416", plateBg: "#FFFFFF", plateText: "#141416" },
}
const FONTS: Record<string, string> = {
  "Same as my site": "",
  Geist: '"Geist", ui-sans-serif, system-ui, sans-serif',
  Inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
  "Instrument Sans": '"Instrument Sans", ui-sans-serif, system-ui, sans-serif',
  System: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
}

/* ---------------- panel schema ---------------- */

type Base = { k: Key; label: string; hint?: string | (() => string); when?: () => boolean }
type Ctl = Base & (
  | { type: "text" }
  | { type: "slider"; min: number; max: number; step?: number; unit: string }
  | { type: "select"; options: () => [string, string][] }
  | { type: "segment"; options: [string, string][] }
  | { type: "toggle" }
  | { type: "colour" }
  | { type: "links" }
)

const SCHEMA: [string, Ctl[]][] = [
  ["Content", [
    { k: "label", label: "Button text", type: "text" },
    { k: "links", label: "Links", type: "links" },
  ]],
  ["Finish", [
    { k: "finish", label: "Finish", type: "segment", options: [["pearl", "Pearl"], ["ink", "Ink"], ["glass", "Glass"]], hint: () => ({
      pearl: "White plates with a pearl rim and cool shadows.",
      ink: "Dark plates out of a dark button.",
      glass: "Frosted plates and button. Best over photos.",
    })[S.finish]! },
  ]],
  ["Colours", [
    { k: "buttonBg", label: "Button", type: "colour" },
    { k: "buttonText", label: "Button text", type: "colour" },
    { k: "plateBg", label: "Plates", type: "colour", hint: () => (S.finish === "glass" ? "Glass keeps the colour see-through." : "") },
    { k: "plateText", label: "Plate text", type: "colour" },
    { k: "font", label: "Font", type: "select", options: () => Object.keys(FONTS).map((f) => [f, f]), hint: "Same as my site uses the font around the menu." },
    { k: "radius", label: "Button corners", type: "slider", min: 0, max: 20, unit: "px" },
  ]],
  ["Fan", [
    { k: "side", label: "Opens to", type: "segment", options: [["left", "Left"], ["right", "Right"]], hint: "Left for a button on the right of the nav." },
    { k: "length", label: "Plate length", type: "slider", min: 160, max: 340, step: 4, unit: "px" },
    { k: "plateHeight", label: "Plate height", type: "slider", min: 32, max: 52, unit: "px" },
    { k: "startAngle", label: "First plate", type: "slider", min: 0, max: 30, unit: "°", hint: "How far below the button line the first plate sits." },
    { k: "spread", label: "Spread", type: "slider", min: 6, max: 20, unit: "°", hint: "Space between plates." },
  ]],
  ["Preview", [
    { k: "open", label: "Menu open", type: "toggle" },
    { k: "device", label: "Screen", type: "segment", options: [["full", "Desktop"], ["768", "Tablet"], ["390", "Phone"]] },
  ]],
]

/* ---------------- build panel ---------------- */

const panel = document.getElementById("panel")!
const pv = document.getElementById("pv")!
const frame = document.getElementById("frame")!
const menu = wireSite(pv)
const refresh: (() => void)[] = []
let uid = 0

function set<K extends Key>(k: K, v: (typeof S)[K]) {
  S[k] = v
  refreshAll()
  apply()
}
function refreshAll() { refresh.forEach((f) => f()) }
function fillTrack(r: HTMLInputElement) {
  const p = ((+r.value - +r.min) / (+r.max - +r.min)) * 100
  r.style.setProperty("--p", `${Math.max(0, Math.min(100, p))}%`)
}
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)

const head = document.createElement("div")
head.className = "panel-head"
head.innerHTML = `<span>Properties</span><button type="button" class="reset">Reset all</button>`
head.querySelector("button")!.addEventListener("click", () => { Object.assign(S, initial()); refreshAll(); apply() })
panel.appendChild(head)

for (const [title, ctls] of SCHEMA) {
  const sec = document.createElement("section")
  sec.className = "sec"
  sec.innerHTML = `<h2>${title}</h2>`
  for (const c of ctls) {
    const row = document.createElement("div")
    row.className = "row"
    const id = `c${++uid}`
    const lab = `<label for="${id}">${c.label}</label>`
    const k = c.k
    let update: () => void = () => {}

    if (c.type === "text") {
      row.innerHTML = `${lab}<div class="ctl"><div class="fx"><input id="${id}" type="text" maxlength="24"></div></div>`
      const i = row.querySelector("input")!
      update = () => { if (document.activeElement !== i) i.value = String(S[k]) }
      i.addEventListener("input", () => set(k, i.value as never))
    } else if (c.type === "slider") {
      row.innerHTML = `${lab}<div class="ctl"><div class="sl"><input type="range" id="${id}" min="${c.min}" max="${c.max}" step="${c.step ?? 1}"><output></output></div></div>`
      const r = row.querySelector("input")!, out = row.querySelector("output")!
      update = () => { r.value = String(S[k]); out.textContent = `${S[k]}${c.unit === "°" ? "°" : ` ${c.unit}`}`; fillTrack(r) }
      r.addEventListener("input", () => set(k, +r.value as never))
    } else if (c.type === "select") {
      row.innerHTML = `${lab}<div class="ctl"><select class="in" id="${id}">${c.options().map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("")}</select></div>`
      const s = row.querySelector("select")!
      update = () => { s.value = String(S[k]) }
      s.addEventListener("change", () => set(k, s.value as never))
    } else if (c.type === "segment") {
      row.innerHTML = `<span class="lab">${c.label}</span><div class="ctl"><div class="seg" role="group" aria-label="${c.label}">${c.options.map(([v, l]) => `<button type="button" data-v="${v}">${l}</button>`).join("")}</div></div>`
      const bs = [...row.querySelectorAll("button")]
      update = () => bs.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === S[k])))
      bs.forEach((b) => b.addEventListener("click", () => set(k, b.dataset.v as never)))
    } else if (c.type === "toggle") {
      row.innerHTML = `<span class="lab" id="${id}">${c.label}</span><div class="ctl"><button type="button" class="tog" role="switch" aria-labelledby="${id}"></button></div>`
      const b = row.querySelector("button")!
      update = () => b.setAttribute("aria-checked", String(!!S[k]))
      b.addEventListener("click", () => set(k, !S[k] as never))
    } else if (c.type === "colour") {
      row.innerHTML = `${lab}<div class="ctl"><div class="fx col"><span class="sw"><input type="color" aria-label="${c.label} colour"></span><input id="${id}" spellcheck="false" maxlength="7"><button type="button" class="x" aria-label="Back to the finish colour">×</button></div></div>`
      const [pick, hex] = row.querySelectorAll("input")
      const sw = row.querySelector<HTMLElement>(".sw")!, x = row.querySelector<HTMLButtonElement>(".x")!
      update = () => {
        const v = String(S[k])
        pick.value = v || FINISH_COLOURS[S.finish][k]
        sw.style.background = pick.value
        hex.placeholder = "From finish"
        if (document.activeElement !== hex) hex.value = v.toUpperCase()
        x.hidden = !v
      }
      pick.addEventListener("input", () => set(k, pick.value as never))
      hex.addEventListener("input", () => { const v = hex.value.trim(); if (!v || /^#?[0-9a-f]{6}$/i.test(v)) set(k, (v && !v.startsWith("#") ? `#${v}` : v) as never) })
      x.addEventListener("click", () => set(k, "" as never))
    } else if (c.type === "links") {
      row.classList.add("stack")
      row.innerHTML = `<span class="lab">${c.label}</span><div class="ctl"><div class="links"></div><div class="links-foot"><button type="button" class="add">+ Add a link</button><span><button type="button" class="mini" data-a="ex">Example</button></span></div><p class="hint">Each link becomes one plate. Four to six reads best.</p></div>`
      const box = row.querySelector<HTMLElement>(".links")!
      const add = row.querySelector<HTMLButtonElement>(".add")!
      const draw = () => {
        box.innerHTML = `<div class="link-head"><span>Text</span><span>Goes to</span></div>` + S.links.map((l, i) => `
          <div class="link-row" data-i="${i}">
            <input aria-label="Link ${i + 1} text" value="${esc(l.label)}" data-f="label" maxlength="20">
            <input aria-label="Link ${i + 1} address" value="${esc(l.href)}" data-f="href" spellcheck="false" placeholder="/page">
            <button type="button" class="x" aria-label="Remove link ${i + 1}"${S.links.length <= 1 ? " hidden" : ""}>×</button>
          </div>`).join("")
        add.disabled = S.links.length >= MAX_LINKS
      }
      update = () => { if (!box.contains(document.activeElement)) draw() }
      box.addEventListener("input", (e) => {
        const el = e.target as HTMLInputElement, i = +el.closest<HTMLElement>(".link-row")!.dataset.i!
        S.links = S.links.map((l, j) => (j === i ? { ...l, [el.dataset.f!]: el.value } : l))
        apply()
      })
      box.addEventListener("click", (e) => {
        const x = (e.target as Element).closest(".x"); if (!x) return
        const i = +x.closest<HTMLElement>(".link-row")!.dataset.i!
        set("links", S.links.filter((_, j) => j !== i))
      })
      add.addEventListener("click", () => {
        set("links", [...S.links, { label: "New page", href: "/new-page" }])
        box.querySelector<HTMLInputElement>(".link-row:last-child input")?.select()
      })
      row.querySelector('[data-a="ex"]')!.addEventListener("click", () => set("links", exampleLinks()))
    }

    if (c.hint) {
      const h = document.createElement("p")
      h.className = "hint"
      row.querySelector(".ctl")!.appendChild(h)
      const prev = update
      update = () => { prev(); const t = typeof c.hint === "function" ? c.hint() : c.hint!; h.textContent = t; h.hidden = !t }
    }
    const inner = update
    refresh.push(() => { row.hidden = c.when ? !c.when() : false; inner() })
    sec.appendChild(row)
  }
  panel.appendChild(sec)
}

/* ---------------- apply to the component ---------------- */

const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(" ")
const liveLinks = () => S.links.filter((l) => l.label.trim())

function attrs(): [string, string][] {
  const a: [string, string][] = []
  if (S.label && S.label !== "Menu") a.push(["label", S.label])
  if (S.finish !== "pearl") a.push(["finish", S.finish])
  if (S.side !== "left") a.push(["side", S.side])
  if (S.length !== 252) a.push(["length", String(S.length)])
  if (S.plateHeight !== 38) a.push(["plate-height", String(S.plateHeight)])
  if (S.startAngle !== 12) a.push(["start-angle", String(S.startAngle)])
  if (S.spread !== 12) a.push(["spread", String(S.spread)])
  return a
}
function styles(): [string, string][] {
  const s: [string, string][] = []
  const glass = S.finish === "glass"
  if (S.buttonBg) s.push(["--mt-button-bg", glass ? `rgb(${hexToRgb(S.buttonBg)} / .66)` : S.buttonBg])
  if (S.buttonText) s.push(["--mt-button-text", S.buttonText])
  if (S.plateBg) s.push(["--mt-plate-bg", glass ? `rgb(${hexToRgb(S.plateBg)} / .6)` : S.plateBg])
  if (S.plateText) s.push(["--mt-plate-text", S.plateText])
  if (FONTS[S.font]) s.push(["--mt-font", FONTS[S.font]])
  if (S.radius !== 14) s.push(["--mt-button-radius", `${S.radius}px`])
  return s
}

const KNOWN = ["label", "finish", "side", "length", "plate-height", "start-angle", "spread"]
let applying = false
let lastLinks = ""

function apply() {
  applying = true
  // move the button first, so the menu measures its room from where it will sit
  pv.classList.toggle("mirror", S.side === "right")
  const want = new Map(attrs())
  for (const k of KNOWN) {
    const v = want.get(k)
    if (v == null) { if (menu.hasAttribute(k)) menu.removeAttribute(k) }
    else if (menu.getAttribute(k) !== v) menu.setAttribute(k, v)
  }
  menu.removeAttribute("style")
  for (const [p, v] of styles()) menu.style.setProperty(p, v)
  const sig = JSON.stringify(liveLinks())
  if (sig !== lastLinks) {
    lastLinks = sig
    menu.replaceChildren(...liveLinks().map((l) => Object.assign(document.createElement("a"), { href: l.href || "#", textContent: l.label })))
  }
  frame.style.width = S.device === "full" ? "100%" : `${S.device}px`
  if (menu.open !== S.open) menu.open = S.open
  applying = false
  renderCode()
}

/* ---------------- code + events ---------------- */

let tab: "html" | "react" = "html"
const codeEl = document.getElementById("code")!
const escHTML = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!)

function code(): string {
  const a = attrs(), st = styles()
  const links = liveLinks()
  if (tab === "html") {
    const at = a.map(([k, v]) => ` ${k}="${esc(v)}"`).join("")
    const style = st.length ? ` style="${st.map(([p, v]) => `${p}: ${v.replace(/"/g, "'")}`).join("; ")}"` : ""
    return `<script src="multitool-menu.iife.js"></script>\n\n<multitool-menu${at}${style}>\n${links.map((l) => `  <a href="${esc(l.href)}">${escHTML(l.label)}</a>`).join("\n")}\n</multitool-menu>`
  }
  const p: string[] = [`items={[\n${links.map((l) => `    { label: ${JSON.stringify(l.label)}, href: ${JSON.stringify(l.href)} },`).join("\n")}\n  ]}`]
  if (S.label && S.label !== "Menu") p.push(`label=${JSON.stringify(S.label)}`)
  if (S.finish !== "pearl") p.push(`finish="${S.finish}"`)
  if (S.side !== "left") p.push(`side="right"`)
  if (S.length !== 252) p.push(`length={${S.length}}`)
  if (S.plateHeight !== 38) p.push(`plateHeight={${S.plateHeight}}`)
  if (S.startAngle !== 12) p.push(`startAngle={${S.startAngle}}`)
  if (S.spread !== 12) p.push(`spread={${S.spread}}`)
  if (st.length) p.push(`style={{ ${st.map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(", ")} }}`)
  p.push(`onSelect={(item) => console.log(item)}`)
  return `import { MultitoolMenu } from "@justbuilt/multitool-menu/react"\n\n<MultitoolMenu\n${p.map((x) => "  " + x).join("\n")}\n/>`
}
function renderCode() {
  codeEl.innerHTML = escHTML(code()).replace(/(&lt;\/?[\w-]+|\/?&gt;)/g, '<span class="a">$1</span>')
}

const tabs = [...document.querySelectorAll<HTMLButtonElement>("#code-tabs button")]
tabs.forEach((b) => b.addEventListener("click", () => {
  tab = b.dataset.tab as typeof tab
  tabs.forEach((x) => x.setAttribute("aria-selected", String(x === b)))
  renderCode()
}))

const copyBtn = document.getElementById("copy")!
copyBtn.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(code()); copyBtn.textContent = "Copied" }
  catch {
    const r = document.createRange(); r.selectNodeContents(codeEl)
    const sel = getSelection(); sel?.removeAllRanges(); sel?.addRange(r)
    copyBtn.textContent = "Selected"
  }
  copyBtn.classList.add("done")
  setTimeout(() => { copyBtn.textContent = "Copy"; copyBtn.classList.remove("done") }, 1600)
})

const evList = document.getElementById("events")!
function logEvent(type: string, text: string) {
  evList.querySelector(".empty")?.remove()
  const li = document.createElement("li")
  li.innerHTML = `<b>${type}</b><span>${escHTML(text)}</span>`
  evList.prepend(li)
  while (evList.children.length > 20) evList.lastElementChild!.remove()
}

// Two-way, like Framer's property panel: opening or closing in the preview updates the toggle.
menu.addEventListener("toggle", (e) => {
  const open = (e as unknown as CustomEvent<{ open: boolean }>).detail.open
  logEvent("toggle", open ? "open" : "closed")
  if (applying) return
  S.open = open
  refreshAll()
})
menu.addEventListener("select", (e) => {
  const d = (e as CustomEvent<MultitoolSelectDetail>).detail
  logEvent("select", `${d.index} · ${d.label} · ${d.href ?? "no link"}`)
  e.preventDefault() // the playground never navigates away
})

const wOut = document.getElementById("stage-w")!
new ResizeObserver(() => { wOut.textContent = `${Math.round(frame.getBoundingClientRect().width)} px` }).observe(frame)

refreshAll()
apply()
