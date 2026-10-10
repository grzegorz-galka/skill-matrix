# Proposal

## Why

Skill Matrix is used inside PSE, where many employees work in Polish, but every label, button, and message in the interface is in English. Adding Polish as a second interface language makes the tool easier to use for the people who maintain their own skill records. Support is limited to English and Polish only.

## What Changes

- The web interface can be shown in **English** or **Polish**. All text written by the frontend is translated: navigation, page titles, table headers, form labels, buttons, empty states, confirmation prompts, alerts, snackbars, the dev login page, and the footer.
- A **language toggle** (EN / PL) is added to the top bar and to the dev login page, so the language can be changed before signing in.
- The chosen language is **remembered in the browser** (`localStorage`). On a first visit the language follows the browser: Polish if the browser language starts with `pl`, otherwise English.
- **Error messages** shown after a failed API call are mapped from the HTTP status (400, 403, 404, 409, 500, network failure) to a translated message. The server's own English message, if any, is still shown as secondary detail.
- **Level labels** (Beginner … Expert) are frontend-defined, so they are translated. Polish labels: Początkujący, Podstawowy, Średniozaawansowany, Zaawansowany, Ekspert.
- **Role names** shown in the top bar (`EMPLOYEE`, `REVIEWER`, `ADMIN`) are shown as translated display names. The role codes returned by the API do not change.
- The **Skills Matrix export** writes its fixed headers (Employee, Department, Position, Summary) and sheet name in the active language. Data cells are unchanged.
- MUI's built-in component text (pagination, autocomplete "No options", etc.) follows the active language. The document `lang` attribute is updated to match.
- **Not translated:** anything that comes from the database. That covers employee names, departments, positions, profile and skill names and descriptions, grade codes and descriptions, and comments. It also covers the backend's own error text.

## Capabilities

### New Capabilities
- `ui-localization`: Which interface languages exist, how the active language is chosen, remembered, and switched, what is and is not translated, and how API failures are presented in the active language.

### Modified Capabilities
- `skills-matrix-report`: Level labels are given per language instead of in English only. The export's fixed header labels follow the active interface language.

## Non-goals

- No languages other than English and Polish, and no language-pack mechanism for adding more at runtime.
- No translation of data stored in the database, and no multilingual columns.
- No backend localization. The backend does not read `Accept-Language`, and API error `message`/`details` stay in English.
- No per-user language preference stored on the server; the choice is per browser.
- No locale-specific number or date formatting changes beyond what translated text needs.
- No frontend test runner is introduced by this change.

## Impact

- **Data model:** no change, no Flyway migration.
- **Role model:** no change. Only the display names of roles are localized.
- **Public API:** no change. Endpoints, payloads, and error bodies are unchanged.
- **Frontend code:** a new `i18n/` module (language context, `en` and `pl` dictionaries, a translation hook); `main.tsx`/`App.tsx` providers; `Layout`, `DevLoginPage`, `OidcCallback`, every page under `pages/`, `DataTable`, `SkillEditModal`, `ErrorMessage`, `utils/apiError.ts`, `utils/levelColors.ts` (labels), and `theme/theme.ts` (MUI locale).
- **Dependencies:** none planned; translation is a small in-house context (see design.md). MUI's bundled `enUS`/`plPL` locale objects are already part of `@mui/material`.
- **Docs:** CLAUDE.md gets a short note on frontend localization (project structure, frontend guidelines). The dependency tables are unchanged.
