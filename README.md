# Heeya Kapadia — Portfolio

Static website. No build step. Every page is self-contained: images, scripts and interactions are embedded inside each .html file, so there are no sub-folders to upload.

## Files
- index.html — Home (entry point)
- chalo.html — Project 01, Chalo case study
- expense.html — Project 02, Employee Expense Reimbursement case study
- wireframe.html — Expense Portal wireframe (opens from the Solution section of expense.html)
- .nojekyll — tells GitHub Pages to serve files as-is

Keep all four .html files together in the same folder.

## Needs internet
- Google Fonts (Bricolage Grotesque, Instrument Sans). Offline, a fallback font is used.
- Figma, LinkedIn and email links.

## Publish on GitHub Pages
1. Create a public repository.
2. Add file → Upload files → drag in index.html, chalo.html, expense.html, wireframe.html (and .nojekyll) → Commit.
3. Settings → Pages → Deploy from a branch → Branch: main, folder: / (root) → Save.
4. After a minute the site is live at https://<username>.github.io/<repository>/
