# Aivoryx Insurance — Health Insurance Comparison (Demo)

React + TypeScript + Vite + Tailwind frontend, small Express backend proxy, real data from the
[World Best Insurer demo API](https://worldbestinsurer.com/developers/). No mock data anywhere.

## Run
```
npm install
cp .env.example .env      # already provided; key is the public demo key
npm run dev               # frontend http://localhost:5173, backend http://localhost:8787
```
Production: `npm run build && npm start` (Express serves `dist/` and the API on one port, default 8787).

## Pages
`/` landing · `/search` requirements form · `/plans` results (filters, sort, compare) · `/plans/:id` details ·
`/compare` · `/insurers` · `/assistance` (demo form, nothing stored) · `/debug/api` (connection diagnostics)

## Notes
* Demo key is limited to 100 requests/day; the backend caches for 10 minutes.
* The API does not return benefits detail, waiting periods, exclusions, claim settlement values, logos or
  insurer descriptions, so those show "Not provided" (or are hidden). Nothing is invented.
* Premiums are the API's illustrative ranges (with its stated assumptions), not live quotes.
* Rebrand: `src/config/brand.ts` and the colour tokens in `src/index.css`.
See `docs/ARCHITECTURE.md`.
