# HomeSHINE Admin

An internal back-office prototype for HomeSHINE exterior cleaning: customers, employees, jobs, a quote builder with per-service assessment forms and a pricing engine, cost-of-goods tracking, a market price comparison, and PDF export of quotes.

**Live:** https://homeshine-admin.vercel.app

> This was the first admin prototype. The current HomeSHINE site and field app live in [`asheesh8/homeShineV2`](https://github.com/asheesh8/homeShineV2).

## Tech stack

- Vite 6 + React 18 (JavaScript), React Router 6
- All state in one React context (`src/context/AppContext.jsx`) persisted to the browser's `localStorage` — there is no back end, so data stays on the device that entered it
- `jspdf` for quote PDFs (`src/utils/pdfExport.js`)
- No environment variables

## Project layout

```
src/pages/quotes/               Quote builder, service picker, assessment forms
src/pages/quotes/services/pricingEngine.js   How a quote price is calculated
src/pages/{customers,employees,jobs}/        CRUD lists and forms
src/pages/cog/, src/pages/market/            Cost of goods and market comparison
src/data/                       Default costs and market price data
src/utils/                      Calculations and PDF export
```

## Local setup

```bash
npm install
npm run dev
npm run build    # output in dist/
```

## Deploying

Vercel with the stock Vite preset (`vercel.json` adds the SPA rewrite); pushes to `main` deploy to production.
