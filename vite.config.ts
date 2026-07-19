import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths — safe for any host, including a subpath.
  // For a GitHub Pages *project* site (https://<user>.github.io/datum/),
  // you may instead set: base: '/datum/'. HashRouter is already used, so
  // client-side routing works with no server rewrites either way.
  base: './',
  plugins: [react()],
});
