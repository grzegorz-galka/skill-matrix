# Spec Delta

## MODIFIED Requirements

### Requirement: Levels are rendered on a shared colour ramp

A grade's numeric level SHALL drive its colour, so that proficiency reads consistently across skills whose grade codes differ. The ramp MUST run from pale at level 1 to dark green at level 5, with text colour switching to white at the darker end for contrast.

#### Scenario: Rendering a graded cell
- **WHEN** a cell holds a grade of level 4
- **THEN** it is rendered in that level's background colour with the matching text colour

#### Scenario: Level outside the ramp
- **WHEN** a level has no colour defined
- **THEN** the level 1 colours are used

#### Scenario: Naming a level
- **WHEN** a level is displayed as a label while English is active
- **THEN** it reads Beginner, Basic, Intermediate, Advanced, or Expert for levels 1 to 5, and Unknown otherwise

#### Scenario: Naming a level in Polish
- **WHEN** a level is displayed as a label while Polish is active
- **THEN** it reads Początkujący, Podstawowy, Średniozaawansowany, Zaawansowany, or Ekspert for levels 1 to 5, and Nieznany otherwise

#### Scenario: Level colours do not depend on language
- **WHEN** the user switches the interface language
- **THEN** every graded cell keeps the same background and text colour

### Requirement: The matrix can be exported as a spreadsheet

The displayed matrix SHALL be exportable as a workbook, which MUST reflect exactly the rows, columns, and filters currently shown. The workbook's fixed labels MUST be written in the active interface language. Skill names, employee data, and grade codes MUST be written exactly as stored.

#### Scenario: Exporting
- **WHEN** the user exports the displayed matrix while English is active
- **THEN** a workbook is produced with a header row of Employee, Department, Position, and one column per skill

#### Scenario: Exporting in Polish
- **WHEN** the user exports the displayed matrix while Polish is active
- **THEN** the header row reads Pracownik, Dział, Stanowisko, followed by one column per skill named exactly as stored, and the final row is labelled Podsumowanie

#### Scenario: Exported cell contents
- **WHEN** a row is written for an employee
- **THEN** each skill column carries that employee's grade code, or is left blank where no grade is held

#### Scenario: Exported summary
- **WHEN** the export is written
- **THEN** a final Summary row, labelled in the active language, carries each skill's grade counts, one grade per line

#### Scenario: Export reflects the current filters
- **WHEN** the user exports after filtering
- **THEN** the workbook contains exactly the rows and columns currently displayed
