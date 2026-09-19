# Aivoryx Insurance — Health Insurance Comparison (Demo)

React + TypeScript + Vite + Tailwind frontend, small backend proxy (Express locally, Vercel functions when deployed), real data from the
[World Best Insurer demo API](https://worldbestinsurer.com/developers/). No mock data anywhere.

Categories (India, `country=in`): **health, term-life, motor, travel**.

## Run
```
npm install
cp .env.example .env      # already provided; key is the public demo key
npm run dev               # frontend http://localhost:5173, backend http://localhost:8787
```
Production: `npm run build && npm start` (Express serves `dist/` and the API on one port, default 8787).

## Pages
`/` landing · `/:category/search` requirements form · `/:category/plans` results (filters, sort, compare) · `/:category/plans/:id` details ·
`/:category/compare` · `/insurers` · `/assistance` (demo form, nothing stored) · `/debug/api` (per-category connection diagnostics)
(`:category` is one of `health`, `term-life`, `motor`, `travel`; old `/plans` style URLs redirect to `/health/...`)

## Notes
* Demo key is limited to 100 requests/day; the backend caches for 1 hour locally and 6 hours at the Vercel edge.
* Premiums are treated as INR (India catalogue; the API has no premium-currency field). Travel cover amounts are USD, as the API states; motor has no cover amounts.
* The API does not return benefits detail, waiting periods, exclusions, claim settlement values, logos or
  insurer descriptions, so those show "Not provided" (or are hidden). Nothing is invented.
* Premiums are the API's illustrative ranges (with its stated assumptions), not live quotes.
* Rebrand: `src/config/brand.ts` and the colour tokens in `src/index.css`.
See `docs/ARCHITECTURE.md`.
