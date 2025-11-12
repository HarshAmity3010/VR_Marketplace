
# VR_MarketPlace

## Project Overview

VR_MarketPlace is a decentralized marketplace for VR assets built on the Internet Computer (ICP). It allows users to create, list, buy, and manage VR assets using blockchain technology, with secure authentication and a modern web frontend.

## Features

- User authentication via Internet Identity (ICP)
- Create and list new VR assets with name, description, price, and image
- Buy and sell VR assets (ownership transfer)
- List assets for sale and remove from sale
- Delete owned assets
- View all assets in grid or list view
- Sort assets by price (low-high, high-low) or newest
- Responsive and modern UI (React + Vite)
- Rust-based backend canister for asset management
- Secure principal-based ownership and transactions

## Technology Stack

### Frontend
- React 18
- Vite (build tool)
- TypeScript (type safety)
- Sass (styling)
- @dfinity/agent, @dfinity/auth-client, @dfinity/candid (ICP integration)
- Internet Identity for authentication
- Vitest, Testing Library (testing)

### Backend (Canister)
- Rust (main logic)
- ic-cdk, ic-cdk-macros (ICP smart contract SDK)
- Candid (IDL for canister interface)
- serde (serialization)

### DevOps & Tooling
- DFX (Internet Computer SDK)
- Node.js & npm (package management)
- Workspace monorepo structure

## How to Run

1. Install DFX, Node.js, and npm (see ICP docs)
2. Clone this repo and run `npm install` in the root and frontend folder
```markdown
# VR_MarketPlace

## Project overview

VR_MarketPlace is a small, decentralized marketplace for VR assets built on the Internet Computer (IC). The backend is a Rust canister that stores asset records and enforces ownership; the frontend is a Vite + React app that integrates Internet Identity for passwordless login. This repo now includes a complete project report, diagram sources and exports, and helper scripts to generate a Word report and render diagrams.

This README highlights the recent additions and how to use them.

## New documentation & assets

- `docs/VR_Marketplace_Report.md` — The full internship/project report (SIP-style) covering background, design, implementation, testing, and future scope.
- `docs/VR_Marketplace_Report.docx` — A native Word (.docx) export of the report generated from the Markdown.
- `docs/figures/` — Mermaid source files (.mmd) and rendered PNGs for architecture, sequences, class diagrams, UI screenshots, and more.

## Helpful scripts (root package.json)

The root package.json includes scripts to generate the report and render diagrams. From the repository root run:

```bash
# generate a simple HTML report from Markdown
npm run export:report

# generate a native Word document (docx) from the Markdown (uses the native docx builder)
npm run export:docx

# render diagrams (uses the Kroki remote renderer); requires internet access
npm run export:diagrams

# attempt local mermaid-cli rendering (requires mermaid-cli and system libs for headless Chromium)
npm run export:diagrams:local
```

Notes:
- `export:docx` uses `scripts/export-report-docx-native.mjs` and the `docx` package to build a Word document that embeds images found in `docs/figures/`.
- `export:diagrams` posts Mermaid files to Kroki and saves PNGs to `docs/figures/`. This avoids needing headless Chromium on the host. The local command `export:diagrams:local` uses `mermaid-cli` and requires additional OS dependencies (headless Chromium libraries).

## Dependencies for report/diagram scripts

Install Node dependencies (root):

```bash
npm install
```

Key devDependencies used by the export scripts are already in `package.json`:
- `marked` — Markdown tokenizer/renderer
- `docx` — Native .docx generation
- `@mermaid-js/mermaid-cli` (optional) — local rendering (needs OS libs)

If you prefer not to install headless Chromium dependencies, use `npm run export:diagrams` (Kroki) which only needs network access.

## Where to find diagrams and screenshots

- `docs/figures/` contains both Mermaid source (`*.mmd`) and rendered PNGs (`*.png`) such as:
  - `fig01_architecture.png`
  - `class_diagram.png`
  - `flow_login.png`
  - `fig11_ui_grid.png`, `fig12_ui_create_form.png`, `fig13_ui_list_sort.png`, `fig14_ui_purchase_success.png`

Drop new screenshots into `docs/figures/` and re-run `npm run export:docx` to embed them in the Word report.

## Project structure (high level)

- `src/VR_MarketPlace_backend/` — Rust canister implementation and `*.did` Candid interface
- `src/VR_MarketPlace_frontend/` — Vite + React frontend
- `docs/` — report Markdown, Word export, figures and sources
- `scripts/` — helpers to export report and render diagrams

## Development quick-start (IC local)

```bash
# start local replica
dfx start --clean --background

# deploy canisters
dfx deploy

# start frontend dev server (from frontend folder)
cd src/VR_MarketPlace_frontend
npm install
npm run dev
```

You can then open the app at the port shown by Vite (usually http://localhost:5173).

## Notes and troubleshooting

- If `npm run export:diagrams:local` fails with Chromium errors (missing libs like `libasound.so.2`), use `npm run export:diagrams` (Kroki) or install the missing system packages.
- If Word reports an error opening the generated `.docx`, try regenerating with `npm run export:docx` (the native exporter is designed to be robust). If problems persist, open `docs/VR_Marketplace_Report.md` for the source Markdown.

## Contributing

If you add diagrams, tests, or documentation, please:

1. Place figures under `docs/figures/` (source `.mmd` plus `.png`).
2. Update `docs/VR_Marketplace_Report.md` where necessary.
3. Re-run `npm run export:docx` to refresh the Word export.

## References and further reading

- Internet Computer docs: https://internetcomputer.org/docs/current/
- DFINITY examples and community resources: https://github.com/dfinity/examples

---

This README was updated to reflect the report generation and diagram tooling added to the project. If you'd like, I can also add a small `CONTRIBUTING.md` or `docs/README-export.md` with step-by-step screenshots for running the export scripts.
```
