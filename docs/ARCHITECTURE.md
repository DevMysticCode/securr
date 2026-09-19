# Architecture

```
Browser -> React frontend (src/) -> Our backend (server/) -> Provider (World Best Insurer) -> Real catalogue data
```

* The browser only calls `/api/*` on our backend. The provider API key lives in `.env` (backend only,
  never `VITE_`-prefixed) and is never sent to the browser or shown in the debug page.
* `server/providers/InsuranceProvider.ts` is the abstraction. `WorldBestInsurerProvider` is the only
  implementation. To add `DeployitProvider` / `DirectInsurerProvider`: implement the interface and
  select it in `server/providers/index.ts`. The frontend consumes the provider-neutral model in
  `shared/types.ts`, so it does not change.
* Every field in the model is optional. The UI renders only what a provider returns and says
  "Not provided" otherwise; filters/sorts/compare rows are derived from the data actually present.
* Backend caches successful responses for `CACHE_TTL_SECONDS` (default 600) because the demo key allows
  100 requests/day. Errors are never cached and never replaced by fallback data.

## Growing into the full platform

| Area | Where it goes |
| --- | --- |
| Public website | `src/pages`, `src/app/Layout.tsx` (exists) |
| Insurance comparison | `src/features/health-comparison` (exists); add `term-life`, `motor`... as sibling features |
| Customer / Partner / Employee / Admin portals | Sibling route trees in `src/app/App.tsx` with their own layouts + auth guards |
| CRM, Quotes, Applications, Policies, Renewals, Claims, Commissions | One folder each under `src/features/*` and `server/routes/*`, backed by a database; extend `InsuranceProvider` with `getQuotes`, etc. |
| Branding | `src/config/brand.ts` (name/copy) and colour tokens in `src/index.css` |
