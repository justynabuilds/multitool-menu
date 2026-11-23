import "../src/element/index.ts"
import type { MultitoolSelectDetail } from "../src/element/index.ts"

// The demo swaps the hero instead of navigating, so the whole round trip can be tried on one page.
const PAGES: Record<string, [string, string]> = {
  "#work": ["Selected pieces, 2019 to now.", "Tables, shelving and a few chairs, each built for a particular room."],
  "#services": ["Made to measure, start to finish.", "We draw it, build it in oak or steel, and fit it ourselves."],
  "#about": ["A workshop of four.", "Two cabinetmakers, a welder and someone who answers the phone."],
  "#journal": ["Notes from the bench.", "Joints, finishes and the occasional mistake, written up monthly."],
  "#contact": ["Tell us about the room.", "Send a photo and rough measurements. We reply within two days."],
}

const menu = document.querySelector("multitool-menu")!
const hero = document.getElementById("hero")!
const title = document.getElementById("title")!
const lede = document.getElementById("lede")!
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches

menu.addEventListener("select", (e) => {
  const { href } = (e as CustomEvent<MultitoolSelectDetail>).detail
  const page = href && PAGES[href]
  if (!page) return
  e.preventDefault()
  hero.classList.add("swap")
  setTimeout(() => {
    ;[title.textContent, lede.textContent] = page
    hero.classList.remove("swap")
  }, reduce ? 0 : 300)
})
