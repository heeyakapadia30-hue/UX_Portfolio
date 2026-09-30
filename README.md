# Heeya Kapadia — Portfolio

Static website. No build step.

## Pages
- index.html — Home (entry point)
- chalo.html — Project 01, Chalo case study
- expense.html — Project 02, Employee Expense Reimbursement case study
- wireframe.html — Expense Portal wireframe (opens from the Solution section of expense.html)

## Folders
- js/runtime.js — renders the pages (loads React 18 from unpkg.com)
- js/site.js — interactions: reveals, lightbox, zoom/pan, page transitions, nav highlight
- images/ — all photos, UI screens, diagrams and icons

## External services (need internet)
- Google Fonts: Bricolage Grotesque, Instrument Sans
- unpkg.com: React 18.3.1 and ReactDOM (loaded by js/runtime.js)

## Publish on GitHub Pages
1. Create a public repository and upload the contents of this folder to the root (index.html at the top level, plus .nojekyll).
2. Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main, folder: / (root) → Save.
3. After a minute the site is live at https://<username>.github.io/<repository>/
