# PocketPal Capture Expense Prototype

Interactive web prototype for the IS2102 Assignment 4 brief. The interface demonstrates how users can capture an expense either by scanning a receipt or by typing the details manually. It mirrors the flows from the **C.2 capture expense via receipt scan** use case while adding a parallel manual-entry path.

## Repository layout
- `pocketpal-ui/` - Vite + React app that renders the prototype
  - `src/App.jsx` - core screen layout and interactions
  - `src/App.css` & `src/index.css` - styling and responsive behaviour

## Run locally
```bash
cd pocketpal-ui
npm install
npm run dev
```
The dev server opens at `http://localhost:5173`. Use your browser's device tools (F12) to capture the mobile view required for the submission.

## Production build
```bash
cd pocketpal-ui
npm run build
```
This verifies the app is ready for deployment and outputs static assets to `dist/`.

## Feature notes
- Dual paths for capturing expenses: simulated receipt OCR with auto-filled fields, or manual entry for cash/unreadable receipts.
- Review panel keeps totals, categories, and notes visible while editing.
- Saved list mimics draft expenses so you can showcase end-to-end confirmation.
- Layout is responsive for desktop and mobile to match the assignment's wireframe-to-screen expectation.
