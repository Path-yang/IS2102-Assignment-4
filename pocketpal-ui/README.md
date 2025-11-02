# PocketPal Capture Expense UI

React + Vite single-page app that demonstrates the expense capture journey for the PocketPal assignment. The screen lets users switch between scanning a receipt (with mocked OCR output) and typing the expense manually, then review and save it as a draft.

## Scripts
```bash
npm install    # install dependencies
npm run dev    # start local dev server (http://localhost:5173)
npm run build  # create production-ready assets in dist/
npm run preview  # preview the build locally
```

## Key files
- `src/App.jsx` - main layout, state handling for scan/manual flows, and saved expenses
- `src/App.css` - component styling and responsive design tokens
- `src/index.css` - global styles and background treatment

## Features showcased
- Simulated OCR extraction with status messaging and editable fields
- Manual entry path with the same validation logic
- Up-front review panel that recalculates totals as fields change
- Draft list of saved expenses so the flow looks complete in screenshots

Use your browser's device toolbar to capture the mobile view required for the submission. No backend is required; all interactions are client-side only.
