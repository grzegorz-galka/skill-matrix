# Tasks

No backend, schema, API, or role-model change is involved, so there is no Flyway migration and no new backend authorization tests (see proposal.md Impact). Every group ends green on `npm run build` and `npm run lint` in `frontend/`.

## 1. Localization foundation

- [x] 1.1 Create `frontend/src/i18n/en.ts` exporting a `const en` dictionary grouped by screen (`common`, `nav`, `auth`, `roles`, `levels`, `errors`, `employees`, `skillProfiles`, `skills`, `skillDetails`, `skillEditModal`, `employeeSkills`, `matrix`, `home`), plus `export type Messages = typeof en`. Seed only `common`, `nav`, `auth`, `roles`, `levels`, `errors` now; verify `npm run build` passes.
- [x] 1.2 Create `frontend/src/i18n/pl.ts` as `export const pl: Messages`, with Polish for the seeded groups (levels: Początkujący, Podstawowy, Średniozaawansowany, Zaawansowany, Ekspert, Nieznany; roles: Pracownik, Recenzent, Administrator). Verify that deleting one key from `pl` makes `npm run build` fail, then restore it.
- [x] 1.3 Create `frontend/src/i18n/LanguageContext.tsx` with `LanguageProvider` and `useTranslation()` per design.md §2: resolve from `localStorage['skill-matrix.language']`, then `navigator.language` starting with `pl`, else `en`. Wrap storage access in try/catch, and set `document.documentElement.lang` on init and on change. Verify `npm run build` passes and, in the dev server, that setting the key to `de` in DevTools falls back to the browser rule.
- [x] 1.4 Change `frontend/src/theme/theme.ts` to export the theme options or a `buildTheme(locale)`, and in `main.tsx` wrap the app in `LanguageProvider` outside `ThemeProvider`, applying `enUS` / `plPL` from `@mui/material/locale` memoised on language. Verify in the dev server that an `Autocomplete` with no matches shows "Brak opcji" when the stored language is `pl`.
- [x] 1.5 Create `frontend/src/components/LanguageToggle.tsx` (MUI `ToggleButtonGroup`, EN / PL, aria-labels "English" / "Polski"). Verify `npm run lint` passes.

## 2. Shell, auth screens, and shared components

- [x] 2.1 Localize `components/Layout/Layout.tsx`: nav items, brand title, sign-out tooltip and aria-label, footer, and role chip via `t.roles[user.role]` with a raw-code fallback. Add `LanguageToggle` to the app bar and the mobile drawer. Verify in the dev server that switching EN↔PL updates the bar without a reload and the role chip reads "Administrator" / "Recenzent" / "Pracownik".
- [x] 2.2 Localize `auth/DevLoginPage.tsx` (title, hint, field labels, button, signing-in state, failure message with server detail appended) and `auth/OidcCallback.tsx`. Add `LanguageToggle` to the login card. Verify that switching to PL on the login page and then signing in keeps PL.
- [x] 2.3 Localize `components/DataTable.tsx` ("Actions", "No data available"), `components/ErrorMessage.tsx` callers, and `components/Loading.tsx` if it has text. Verify an empty table shows the Polish empty-state text.
- [x] 2.4 Replace `utils/apiError.ts#getApiErrorMessage` with `formatApiError(error, t, operationFailed)` per design.md §5 (network / 400 / 403 / 404 / 409 headlines + unchanged server message and details). Verify `npm run build` points at every old call site, which groups 3–4 then migrate.
- [x] 2.5 Move level labels from `utils/levelColors.ts` into the dictionaries and change `getLevelLabel` to take `t` (colours stay unchanged). Verify with `npm run build` and visually that level colours are identical in both languages.

## 3. Catalogue and employee pages

- [x] 3.1 Localize `pages/HomePage.tsx` and add the `home` group to `en`/`pl`. Verify by visual check in both languages.
- [x] 3.2 Localize `pages/EmployeesPage.tsx`: headings, search placeholder, columns, dialog labels, confirm prompts, paging summary, and errors through `formatApiError`. Verify a 403 (signed in as a non-admin, try to delete) shows the Polish forbidden headline followed by the server's English message.
- [x] 3.3 Localize `pages/SkillProfilesPage.tsx` and `pages/SkillsPage.tsx`, including the "Page X of Y (Total: N skills)" summary. Verify a 409 (create a duplicate profile name) shows the localized conflict headline.
- [x] 3.4 Localize `pages/SkillDetailsPage.tsx` (including the unsaved-changes confirm and the "Skill updated successfully" alert) and `components/SkillEditModal.tsx`. Move the modal's bare `alert('Failed …')` calls to `formatApiError`. Verify the unsaved-changes prompt appears in Polish and a failed grade save shows the server detail.

## 4. Assessment and matrix pages

- [x] 4.1 Localize `pages/EmployeeSkillsPage.tsx`: panel headings, employee picker, skill filter, grade selector label, move-button aria-labels, and snackbar messages (resolved at render time so they follow a switch). Verify that filter text and unsaved grade choices survive a language switch, and that a 409 second-grade-for-same-skill shows the localized conflict headline.
- [x] 4.2 Localize `pages/SkillsMatrixPage.tsx` UI: filter labels, buttons, legend with level labels, empty state. Verify filter hint values and skill names stay exactly as returned by the API in PL mode.
- [x] 4.3 Localize the Excel export in `SkillsMatrixPage.tsx#exportToExcel` (header labels, summary label, sheet name; file name unchanged). Verify that exporting in PL yields headers "Pracownik, Dział, Stanowisko", a final "Podsumowanie" row, and unchanged skill names and grade codes, and that EN still yields "Employee, Department, Position, Summary".

## 5. Integration check and documentation

- [x] 5.1 Sweep `frontend/src` for remaining hard-coded user-facing English (grep JSX text nodes and `label=`, `title=`, `placeholder=`, `aria-label=`, `alert(`, `confirm(`, `setError(`, `message:`), and move any hits into the dictionaries. Verify the grep returns only data bindings or non-UI strings.
- [ ] 5.2 Manual walkthrough of every route in PL and EN at desktop and phone widths (Chrome DevTools 375 px). Check for no English chrome in PL, no layout overflow (shorten `pl.ts` strings if needed), `<html lang>` toggling, and choice persisting across reload and sign-out. Verify by recording the result in the PR description.
- [x] 5.3 Update `CLAUDE.md`: add `i18n/` to the project-structure tree and a "Localization" bullet under Frontend Guidelines (all UI text goes through `useTranslation()`; `pl.ts` is typed against `en.ts`; database values and server messages are never translated). Verify the tree matches `ls frontend/src`.
- [x] 5.4 Run `npm run build` and `npm run lint` in `frontend/`, `./mvnw test` in `backend/` (to confirm nothing changed), and `openspec validate add-polish-language-support`. Verify all four succeed.

## Workflow follow-up

- Archive the change after review; confirm the `ui-localization` spec and the modified `skills-matrix-report` requirements are folded into `openspec/specs/` and `openspec validate --specs` passes.
- Confirm CLAUDE.md matches the archived behaviour.
