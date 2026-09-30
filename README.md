# CV Curator

A browser-based CV builder for students and early-career professionals. Edit your content, preview the paginated document, and download a PDF without an account or backend. The interface currently carries the Folio branding.

**Live app:** https://siddhant-gawai.github.io/cvcurator/

## Features

- Desktop editor and live preview side by side; editing and preview modes on smaller screens.
- Realistic example content, a Start blank option, and reset confirmation.
- Contact details, summary, education, experience, projects, skills, certifications, and languages.
- Add, edit, hide, delete, and reorder entries and content sections. Drag handles support keyboard reordering; entries also have move controls.
- Essential and Modern templates, A4 and US Letter paper, custom accent color, font size, line spacing, and page margins.
- 24 bundled Google Font families with regular, bold, italic, and bold-italic variants. Fonts load from the app's own assets.
- Zoom controls and an expanded preview popup. Click the resume to open it; use the close button, Escape, or the backdrop to dismiss it.
- Optional Font Awesome contact icons, including the LinkedIn brand icon, rendered as PDF vector paths.
- Automatic browser-local saving and JSON backup export/import with validation and replacement confirmation.

## Recent updates

- **2026-10-01:** PDF generation errors are scoped to the document version that failed. Editing the CV clears the obsolete error while the next preview is generated, late failures from older versions are ignored, and a failed generation no longer remains marked as updating.
- **2026-09-30:** Preview PDF loading now depends only on the document blob. Updating the page-count callback no longer destroys and reloads the same PDF during parent rerenders, avoiding unnecessary work in the expanded preview.
- **2026-09-29:** Dropdown triggers now display the selected option's icon. Controls and options without icons no longer reserve an empty icon slot. Decorative icons are hidden from screen readers, leaving the option labels as their accessible text.
- Footer alignment applies to a lone name, email, or page number; multiple items retain their fixed positions. Footer contact values stay synchronized with the contact form.

## Footer

Enable the footer under **Design > Footer**, then select name, email, and/or page number using their individual checkboxes.

- Name and email automatically follow the current contact details.
- With exactly one item selected, the icon-only alignment controls position it left, center, or right. The label identifies the selected item.
- With multiple items selected, alignment controls are disabled: name stays left, page number stays centered, and email stays right.
- With no items selected, the footer is empty and alignment is disabled.
- The shared PDF document renders the footer on every page in both preview and download.

## Run locally

Use Node.js 24 (recommended; Vite also supports Node.js 22.12+) and pnpm 10.

```sh
git clone https://github.com/Siddhant-Gawai/cvcurator.git
cd cvcurator
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:5173/cvcurator/. The `/cvcurator/` base path is configured in `vite.config.ts` for GitHub Pages.

```sh
pnpm build
pnpm exec vite preview --host 127.0.0.1
```

The build runs TypeScript checking and writes the production site to `dist/`. The preview command serves it locally, normally at http://127.0.0.1:4173/cvcurator/. No backend, API keys, login, payments, or AI writing features are required or included.

## PDF preview and export

`src/pdf.tsx` defines one React PDF document for preview and download. `src/Preview.tsx` debounces regeneration by 550 ms and serializes PDF generation so typing remains responsive. PDF.js draws the generated pages on canvas for the preview; downloads use the actual PDF blob with selectable text and links, not screenshots.

The document supports automatic pagination, heading-presence rules, and widow/orphan controls. Review long documents and unusual content before sending them. The app does not guarantee ATS compatibility or provide an ATS score.

## Theme

The Executive Blueprint palette is defined in [`src/theme.css`](src/theme.css). Main tokens include:

| Token | Purpose |
| --- | --- |
| `--theme-primary`, `--theme-primary-hover` | Navy primary controls and hover state |
| `--theme-secondary` | Teal secondary states |
| `--theme-background`, `--theme-surface`, `--theme-surface-muted`, `--theme-surface-blue` | Workspace surfaces |
| `--theme-text`, `--theme-text-muted` | Interface text |
| `--theme-border`, `--theme-focus` | Borders and focus color |
| `--theme-accent`, `--theme-success`, `--theme-danger` | Semantic palette values |
| `--theme-radius-control`, `--theme-radius-card` | Shape tokens |

`src/styles.css` consumes these variables, and HeroUI's main accent maps to `--theme-primary`. Change the tokens to update their consumers. Some older rules still contain literal colors and radii, so theme centralization is not yet complete. The CV's document accent remains separate from the website theme.

## Storage and backups

Zustand owns the CV document and persists it under `folio-cv-v1` using a versioned store. React Hook Form manages active input drafts and commits edits to the store; Zod validates document data and imported backups.

CV content is stored in the current browser on the current origin. It is not uploaded to an application backend or synchronized across devices. The local development site and GitHub Pages have separate storage. Use **Backup > Export backup** and **Import backup** to transfer your CV between them. Export a backup before clearing browser data or switching browsers.

## GitHub Pages

[`Deploy GitHub Pages`](.github/workflows/pages.yml) runs on pushes to `main` and can also be started manually from GitHub Actions. It installs dependencies with pnpm 10 and Node.js 24, builds the app, uploads `dist/`, and deploys it to the `github-pages` environment.

Repository **Settings > Pages > Source** should be **GitHub Actions**. Do not publish the unbuilt repository root as the website.

If the repository name or deployment location changes, update Vite's `base`. PDF font URLs use `import.meta.env.BASE_URL`, and the bundled font stylesheet uses relative URLs so fonts work under the repository subpath.

## Project structure

| Path | Responsibility |
| --- | --- |
| `src/App.tsx` | Workspace, navigation, backups, and preview popup |
| `src/Forms.tsx` | Contact and section editing |
| `src/Design.tsx` | Document design and footer controls |
| `src/model.ts` | Zod schemas, defaults, example data, backup format |
| `src/store.ts` | State ownership and local persistence |
| `src/pdf.tsx` | Shared PDF document and vector icons |
| `src/Preview.tsx` | Debounced PDF generation and preview rendering |
| `src/fonts.ts`, `public/fonts/` | Font registration, assets, and font licenses |
| `src/theme.css`, `src/styles.css` | Theme tokens and interface styling |
| `scripts/download-fonts.mjs` | Refreshes bundled Google Font assets |

## Current limitations

- The Colors section's Full page/Header/Border buttons are currently visual placeholders. Accent presets and custom hex color work, but the per-element accent-target selections are not yet applied by the PDF renderer.
- Contact icons use Font Awesome solid/brand paths. The existing icon-style dropdown does not switch these paths to outlined, rounded, sharp, or two-tone variants.
- Theme tokens cover the main interface, but some legacy styles still need conversion to variables.
- There is no service worker or guaranteed offline reload support; local data storage does not imply the site itself is cached offline.
- No automated tests are included. `pnpm build` checks TypeScript and production bundling; visual checks of editing, PDF output, and responsive layouts remain manual.

## Stack and asset licenses

React, TypeScript, Vite, Tailwind CSS, HeroUI, Zustand, React Hook Form, Zod, dnd-kit, React PDF, and PDF.js. Interface icons use Lucide; PDF contact icons use the free Font Awesome solid and brands packages. Font licenses are bundled with the files under `public/fonts/`; third-party icons and libraries retain their respective licenses.
