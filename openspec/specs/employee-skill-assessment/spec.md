## Purpose

Records which grade each employee holds for each skill, together with the supporting evidence: how long they have practised it, when they last used it, whether they are certified, and what they and their reviewer said about it. This is the data the application exists to collect.

## Requirements

### Requirement: An employee holds at most one grade per skill

Because a grade expresses a position on that skill's scale, an employee MUST NOT hold two grades of the same skill. The rule SHALL be enforced against the skill behind the grade, not merely against the grade itself.

#### Scenario: Recording a second grade for a skill already assessed
- **WHEN** an employee already holds grade "intermediate" for Java and a request records grade "advanced" for Java
- **THEN** the request is refused with HTTP 409, naming the grade already held and directing the caller to update it instead

#### Scenario: Recording the identical pairing twice
- **WHEN** a request records an employee and skill grade pairing that already exists
- **THEN** the request is refused with HTTP 409

#### Scenario: Updating an employee's grade for a skill
- **WHEN** an existing assessment is updated to a different grade of the same skill
- **THEN** the update succeeds, because the record being changed is excluded from the one-grade-per-skill check

#### Scenario: Assessing a different skill
- **WHEN** an employee who holds a Java grade records a grade for SQL
- **THEN** the assessment is created

### Requirement: An assessment carries supporting detail

Alongside the grade, an assessment MAY record years of experience, the date the skill was last used, whether the employee is certified, a comment from the employee, and a comment from a reviewer. Years of experience MUST NOT be negative.

#### Scenario: Recording full detail
- **WHEN** an assessment is submitted with years of experience, last used date, certified, and both comments
- **THEN** all values are stored and returned

#### Scenario: Certified omitted
- **WHEN** an assessment is submitted with no `certified` value
- **THEN** it is stored as false

#### Scenario: Negative years of experience
- **WHEN** an assessment is submitted with years of experience below zero
- **THEN** the response is HTTP 400 with the message "Years of experience must be non-negative"

#### Scenario: Required references missing
- **WHEN** the request omits the employee id or the skill grade id
- **THEN** the response is HTTP 400 naming each failing field

#### Scenario: References point at nothing
- **WHEN** the employee id or skill grade id matches no record
- **THEN** the response is HTTP 404 naming the missing one

### Requirement: An assessment may name a reviewer

The employee who reviewed an assessment SHALL be recorded as a reference to another employee, alongside that reviewer's comment.

#### Scenario: Naming a reviewer
- **WHEN** an assessment is submitted with a reviewer id matching an existing employee
- **THEN** the reviewer is recorded and returned with their id and full name

#### Scenario: Reviewer does not exist
- **WHEN** the supplied reviewer id matches no employee
- **THEN** the response is HTTP 404 naming the missing reviewer

#### Scenario: Clearing a reviewer
- **WHEN** an update omits the reviewer id on an assessment that had one
- **THEN** the reviewer reference is cleared

### Requirement: Writing an assessment is governed by role and reviewer scope

Creating, updating, and deleting an assessment SHALL be permitted to an admin, to the employee the assessment belongs to, and to a reviewer whose configured patterns cover that employee or skill. The check MUST be applied before any other work.

#### Scenario: Employee records their own assessment
- **WHEN** an authenticated user creates or updates an assessment whose employee id is their own
- **THEN** the write is permitted

#### Scenario: Employee attempts a colleague's assessment
- **WHEN** a user with role `EMPLOYEE` writes an assessment belonging to someone else
- **THEN** the request is refused with HTTP 403 and the message "You do not have permission to edit this employee's skill grades"

#### Scenario: Reviewer within scope
- **WHEN** a user with role `REVIEWER` writes an assessment for an employee or skill matching their configured patterns
- **THEN** the write is permitted

#### Scenario: Deletion is checked against the stored record
- **WHEN** a user deletes an assessment
- **THEN** permission is evaluated against the employee and skill grade already stored on that record, not against any submitted values

### Requirement: An update replaces the whole assessment

Update SHALL be a full replacement rather than a partial merge: fields absent from the request MUST be cleared, not preserved.

#### Scenario: Update omitting a previously stored field
- **WHEN** an assessment holding an employee comment is updated by a request carrying no employee comment
- **THEN** the stored comment is cleared

#### Scenario: Client preserves untouched fields
- **WHEN** a screen edits only the grade of an assessment
- **THEN** it resends the fields it does not edit, so that saving one skill does not blank the metadata of the others

### Requirement: Assessments can be read by employee or by grade

Assessments SHALL be readable filtered to one employee or to one skill grade, and a filter naming a record that does not exist MUST be reported as missing rather than returning an empty list.

#### Scenario: Reading one employee's assessments
- **WHEN** a client calls `GET /api/employee-skill-grades?employeeId={id}` for an existing employee
- **THEN** the response is an array of that employee's assessments, each carrying the employee's full name, the skill id and name, the grade code, and the recorded detail

#### Scenario: Reading everyone holding a grade
- **WHEN** a client calls `GET /api/employee-skill-grades?skillGradeId={id}` for an existing grade
- **THEN** the response is an array of the assessments recorded against that grade

#### Scenario: Filtering by something that does not exist
- **WHEN** the supplied employee id or skill grade id matches no record
- **THEN** the response is HTTP 404

#### Scenario: Retrieving one assessment
- **WHEN** a client calls `GET /api/employee-skill-grades/{id}` for an existing assessment
- **THEN** the response contains that assessment

### Requirement: Skill selection is scoped to the employee's assigned profiles

When choosing which skills to assess, an employee SHALL be offered the skills belonging to the profiles assigned to them, since those are the skills their role expects. The full catalogue MUST remain reachable on request.

#### Scenario: Employee with assigned profiles
- **WHEN** the skill selection screen is opened for an employee holding one or more profiles
- **THEN** the skills offered are those belonging to the employee's profiles, excluding skills already assessed

#### Scenario: Employee with no assigned profiles
- **WHEN** the screen is opened for an employee holding no profiles
- **THEN** no skills are offered until the scope is widened

#### Scenario: Widening to the whole catalogue
- **WHEN** the user turns on "Show skills from all profiles"
- **THEN** every catalogue skill not already assessed is offered, regardless of profile

#### Scenario: Narrowing by text
- **WHEN** the user types into the filter box
- **THEN** the offered skills are narrowed to those whose name or description contains that text, ignoring case
