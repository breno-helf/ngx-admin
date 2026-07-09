# Angular 14 → 18 Migration Playbook — ngx-admin

> **Deliverable type:** phased migration plan only. **No migration code is executed by this document.**
> Sources cross-referenced: [Angular Update Guide](https://angular.dev/update-guide),
> per-version guides (`update-to-version-16/17/18`), the
> [Angular Material MDC migration guide](https://material.angular.dev/guide/mdc-migration),
> and a DeepWiki map of breaking changes against **this** repository.

---

## 0. Reality check — brief vs. actual repository state

The upgrade brief describes a scenario that does **not** fully match the code in this repo. These
discrepancies change the plan and are called out so nobody plans against false premises.

| Brief says | Actual repo (`package.json`, `angular.json`) | Impact on plan |
|---|---|---|
| Starting on **Angular 14** | **Angular 15.2.10** (`@angular/core ^15.2.10`, CLI 15.2) | Real hops are **15→16→17→18**. 14→15 is documented only as a "verify starting point" note in Phase 0 for any downstream app still on 14. |
| **Angular Material** app needing **MDC migration** | **No `@angular/material`.** UI is **Nebular** (`@nebular/theme@11`) on top of `@angular/cdk@15` | The MDC migration is **N/A for this app**. It is retained as a **conditional** Phase 5 that only applies to the shared design-system library *if that library actually uses Material*. |
| Shared **`libs/ui`** design-system library in a monorepo | **Single Angular app** (`ngx-admin-demo`), no `libs/`, no Nx | "Design-system public API" is interpreted as the Nebular theming/customization surface under `src/app/@theme`. Public-API-stability rules are applied there. |
| Deep **SSO/MFA auth**, proprietary **analytics SDK**, third-party **financial data providers** | Only the **demo `@nebular/auth`** module; no analytics SDK; no financial providers | "High-risk integrations" are re-mapped to the real third-party deps present (see §High-Risk Inventory). The SSO/MFA/analytics/financial guidance still applies verbatim to the real banking app this repo stands in for. |
| Branch **`main`** | Default branch is **`master`** | Issues/PRs target `master`. |

**Net effect:** the *phase structure and validation discipline transfer directly* to the real
banking app, but the file-level specifics below are for ngx-admin.

---

## Dependency compatibility matrix (the real gate)

Every Angular major hop is gated by a **matching Nebular major**. This is the linchpin dependency —
if the matching Nebular release did not exist, the hop would be blocked.

| Angular | Nebular | @angular/cdk | Node (min) | TypeScript | Notes |
|---|---|---|---|---|---|
| 15 (current) | 11.0.1 | 15 | 14.20 / 16 / 18 | 4.8–4.9 | current baseline |
| 16 | **12.0.0** | 16 | 16 / 18 | 4.9–5.1 | **ngcc removed**, `node-sass` unsupported |
| 17 | **13.0.0** | 17 | 18.13+ | 5.2–5.4 | new esbuild app builder, built-in control flow (opt-in) |
| 18 | **14.0.0** | 18 | 18.19+ / 20.9+ | 5.4–5.5 | Nebular 14 released 2024-08-07 |

Verify the exact patch of each Nebular major supports the Angular patch before each hop
(`npm view @nebular/theme@14 peerDependencies`).

---

## High-Risk Integration Inventory (flag & handle with care)

Files touching these must be reviewed by a human and validated manually — several are the real
blockers of this migration. In the actual banking app, substitute SSO/MFA, analytics SDK and
financial-provider files here.

| Integration | Version in repo | Risk | Key files |
|---|---|---|---|
| **ng2-smart-table** | 1.6.0 | **BLOCKER** — unmaintained, incompatible with Angular 16+ (depends on `ng2-completer`, which needs the removed `ngcc`). Must migrate to the `angular2-smart-table` fork (breaking API + selector renames). | `src/app/pages/tables/tables.module.ts`, `src/app/pages/tables/smart-table/smart-table.component.ts` + `.html` |
| **angular2-chartjs** | 0.4.1 | **BLOCKER** — View-Engine-era, unmaintained; breaks under Ivy-only APF in 16+. Replace with `ng2-charts`/native chart.js or remove. | `src/app/pages/e-commerce/e-commerce.module.ts`, `src/app/pages/charts/charts.module.ts` |
| **ckeditor 4 + ng2-ckeditor** | 4.7.3 / ~1.2.9 | High — CKEditor 4 is **EOL** (security). Upgrade path is CKEditor 5 (`@ckeditor/ckeditor5-angular`) = rewrite, or isolate. | `src/app/pages/editors/ckeditor/*`, `editors.module.ts` |
| **tinymce** | 4.5.7 | High — TinyMCE 4 EOL; global typings in `src/typings.d.ts`. | `src/app/@theme/components/tiny-mce/*`, `src/app/pages/editors/tiny-mce/*`, `src/typings.d.ts` |
| **ngx-echarts** | 4.2.2 | Medium — needs ≥8 for Angular 16+; API/provider changes (`provideEchartsCore`). | `src/app/pages/charts/echarts/*`, `charts.module.ts`, `e-commerce.module.ts`, `maps.module.ts`, `dashboard.module.ts` |
| **@swimlane/ngx-charts** | 14.0.0 | Medium — bump to ≥20 for Angular 16+. | `src/app/pages/charts/d3/*`, `charts.module.ts`, `e-commerce.module.ts` |
| **@asymmetrik/ngx-leaflet** | 3.0.1 | Medium — unmaintained; moved to `@bluehalo/ngx-leaflet`. | `src/app/pages/maps/leaflet/*`, `src/app/pages/e-commerce/country-orders/map/*`, `maps.module.ts` |
| **@angular/google-maps** | 12.2.13 | Medium — **3 majors behind** app already; must track Angular major each hop. | `src/app/pages/maps/maps.module.ts`, `src/app/app.module.ts` |
| **@nebular/auth / @nebular/security** | 11.0.1 | High (stand-in for SSO/MFA) — auth wiring; token/strategy config must be re-validated each hop. | `src/app/app-routing.module.ts`, `src/app/@core/core.module.ts`, `src/app/@theme/theme.module.ts` |
| **node-sass** | 4.14.1 | **BLOCKER** — native, deprecated, will not build on Node 18/20; Angular 16 dropped node-sass support. Replace with Dart `sass`. | `package.json`, all `.scss` (compile only) |

> **Testing gap (critical risk):** there are **0 `*.spec.ts`** unit tests in `src/` and e2e uses
> **Protractor** (EOL, no Angular 17+ builder). Validation currently rests almost entirely on
> `build:prod` succeeding + manual smoke testing. Phase 0 adds a smoke-test safety net before any
> version bump.

---

## Phase overview

| Phase | Title | Complexity | Gate |
|---|---|---|---|
| 0 | Pre-flight & baseline hardening | **M** | build + smoke tests green on Angular 15 |
| 1 | Angular 15 → 16 (+ Nebular 12) — the hard hop | **L** | prod build + smoke green, node-sass gone |
| 2 | Angular 16 → 17 (+ Nebular 13) | **M** | prod build + smoke green |
| 3 | Angular 17 → 18 (+ Nebular 14) | **M** | prod build + smoke green |
| 4 | High-risk third-party integrations | **L** | each integration validated manually |
| 5 | Angular Material MDC migration (**conditional**) | **M** | design-system lib only; N/A for this app |
| 6 | Post-migration validation, cleanup & modernization | **S–M** | full regression sign-off |

Phases 0→3 are strictly sequential. Phase 4 work is **interleaved** into the phase where a library
hard-blocks (ng2-smart-table/angular2-chartjs land in Phase 1); the remainder is scheduled in Phase 4.
Phase 5 is conditional. Phase 6 closes out.

---

## Phase 0 — Pre-flight & baseline hardening

**Goal:** freeze a known-good baseline and remove build-blocking legacy tooling *before* touching Angular.

**Complexity:** M

**Commands**
```bash
# confirm the real starting point (brief said 14; verify)
npx ng version
node -v            # ensure Node 18.x LTS for the whole migration

# clean, reproducible install
npm ci

# baseline builds must pass BEFORE any change
npm run build              # dev build
npm run build:prod         # AOT prod build
npm run lint               # eslint (tslint is dead weight, see below)

# Remove the node-sass blocker early (Dart Sass is a drop-in for these stylesheets)
npm uninstall node-sass
npm install -D sass
# remove the "postinstall" ngcc script from package.json (ngcc is removed in v16 anyway)

# Dead tooling cleanup (already migrated to eslint per angular.json)
npm uninstall tslint codelyzer tslint-language-service
# delete tslint.json; remove the tslint-language-service plugin block from tsconfig.json
```

**Files/components affected**
- `package.json` — drop `node-sass`, `rxjs-compat`, `tslint`, `codelyzer`, `tslint-language-service`, `postinstall`/ngcc script; add `sass`.
- `tsconfig.json` — remove `plugins: [{ name: "tslint-language-service" }]`.
- `tslint.json` — delete.
- `README.md` — update the "NodeJS 14.14+ because of node-sass" note.
- Add a minimal smoke-test safety net (this is the single most important risk mitigation):
  - a handful of `*.spec.ts` `TestBed` bootstrap tests for `AppComponent`, `@core/core.module`, `@theme/theme.module`, and one page module each for tables/charts/maps/editors, **or**
  - a Playwright/Cypress smoke suite that boots the app and visits the main routes.

**Validation**
- `npm run build:prod` succeeds with Dart Sass (no `node-sass`).
- App boots and all top-level routes render (manual or new smoke suite).
- `npm run lint` passes on eslint only.

**Risks**
- Dart Sass is stricter (division `/`, `@import` deprecations) — Nebular SCSS may emit deprecation warnings; capture them but they are non-blocking until Phase 3.
- No existing tests means regressions are invisible; **do not proceed to Phase 1 until a smoke net exists.**

---

## Phase 1 — Angular 15 → 16 (+ Nebular 12) — the hard hop

**Goal:** cross the biggest breaking boundary: **ngcc removal** (kills View-Engine libs) and node-sass removal.

**Complexity:** L

**Commands**
```bash
# Angular core + CLI + CDK together
npx ng update @angular/core@16 @angular/cli@16 @angular/cdk@16

# Nebular must move in lockstep
npx ng update @nebular/theme@12 @nebular/auth@12 @nebular/security@12 @nebular/eva-icons@12
# (if ng update schematics are absent for Nebular, bump manually and reinstall)

# RxJS: drop compat, move to 7.x
npm uninstall rxjs-compat
npx ng update rxjs        # -> 7.8.x

# align google-maps to the framework major
npm install @angular/google-maps@16

# BLOCKERS that must be resolved IN this phase (ngcc removal breaks them):
#  - ng2-smart-table + ng2-completer  -> migrate to angular2-smart-table (see Phase 4 detail)
#  - angular2-chartjs                 -> replace/remove
```

**Files/components affected**
- `package.json`, `package-lock.json` — Angular 16, Nebular 12, CDK 16, rxjs 7, google-maps 16.
- `src/app/@core/core.module.ts`, `src/app/@theme/theme.module.ts` — `ModuleWithProviders` must carry the generic (`ModuleWithProviders<CoreModule>`); re-verify Nebular `forRoot`/security wiring.
- `src/app/app-routing.module.ts`, `src/app/@core/core.module.ts` — **@nebular/auth** (SSO/MFA stand-in): re-validate strategies/token config against Nebular 12.
- **ng2-smart-table** files (`pages/tables/*`) — blocked by ngcc removal; migrate now (Phase 4 detail).
- **angular2-chartjs** files (`pages/e-commerce/e-commerce.module.ts`, `pages/charts/charts.module.ts`) — remove/replace now.
- Any `rxjs/Rx` / RxJS-5 style imports — none found via grep, but re-scan after `ng update`.
- SCSS — first real Dart Sass compile of Nebular 12 themes.

**Validation**
- `npm run build:prod` passes on Angular 16 with **no `node-sass`, no `ngcc`**.
- Smoke suite green; manually exercise **tables (smart-table), charts, maps, editors, auth login/register** pages.
- `npm ls @angular/core @nebular/theme` shows a single, consistent major.

**Risks**
- **Highest-risk hop.** ngcc removal means any partial-Ivy/View-Engine lib silently fails to compile — the smart-table + chartjs migrations are on the critical path and can slip.
- Nebular 12 enables CSS-custom-properties theming by default and drops node-sass theme compilation — theme overrides in `@theme/styles` may need adjustment.
- rxjs 7 typing tightening (`toPromise` deprecated, stricter `Subject` typings).

---

## Phase 2 — Angular 16 → 17 (+ Nebular 13)

**Goal:** reach Angular 17 with minimal behavioral change; defer optional modernizations.

**Complexity:** M

**Commands**
```bash
npx ng update @angular/core@17 @angular/cli@17 @angular/cdk@17
npx ng update @nebular/theme@13 @nebular/auth@13 @nebular/security@13 @nebular/eva-icons@13
npm install @angular/google-maps@17
# Node must be >= 18.13; TypeScript moves to 5.2–5.4 (ng update handles it)

# OPTIONAL, do NOT bundle with the version bump:
#   - migrate to the esbuild application builder (browser-esbuild) — separate PR
#   - built-in control flow (@if/@for) migration: npx ng generate @angular/core:control-flow
```

**Files/components affected**
- `package.json` — Angular 17, Nebular 13, CDK 17, TS 5.2+.
- `angular.json` — builder left on `:browser` for now (esbuild migration is a separate, opt-in change to de-risk).
- `tsconfig.json` — TS 5.x may surface stricter type errors; expect small fixes across `@core` services.
- No template rewrites required (control flow is opt-in and deferred to Phase 6).

**Validation**
- `npm run build:prod` + smoke suite green on Angular 17.
- Protractor e2e is **expected to be broken/removed** here — see Phase 4 (e2e migration). Do not gate on Protractor.

**Risks**
- TypeScript 5.x stricter inference.
- If the esbuild builder is adopted, some global CSS/asset/`polyfills` config in `angular.json` changes shape — keep it out of this phase.

---

## Phase 3 — Angular 17 → 18 (+ Nebular 14)

**Goal:** land on the compliance target, Angular 18.

**Complexity:** M

**Commands**
```bash
npx ng update @angular/core@18 @angular/cli@18 @angular/cdk@18
npx ng update @nebular/theme@14 @nebular/auth@14 @nebular/security@14 @nebular/eva-icons@14   # Nebular 14 = Angular 18
npm install @angular/google-maps@18
# Node must be >= 18.19 / 20.9; zone.js bump handled by ng update
```

**Files/components affected**
- `package.json`, `package-lock.json` — Angular 18, Nebular 14, CDK 18, zone.js.
- `src/main.ts` / bootstrap — verify still compiles (NgModule bootstrap remains supported in 18).
- SCSS — resolve any remaining Dart Sass deprecation warnings surfaced since Phase 0.
- `.browserslistrc` — review targets (18 drops older baselines).

**Validation**
- `npm run build:prod` + smoke suite green on Angular 18.
- Full manual regression across every page module.
- `npx ng version` reports 18.x across the board; `npm ls @nebular/theme` shows 14.x.

**Risks**
- Comparatively low framework risk; main risk is a trailing third-party lib that only supports ≤17 (re-check all High-Risk Inventory entries against Angular 18 peer ranges).

---

## Phase 4 — High-risk third-party integrations

**Goal:** migrate/replace the unmaintained integrations that the Angular hops break. The ngcc-blocked
ones (ng2-smart-table, angular2-chartjs) are done *inside Phase 1*; the rest are scheduled here and
validated manually.

**Complexity:** L

**Work items**

1. **ng2-smart-table → `angular2-smart-table`** (BLOCKER, done in Phase 1)
   ```bash
   npm uninstall ng2-smart-table
   npm install angular2-smart-table
   ```
   - Files: `src/app/pages/tables/tables.module.ts`, `src/app/pages/tables/smart-table/smart-table.component.ts` + `.html`.
   - Breaking: module/selector renames (`ng2-smart-table` → `angular2-smart-table`, `angular2-st-*` selectors), settings/typing changes, `setFilter` semantics. Requires template + config rewrite.

2. **angular2-chartjs → remove or `ng2-charts`** (BLOCKER, done in Phase 1)
   - Files: `src/app/pages/e-commerce/e-commerce.module.ts`, `src/app/pages/charts/charts.module.ts` and the charts/e-commerce chart components.

3. **CKEditor 4 → CKEditor 5** (`@ckeditor/ckeditor5-angular`) or isolate/remove.
   - Files: `src/app/pages/editors/ckeditor/*`, `editors.module.ts`, `pages-menu.ts`. CKEditor 4 is EOL — flag as security-relevant.

4. **TinyMCE 4 → TinyMCE 6+** (`@tinymce/tinymce-angular`).
   - Files: `src/app/@theme/components/tiny-mce/*`, `src/app/pages/editors/tiny-mce/*`, `src/typings.d.ts` (global typings).

5. **ngx-echarts 4 → ≥8**, **@swimlane/ngx-charts 14 → ≥20**, **@asymmetrik/ngx-leaflet → @bluehalo/ngx-leaflet**.
   - Files: `pages/charts/echarts/*`, `pages/charts/d3/*`, `pages/maps/leaflet/*`, `pages/e-commerce/country-orders/map/*`, and the `*.module.ts` that import them.

6. **Protractor e2e → Playwright or Cypress.**
   ```bash
   npm uninstall protractor
   npx ng add @cypress/schematic   # or @playwright
   ```
   - Files: `e2e/`, `protractor.conf.js`, `angular.json` (remove `e2e`/`:protractor` targets), `.travis.yml`/CI.

**Validation**
- Each integration exercised manually on its page after migration (tables, editors, charts, maps).
- New e2e smoke suite runs in CI in place of Protractor.

**Risks**
- Editors (CKEditor 4 / TinyMCE 4) are EOL — highest security + effort; may warrant their own PRs.
- Leaflet/echarts/ngx-charts API drift over many majors → visual regressions.

---

## Phase 5 — Angular Material MDC migration (CONDITIONAL)

**Goal:** apply the [MDC migration](https://material.angular.dev/guide/mdc-migration) **only where Angular Material is actually used.**

**Applicability to this repo:** **N/A.** ngx-admin has **no `@angular/material`** dependency; it uses
Nebular. There is nothing to MDC-migrate in this app. This phase is documented for completeness and
for the real banking app / shared design-system library referenced in the brief.

**If the shared design-system library (`libs/ui`) uses Material — apply there:**

**Complexity:** M (per component family)

**Commands**
```bash
# after the library is on Angular 15+/16+
ng generate @angular/material:mdc-migration
```

**What to expect**
- Legacy `mat-legacy-*` imports are introduced as a bridge; DOM structure, CSS class names and
  token-based theming change for `button`, `card`, `form-field`, `input`, `select`, `menu`, `dialog`,
  `table`, `tabs`, `slide-toggle`, `chips`, `progress-*`, `tooltip`, `snack-bar`, etc.
- Custom CSS targeting internal Material DOM/classes will break and must be reworked against the new
  MDC DOM + design tokens.

**Design-system public-API rule (from the brief):**
- The library's **public API must not break**. If an MDC change forces a signature/selector change,
  ship an **alias/deprecation** (`@deprecated` re-export or wrapper) — never a hard break — so
  downstream apps keep compiling.

**Validation**
- Visual regression on every consuming app; verify no public export was removed (only deprecated).

**Risks**
- MDC visual/spacing changes ripple into every downstream consumer; coordinate a design QA pass.

---

## Phase 6 — Post-migration validation, cleanup & modernization

**Goal:** sign-off and optional modernization now that the app is on Angular 18.

**Complexity:** S–M

**Commands / work**
```bash
npm dedupe
npm run build:prod
npm run lint
# optional modernizations (each its own PR):
npx ng generate @angular/core:control-flow          # @if/@for/@switch
# consider esbuild application builder in angular.json if deferred from Phase 2
```

**Files/components affected**
- `.browserslistrc`, `angular.json` (builder/budgets), `README.md` (Node/Sass/versions), CI (`.travis.yml`).
- Templates (only if adopting built-in control flow).

**Validation**
- Full manual regression across all pages + new e2e smoke suite in CI.
- `npx ng version` = 18.x; `npm ls` shows no duplicated Angular/Nebular majors; no `node-sass`/`ngcc`/`tslint` remaining.

**Risks**
- Optional modernizations can introduce churn; keep them out of the compliance-critical PRs.

---

## Compliance-deadline sequencing (Angular 14 EOL)

Minimum path to a supported version = **Phases 0 → 1 → 2 → 3** (plus the Phase 1 blocker migrations).
Phase 4 non-blocking items, Phase 5 (conditional), and Phase 6 modernizations can follow the deadline
**only if** each earlier hop's `build:prod` + smoke gate stayed green. Do **not** collapse hops
(no `ng update @angular/core@18` from 15) — Angular supports single-major steps and Nebular must move
in lockstep at each step.
