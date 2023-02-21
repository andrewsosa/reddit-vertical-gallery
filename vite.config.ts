import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

const basePath = process.env.GH_PAGES ? "/reddit-vertical-gallery/" : "/";

// https://vitejs.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [svelte()],
});
