# Spec Delta

## Purpose

Lets people use the Skill Matrix interface in English or Polish, with only the interface text translated. Data stored in the application is always shown as entered.

## ADDED Requirements

### Requirement: Exactly two interface languages are offered

The interface SHALL be available in English and in Polish, and in no other language. Every piece of text that the interface itself supplies MUST have both an English and a Polish version.

#### Scenario: Choosing among the offered languages
- **WHEN** the user opens the language toggle
- **THEN** exactly two choices are offered, English (EN) and Polish (PL)

#### Scenario: No partially translated screen
- **WHEN** Polish is active and the user visits any screen of the application
- **THEN** every label, heading, button, column header, placeholder, tooltip, empty-state text, confirmation prompt, and notification supplied by the interface is in Polish

### Requirement: The initial language follows the browser

When no language has been chosen in this browser before, the interface SHALL start in Polish if the browser's preferred language is Polish, and in English otherwise.

#### Scenario: Polish browser on first visit
- **WHEN** a user with no stored choice opens the application in a browser whose preferred language is `pl` or `pl-PL`
- **THEN** the interface is shown in Polish

#### Scenario: Any other browser language on first visit
- **WHEN** a user with no stored choice opens the application in a browser whose preferred language is, for example, `en-GB` or `de-DE`
- **THEN** the interface is shown in English

### Requirement: The user can switch language at any time

A language toggle SHALL be available on every screen, including the sign-in screen shown before authentication. Switching MUST take effect immediately, without a page reload, and MUST NOT discard data the user has typed but not saved.

#### Scenario: Switching while signed in
- **WHEN** a signed-in user switches from English to Polish in the top bar
- **THEN** the current screen re-renders in Polish without reloading the page

#### Scenario: Switching on the sign-in screen
- **WHEN** an unauthenticated user switches to Polish on the sign-in screen
- **THEN** the sign-in screen is shown in Polish, and after signing in the application stays in Polish

#### Scenario: Unsaved input survives a switch
- **WHEN** a user has typed into an open form and then switches language
- **THEN** the form stays open with the typed values unchanged, and only its labels change language

### Requirement: The language choice is remembered per browser

The chosen language SHALL be remembered in the browser and reapplied on later visits. It MUST NOT be sent to or stored by the server. If the stored value is missing, unreadable, or not one of the two offered languages, the initial-language rule SHALL apply.

#### Scenario: Returning visit
- **WHEN** a user who chose Polish closes the browser and later opens the application again in the same browser
- **THEN** the interface is shown in Polish regardless of the browser's preferred language

#### Scenario: Different browser
- **WHEN** the same user opens the application in another browser with no stored choice
- **THEN** the initial language follows that browser's preferred language

#### Scenario: Unusable stored value
- **WHEN** the stored choice is an unsupported value such as `de`, or browser storage is unavailable
- **THEN** the interface starts in the language given by the browser rule and remains usable

### Requirement: Stored data is never translated

Values that come from the application's data SHALL be displayed exactly as stored, whatever the active language. This includes employee names, emails, departments, positions, skill profile names and descriptions, skill names and descriptions, grade codes and descriptions, and employee and reviewer comments.

#### Scenario: Catalogue names in Polish mode
- **WHEN** Polish is active and a skill named "Java" with a grade described as "Can work independently" is displayed
- **THEN** the skill name and grade description are shown exactly as stored, in English, while the surrounding labels are in Polish

#### Scenario: Filter hints are not translated
- **WHEN** Polish is active and the Skills Matrix offers department and position hints
- **THEN** the hint values are shown exactly as returned by the API

### Requirement: Role names are displayed in the active language

The user's role SHALL be displayed with a localized name: Employee / Pracownik, Reviewer / Recenzent, Administrator / Administrator. The role itself MUST NOT change; it is still resolved by the server and returned unchanged by the API.

#### Scenario: Admin in Polish
- **WHEN** Polish is active and the signed-in user's role is `ADMIN`
- **THEN** the top bar shows the role as "Administrator"

#### Scenario: Reviewer in English
- **WHEN** English is active and the signed-in user's role is `REVIEWER`
- **THEN** the top bar shows the role as "Reviewer"

### Requirement: API failures are reported in the active language

When an API call fails, the interface SHALL show a message in the active language chosen by the kind of failure. Any message or field details returned by the server MUST also be shown, unchanged, as secondary detail. The server's text is never translated.

#### Scenario: Forbidden
- **WHEN** Polish is active and a save is refused with 403
- **THEN** the user sees a Polish message saying they lack permission for this operation, followed by the server's message, for example "Only admins can manage skill profiles"

#### Scenario: Not found
- **WHEN** a request fails with 404
- **THEN** the user sees a message in the active language saying the record was not found, followed by the server's message if any

#### Scenario: Conflict
- **WHEN** a save fails with 409, for example because the employee already holds a grade for that skill
- **THEN** the user sees a message in the active language saying the record conflicts with existing data, followed by the server's message

#### Scenario: Validation failure
- **WHEN** a save fails with 400 and the server returns field details such as "email: Email must be valid"
- **THEN** the user sees a message in the active language saying the data is invalid, followed by the server's field details unchanged

#### Scenario: Server error
- **WHEN** a request fails with 500 or another unexpected status
- **THEN** the user sees a generic error message in the active language describing the operation that failed

#### Scenario: Server unreachable
- **WHEN** a request fails with no response from the server
- **THEN** the user sees a message in the active language saying the server could not be reached

#### Scenario: Unauthenticated
- **WHEN** a request fails with 401
- **THEN** the session is cleared and the sign-in screen is shown in the active language, as before this change

### Requirement: Dev sign-in failures are reported in the active language

On the development sign-in screen, a failed sign-in SHALL be reported in the active language. Any server message MUST be shown unchanged as secondary detail.

#### Scenario: Unknown email on dev sign-in
- **WHEN** Polish is active and a dev sign-in is attempted with an email that matches no employee
- **THEN** the screen shows a Polish message that the sign-in failed and the email must belong to an existing employee, together with the server's message if one was returned

### Requirement: Built-in component text and document language follow the active language

Text supplied by the interface's standard components, such as "no options" and "loading" in pickers and close/clear button labels, SHALL follow the active language. The page's declared document language MUST match the active language, so that assistive technology and the browser treat the page as English or Polish accordingly.

#### Scenario: Picker with no matches in Polish
- **WHEN** Polish is active and the user types a value into a filter or skill picker that matches no option
- **THEN** the picker's empty-result text is in Polish

#### Scenario: Paging summary in Polish
- **WHEN** Polish is active on the paged employee or skill list
- **THEN** the paging summary (current page, page count, total) is in Polish

#### Scenario: Document language
- **WHEN** the user switches to Polish
- **THEN** the page declares its language as `pl`, and as `en` after switching back to English
