import "../src/element/index.ts"
import type { MultitoolSelectDetail } from "../src/element/index.ts"

// The demo swaps the hero instead of navigating, so the whole round trip can be tried on one page.
export const PAGES: Record<string, [string, string]> = {
  "#work": ["Selected pieces, 2019 to now.", "Tables, shelving and chairs, each built for one room."],
  "#services": ["Made to measure, start to finish.", "We draw it, build it and fit it ourselves."],
  "#about": ["A workshop of four.", "Two cabinetmakers, a welder and someone who answers the phone."],
  "#journal": ["Notes from the bench.", "Joints, finishes and the odd mistake, monthly."],
  "#contact": ["Tell us about the room.", "Send a photo and rough sizes. We reply within two days."],
}

/** Wires a demo site: picking a page in the menu (or a hero link) swaps the headline. */
export function wireSite(scope: ParentNode) {
  const menu = scope.querySelector("multitool-menu")!
  const copy = scope.querySelector<HTMLElement>(".hero-copy")!
  const h = scope.querySelector<HTMLElement>(".h")!
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
  const show = (href: string | null) => {
    const page = href ? PAGES[href] : undefined
    if (!page) return false
    copy.classList.add("swap")
    setTimeout(() => {
      h.innerHTML = `${page[0]} <span>${page[1]}</span>`
      copy.classList.remove("swap")
    }, reduce ? 0 : 300)
    return true
  }
  menu.addEventListener("select", (e) => {
    if (show((e as CustomEvent<MultitoolSelectDetail>).detail.href)) e.preventDefault()
  })
  scope.querySelectorAll<HTMLAnchorElement>("[data-page]").forEach((a) =>
    a.addEventListener("click", (e) => { if (show(a.dataset.page!)) e.preventDefault() }),
  )
  return menu
}

if (document.getElementById("site")) wireSite(document)
