import { defineConfig } from "vite"
import { resolve } from "node:path"

// Demo site build (what Vercel serves): the Alder demo at / and the interaction self-test at /demo/selftest.html
export default defineConfig({
  build: {
    outDir: "site-dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        selftest: resolve(import.meta.dirname, "demo/selftest.html"),
      },
    },
  },
})
