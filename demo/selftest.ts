// Interaction self-test in a real browser, real frames. Open /demo/selftest.html; results print on the page.
import "../src/element/index.ts"
import type { MultitoolSelectDetail } from "../src/element/index.ts"

const menu = document.querySelector("multitool-menu")!
const root = menu.shadowRoot!
const btn = root.querySelector<HTMLButtonElement>(".btn")!
const plates = () => Array.from(root.querySelectorAll<HTMLAnchorElement>(".plate"))
const out = document.getElementById("out")!
const results: string[] = []
let failed = 0

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const frames = (ms: number, each: () => void) =>
  new Promise<void>((done) => {
    const end = performance.now() + ms
    const f = () => {
      each()
      performance.now() < end ? requestAnimationFrame(f) : done()
    }
    requestAnimationFrame(f)
  })
const pointer = (el: Element, type: string) => el.dispatchEvent(new PointerEvent(type, { pointerType: "mouse", bubbles: false }))
function check(name: string, ok: boolean, info = "") {
  if (!ok) failed++
  results.push(`${ok ? "pass" : "FAIL"}  ${name}${info ? `  (${info})` : ""}`)
}

async function run() {
  btn.click()
  await wait(1500)
  check("opens on click", menu.open && menu.hasAttribute("open"))
  check("fans to 60 degrees", Math.abs(menu.frameOf(4).angle - 60) < 0.01, menu.frameOf(4).angle.toFixed(3))
  check("plates visible", plates().every((p) => p.style.visibility === "visible"))
  const btnBox = btn.getBoundingClientRect()
  const last = plates()[4].querySelector(".face")!.getBoundingClientRect()
  check("plates fan downward, below the button", last.bottom > btnBox.bottom + 100, `last plate bottom ${Math.round(last.bottom)} vs button ${Math.round(btnBox.bottom)}`)
  check("plates fan to the left of the button", last.left < btnBox.left, "")

  const p2 = plates()[2]
  const before = p2.getBoundingClientRect()
  pointer(p2, "pointerenter")
  await wait(800)
  const during = p2.getBoundingClientRect()
  check("hit area stays still while the plate lifts", Math.abs(before.x - during.x) < 0.01 && Math.abs(before.y - during.y) < 0.01)
  check("hovered plate lifted", menu.frameOf(2).lift > 0.99)
  check("other labels dimmed", menu.frameOf(0).dim > 0.99)

  pointer(p2, "pointerleave")
  const lifts: number[] = []
  await frames(1100, () => lifts.push(menu.frameOf(2).lift))
  let rises = 0, maxDrop = 0
  for (let i = 1; i < lifts.length; i++) {
    if (lifts[i] > lifts[i - 1] + 1e-9) rises++
    maxDrop = Math.max(maxDrop, lifts[i - 1] - lifts[i])
  }
  check("hover off: lift only falls", rises === 0, `${lifts.length} frames`)
  check("hover off: no jump between frames", maxDrop < 0.2, `largest step ${maxDrop.toFixed(3)}`)
  check("hover off: ends at rest", lifts[lifts.length - 1] === 0 && menu.frameOf(0).dim === 0)

  pointer(plates()[1], "pointerenter")
  await wait(600)
  pointer(plates()[1], "pointerleave")
  await wait(30)
  pointer(plates()[2], "pointerenter")
  let minDim = 1
  await frames(500, () => (minDim = Math.min(minDim, menu.frameOf(4).dim)))
  check("moving between plates never flashes the labels", minDim > 0.95, `min dim ${minDim.toFixed(3)}`)
  pointer(plates()[2], "pointerleave")
  await wait(400)

  let picked: MultitoolSelectDetail | null = null
  const onSelect = (e: Event) => {
    picked = (e as CustomEvent<MultitoolSelectDetail>).detail
    e.preventDefault()
  }
  menu.addEventListener("select", onSelect)
  plates()[3].click()
  await wait(1200)
  menu.removeEventListener("select", onSelect)
  check("pick fires select", (picked as MultitoolSelectDetail | null)?.index === 3 && (picked as MultitoolSelectDetail | null)?.label === "Journal")
  check("pick closes the menu", !menu.open && plates().every((p) => p.style.visibility === "hidden"))
  check("cancelled select keeps the page", location.hash === "")

  btn.click() // programmatic click = keyboard activation (detail 0)
  await wait(100)
  check("keyboard open focuses the first item", root.activeElement === plates()[0])
  plates()[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, composed: true }))
  check("arrow down moves to the next item", root.activeElement === plates()[1])
  plates()[1].dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }))
  check("escape closes and returns focus", !menu.open && root.activeElement === btn)

  btn.click()
  await wait(300)
  document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }))
  check("click outside closes", !menu.open)

  out.textContent = `${results.join("\n")}\n\n${failed ? `${failed} failed` : `all ${results.length} passed`}`
  document.body.dataset.done = failed ? "fail" : "pass"
}
run()
