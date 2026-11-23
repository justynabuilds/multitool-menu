import { defineConfig } from "vite"

// Library build: one script a buyer can drop into any site.
//   dist/multitool-menu.js       ESM   (import "…/multitool-menu.js")
//   dist/multitool-menu.iife.js  classic <script src> for Webflow embeds, WordPress, Squarespace, Shopify…
export default defineConfig({
  build: {
    lib: {
      entry: "src/element/index.ts",
      name: "MultitoolMenu",
      formats: ["es", "iife"],
      fileName: (format) => (format === "es" ? "multitool-menu.js" : "multitool-menu.iife.js"),
    },
    outDir: "dist",
    emptyOutDir: true,
    target: "es2020",
  },
})
