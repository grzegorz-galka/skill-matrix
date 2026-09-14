## Purpose

Presents the collected assessments as a grid of employees against skills, so that a manager can see at a glance who holds which skill and at what level. Filters on both axes narrow the grid, and the result can be taken away as a spreadsheet.

## Requirements

### Requirement: The matrix is a grid of employees against skills

A matrix response SHALL carry the employee rows, the skill columns, the populated cells keyed by employee and skill, and a summary per skill.

#### Scenario: Requesting the matrix
- **WHEN** a client posts to `/api/skills-matrix`
- **THEN** the response contains `employees`, `skills`, `cells`, and `skillSummaries`

#### Scenario: Cell contents
- **WHEN** an employee holds a grade for a skill inside the filtered set
- **THEN** the cell keyed `{employeeId}_{skillId}` carries the grade id, code, description, level, years of experience, and certified flag

#### Scenario: Skill columns name their profiles
- **WHEN** the matrix is built
- **THEN** each skill column carries the names of the profiles that skill belongs to

#### Scenario: Requesting with no body at all
- **WHEN** a client posts to `/api/skills-matrix` with no request body
- **THEN** the matrix is built as though every filter were empty

### Requirement: Five filter dimensions narrow the grid

Employees SHALL be filterable by full name, department, and position; skills by skill name and by the name of a profile the skill belongs to. Each filter MUST be a list of glob patterns matched case-insensitively, as described in the authorization capability.

#### Scenario: Filtering employees by department
- **WHEN** the filter carries `departmentPatterns: ["CKI-*"]`
- **THEN** only employees whose department matches are considered

#### Scenario: Filtering employees by name
- **WHEN** the filter carries `namePatterns`
- **THEN** each pattern is matched against the employee's first and last name joined by a space

#### Scenario: Filtering skills by profile
- **WHEN** the filter carries `skillProfilePatterns: ["Analyst"]`
- **THEN** only skills belonging to at least one profile whose name matches are considered

#### Scenario: A skill in no profile under a profile filter
- **WHEN** a profile filter is supplied and a skill belongs to no profile
- **THEN** that skill is excluded

#### Scenario: Patterns within one dimension are alternatives
- **WHEN** a dimension carries several patterns
- **THEN** a value matching any one of them satisfies that dimension

#### Scenario: Dimensions are combined
- **WHEN** several dimensions carry patterns
- **THEN** an employee or skill must satisfy every dimension that carries patterns

#### Scenario: An empty dimension matches everything
- **WHEN** a dimension is absent, null, or an empty list
- **THEN** it imposes no restriction

### Requirement: Rows and columns without any grade are elided

After filtering, an employee holding no grade among the filtered skills, and a skill graded by none of the filtered employees, SHALL both be dropped. The grid therefore shows only populated rows and columns, and an employee who matched the filter MAY be absent from the result.

#### Scenario: Filtered employee with no assessments
- **WHEN** an employee satisfies the filters but holds no grade for any filtered skill
- **THEN** that employee does not appear as a row

#### Scenario: Filtered skill nobody has graded
- **WHEN** a skill satisfies the filters but no filtered employee holds a grade for it
- **THEN** that skill does not appear as a column

#### Scenario: Nothing survives the filter
- **WHEN** the filters exclude every employee or every skill
- **THEN** the response carries empty employees, skills, cells, and summaries

### Requirement: Each skill column is summarised by grade counts

Each skill in the grid SHALL carry a count of how many of the shown employees hold each of that skill's grade codes.

#### Scenario: Summarising a skill
- **WHEN** the matrix includes a skill graded by several employees
- **THEN** that skill's summary carries a count of employees per grade code

### Requirement: Filter values are offered as hints

So that a user can filter without knowing the data, the distinct values present in the database SHALL be offered for each dimension.

#### Scenario: Requesting hints
- **WHEN** a client calls `GET /api/skills-matrix/filter-hints`
- **THEN** the response carries the distinct employee names, departments, positions, skill names, and profile names, each sorted

#### Scenario: Blank values are not offered
- **WHEN** some employees have no department or position recorded
- **THEN** null and blank values are omitted from the hints

### Requirement: Levels are rendered on a shared colour ramp

A grade's numeric level SHALL drive its colour, so that proficiency reads consistently across skills whose grade codes differ. The ramp MUST run from pale at level 1 to dark green at level 5, with text colour switching to white at the darker end for contrast.

#### Scenario: Rendering a graded cell
- **WHEN** a cell holds a grade of level 4
- **THEN** it is rendered in that level's background colour with the matching text colour

#### Scenario: Level outside the ramp
- **WHEN** a level has no colour defined
- **THEN** the level 1 colours are used

#### Scenario: Naming a level
- **WHEN** a level is displayed as a label
- **THEN** it reads Beginner, Basic, Intermediate, Advanced, or Expert for levels 1 to 5, and Unknown otherwise

### Requirement: The matrix can be exported as a spreadsheet

The displayed matrix SHALL be exportable as a workbook, which MUST reflect exactly the rows, columns, and filters currently shown.

#### Scenario: Exporting
- **WHEN** the user exports the displayed matrix
- **THEN** a workbook is produced with a header row of Employee, Department, Position, and one column per skill

#### Scenario: Exported cell contents
- **WHEN** a row is written for an employee
- **THEN** each skill column carries that employee's grade code, or is left blank where no grade is held

#### Scenario: Exported summary
- **WHEN** the export is written
- **THEN** a final Summary row carries each skill's grade counts, one grade per line

#### Scenario: Export reflects the current filters
- **WHEN** the user exports after filtering
- **THEN** the workbook contains exactly the rows and columns currently displayed
