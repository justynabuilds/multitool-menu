import "../src/element/index.ts"

// Open once shortly after load so the first view shows the fan; after that it is the visitor's.
const menu = document.querySelector<HTMLElementTagNameMap["multitool-menu"]>("#stage multitool-menu")
if (menu) setTimeout(() => { if (!menu.open) menu.open = true }, 600)
