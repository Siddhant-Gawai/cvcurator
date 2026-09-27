# Folio CV Studio

A device-local CV builder using React, TypeScript, Vite, Tailwind CSS, HeroUI, Zustand, React Hook Form, Zod, dnd-kit, and React PDF.

## Run

Requires Node.js 22.12+ or 24.

```sh
pnpm install
pnpm dev
```

Create a production build with `pnpm build`. Serve the generated `dist` directory with any static host. No backend or API keys are required.

## Implementation

- Zustand owns the CV document. Mounted React Hook Form controllers own input editing and immediately commit changes to the document. Versioned local storage restores work; older settings are migrated with schema defaults.
- The preview and download use the same PDF blob, produced by `src/pdf.tsx`. Generation is debounced and serialized. PDF.js displays the resulting pages; exported text remains selectable and links remain clickable.
- JSON backups include content, order, visibility, and design. Zod validates imports before asking to replace the current CV.
- All 24 Google Fonts and their regular, bold, italic, and bold-italic files are bundled under `public/fonts`, alongside their licenses. No external font service is contacted by the running app. `scripts/download-fonts.mjs` refreshes these assets.
- Interface icons are Lucide icons. CV contact icons are PDF vectors and can be switched off.

The app saves to this browser on this device. Export a JSON backup before clearing browser data or moving to another browser. No automated test files are included, as requested.
