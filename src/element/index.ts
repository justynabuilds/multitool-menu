import { MultitoolMenuElement } from "./multitool-menu-element.ts"

export { MultitoolMenuElement }
export type { MultitoolSelectDetail } from "./multitool-menu-element.ts"

if (!customElements.get("multitool-menu")) customElements.define("multitool-menu", MultitoolMenuElement)

declare global {
  interface HTMLElementTagNameMap {
    "multitool-menu": MultitoolMenuElement
  }
}
