# Design

## Context

All interface text is currently hard-coded English inside JSX. This covers about 4,900 lines across 7 pages, `SkillEditModal`, `DataTable`, `Layout`, and the auth screens. Failures are shown through `alert()`, `confirm()`, a snackbar in `EmployeeSkillsPage`, and `Alert` components. `utils/apiError.ts#getApiErrorMessage` currently returns the server's English `message` (plus `details`), falling back to a hard-coded English string. Level labels live in `utils/levelColors.ts#LEVEL_LABELS`. The Skills Matrix export in `SkillsMatrixPage.tsx` writes hard-coded `Employee/Department/Position/Summary` headers and a `Skills Matrix` sheet name.

`AuthProvider` renders `DevLoginPage` *instead of* its children when unauthenticated, outside `Layout`. So any language state must live above `AuthProvider`, or the sign-in screen cannot use it.

There is no frontend test runner. The project rules discourage new client-side libraries without a concrete need.

## Goals / Non-Goals

**Goals:**
- One place that owns the active language, readable by any component, and switchable at runtime without a reload.
- Dictionaries that the compiler checks: a key missing from `pl` is a `tsc` error, so `npm run build` catches untranslated strings.
- A single error-to-message function, so every failure path uses the same status mapping.

**Non-Goals:**
- Plural rules beyond what the current strings need, ICU message syntax, lazy-loaded locale bundles.
- Translating backend text or database values (see specs/ui-localization).

## Decisions

### 1. Hand-rolled typed dictionaries + React context, no i18n library

`src/i18n/` holds:
- `en.ts`: a nested `const` object of strings, grouped by screen (`nav`, `common`, `employees`, `skills`, `skillDetails`, `employeeSkills`, `matrix`, `auth`, `errors`, `levels`, `roles`). Strings needing values are functions, e.g. `deleteEmployee: (name: string) => \`Delete employee ${name}?\``.
- `pl.ts`: typed as `typeof en` (`export const pl: Messages = {...}`), so a missing or mistyped key fails `tsc`.
- `LanguageContext.tsx`: a `LanguageProvider` holding `language: 'en' | 'pl'` and `setLanguage`, and a `useTranslation()` hook returning `{ t, language, setLanguage }`, where `t` is the active dictionary object. Call sites read `t.employees.title` or `t.employees.deleteConfirm(name)`, so the compiler checks them too.

*Alternatives considered:*
- **react-i18next + i18next.** This is the industry default, but it adds two dependencies, and string keys (`t('employees.title')`) are not type-checked unless more typing setup is added. Its strengths (plurals, namespaces, lazy loading, many languages) aren't needed when exactly two languages are bundled. Rejected under the project's "no new library without concrete need" rule.
- **react-intl (FormatJS).** Heavier, ICU-centric, same objection.
- If more languages or complex plurals are needed later, swapping in i18next is mechanical, because every string is already behind `t`.

### 2. Language resolution and persistence

At start-up the provider resolves the language once: first a `localStorage` key `skill-matrix.language` if it is `'en'` or `'pl'`, then `navigator.language` starting with `pl`, otherwise `'en'`. Every `localStorage` access is wrapped in try/catch so a blocked storage falls back silently. `setLanguage` updates state, writes the key, and sets `document.documentElement.lang`. Nothing is sent to the backend (no `Accept-Language` header is added), which keeps the API surface unchanged.

*Alternative:* store on the Employee record. Rejected by the user. It needs a migration, an API change, and does not work on the sign-in screen anyway.

### 3. Provider placement and MUI locale

`main.tsx` wraps the tree in `LanguageProvider` **outside** `ThemeProvider` and `AuthProvider`. A small component inside the provider builds the theme with `createTheme(baseThemeOptions, language === 'pl' ? plPL : enUS)` (from `@mui/material/locale`), memoised on `language`. `theme/theme.ts` therefore exports the theme *options* (or a `buildTheme(locale)` function) rather than a finished theme. This localizes `Autocomplete`'s "No options" / "Loading…" / clear and close aria-labels and other built-in text.

### 4. Language toggle component

A `components/LanguageToggle.tsx` uses MUI `ToggleButtonGroup` with two exclusive buttons, `EN` and `PL`, each with an `aria-label` ("English" / "Polski"). It appears in the `Layout` app bar next to the role chip, in the mobile drawer, and at the top of `DevLoginPage`. Switching only changes context state. Component state (open dialogs, typed form values) is untouched because no remount happens.

### 5. API error presentation

`getApiErrorMessage(error, fallback)` is replaced by `formatApiError(error, t, operationFailed)`. It returns `"<localized headline>: <server detail>"`, or just the headline when the server gave no detail:

| Condition | Headline key |
|---|---|
| no `response` (network) | `errors.network` |
| 400 | `errors.validation` |
| 403 | `errors.forbidden` |
| 404 | `errors.notFound` |
| 409 | `errors.conflict` |
| other | the caller's operation-specific text, e.g. `t.employees.saveFailed` |

The server detail is `data.message`, plus `details.join(', ')` when present, passed through unchanged. It stays a plain string, so the existing `alert()` / snackbar / `Alert` call sites keep their shape. Replacing `alert()`/`confirm()` with MUI dialogs is out of scope. Those call sites just get translated text, and the browser's own OK/Cancel buttons follow the browser's language.

`SkillEditModal` currently ignores the server message entirely (`alert('Failed to save skill')`). It moves to `formatApiError` too, so the status-mapping requirement holds everywhere.

The 401 path in `services/api.ts` is unchanged (clear token, reload). After the reload the sign-in screen renders in the persisted language.

### 6. Level labels and role names

`LEVEL_LABELS` moves into the dictionaries (`t.levels[1..5]`, `t.levels.unknown`). `getLevelLabel(level)` becomes `getLevelLabel(level, t)`, or is read directly from `t`. Colours stay in `levelColors.ts`, untouched. Role display names come from `t.roles[user.role]`, falling back to the raw code for an unexpected value.

### 7. Export

`exportToExcel` in `SkillsMatrixPage` reads `t.matrix.export.*` for the three fixed headers, the summary label, and the sheet name. Sheet names must be ≤31 characters with no `[]:*?/\`, and both "Skills Matrix" and "Macierz kompetencji" meet that. The file name stays `skills-matrix-YYYY-MM-DD.xlsx` in both languages, so downstream scripts that pick it up are not broken.

## Risks / Trade-offs

- **[Missed string]** A hard-coded literal left in JSX shows in English in Polish mode. → Mitigation: a grep task for JSX text and string literals in `label=`/`title=`/`placeholder=`/`alert(`/`confirm(` across `src/`, plus a manual walk through every route in Polish.
- **[Polish text overflows layouts]** Polish strings run ~20–30% longer (e.g. "Średniozaawansowany"), which can wrap nav buttons and chips. → Mitigation: a manual check at desktop and phone widths; shorten labels in `pl.ts` where needed rather than changing layout.
- **[Mixed-language screens are expected]** Stored data stays in whatever language it was entered in, so Polish chrome around English skill names is by design. → The spec states this explicitly (Stored data is never translated).
- **[Server detail stays English]** Polish users still see English server messages as secondary text. → Accepted by the user. The localized headline carries the meaning, and backend localization can be a later change.
- **[No automated tests]** No frontend runner exists. The `pl: Messages` typing makes `npm run build` the main safety net, and the rest is manual verification.

## Migration Plan

Frontend-only and additive. Deploy as a normal frontend release. Users with no stored choice get the browser rule, which for most PSE browsers means Polish on first load. Rollback is redeploying the previous frontend build. The leftover `localStorage` key is harmless.
