## Purpose

Decides what an authenticated user may change. Roles are not carried in the identity token; they are resolved server-side from a configuration file, so that granting someone review rights is a deployment concern rather than a directory change.

## Requirements

### Requirement: Three roles are resolved from configuration

Every authenticated user SHALL hold exactly one of `EMPLOYEE`, `REVIEWER`, or `ADMIN`. The role MUST be derived from the user's email address and the `authorization.yml` classpath resource, which lists admin addresses and reviewer entries. Email comparison SHALL ignore case.

#### Scenario: Address listed under admins
- **WHEN** the current user's email appears in the `admins` list
- **THEN** their role is `ADMIN`

#### Scenario: Address listed under reviewers
- **WHEN** the current user's email appears as a `reviewers[].email` and is not an admin
- **THEN** their role is `REVIEWER`

#### Scenario: Address listed nowhere
- **WHEN** the current user's email appears in neither list
- **THEN** their role is `EMPLOYEE`

#### Scenario: Admin takes precedence
- **WHEN** an email appears in both `admins` and `reviewers`
- **THEN** the resolved role is `ADMIN`

#### Scenario: Configuration is unreadable
- **WHEN** `authorization.yml` is missing or cannot be parsed at startup
- **THEN** application startup fails rather than defaulting to an open or closed policy

### Requirement: All authenticated users may read all data

Reading SHALL NOT be restricted by role. Any authenticated user MAY retrieve any employee, skill, profile, grade, and assessment, including the free-text employee and reviewer comments recorded against other people's skills.

#### Scenario: Employee reads another employee's assessments
- **WHEN** a user with role `EMPLOYEE` requests the skill grades of a colleague
- **THEN** the response succeeds and includes that colleague's `employeeComment` and `reviewerComment`

### Requirement: An employee may edit only their own record

A user with role `EMPLOYEE` SHALL be permitted to change their own employee details and their own skill assessments, and MUST NOT be permitted to change anything else.

#### Scenario: Editing own employee record
- **WHEN** a user with role `EMPLOYEE` updates the employee whose id matches their own
- **THEN** the update succeeds

#### Scenario: Editing another employee's record
- **WHEN** a user with role `EMPLOYEE` updates an employee that is not themselves
- **THEN** the request is refused with HTTP 403 and the message "Cannot edit another employee's record"

### Requirement: Only admins manage catalogue and assignments

Creating, updating, and deleting skills, skill profiles, skill grades, skill-to-profile associations, and employee-to-profile assignments SHALL be reserved to `ADMIN`, as MUST creating and deleting employees.

#### Scenario: Non-admin attempts catalogue change
- **WHEN** a user whose role is not `ADMIN` creates, updates, or deletes a skill, skill profile, or skill grade
- **THEN** the request is refused with HTTP 403 naming the restricted operation

#### Scenario: Non-admin attempts an assignment change
- **WHEN** a user whose role is not `ADMIN` assigns or removes a skill profile on an employee, or associates a skill with a profile
- **THEN** the request is refused with HTTP 403

#### Scenario: Non-admin attempts employee creation or deletion
- **WHEN** a user whose role is not `ADMIN` creates or deletes an employee
- **THEN** the request is refused with HTTP 403

### Requirement: Reviewer scope is the union of all configured patterns

A reviewer entry MAY carry four kinds of pattern: `department.patterns`, `profile.patterns`, `skill.patterns`, and `email.patterns`. A reviewer SHALL be permitted to edit a target employee's skill grade where the target matches **any** pattern of **any** kind. The kinds MUST be combined with OR, so a pattern of one kind can only widen the reviewer's reach and can never narrow what another kind has already granted.

#### Scenario: Department match
- **WHEN** a reviewer's `department.patterns` matches the target employee's department
- **THEN** the reviewer may edit that employee's skill grades

#### Scenario: Email match
- **WHEN** a reviewer's `email.patterns` matches the target employee's email
- **THEN** the reviewer may edit that employee's skill grades

#### Scenario: Assigned profile match
- **WHEN** any skill profile assigned to the target employee matches the reviewer's `profile.patterns`
- **THEN** the reviewer may edit that employee's skill grades

#### Scenario: Skill match
- **WHEN** the skill behind the skill grade being edited matches the reviewer's `skill.patterns`
- **THEN** the reviewer may edit that grade

#### Scenario: A skill pattern does not narrow a department grant
- **WHEN** a reviewer is configured with `department.patterns: ["CKI-P"]` and `skill.patterns: ["*Java*"]`
- **AND** the target employee's department is `CKI-P`
- **THEN** the reviewer may edit **every** skill grade of that employee, not only their Java skills, because the department match alone satisfies the union

#### Scenario: No pattern matches
- **WHEN** a reviewer edits a skill grade of an employee matching none of their patterns
- **THEN** the request is refused with HTTP 403

#### Scenario: Reviewer edits their own skills
- **WHEN** a user with role `REVIEWER` edits their own skill grade
- **THEN** the edit is permitted regardless of their configured patterns

### Requirement: Patterns are matched as case-insensitive globs

Configured patterns and matrix filters SHALL use glob syntax, where `*` matches any sequence of characters and `?` matches a single character. Comparison MUST ignore case.

#### Scenario: Wildcard suffix
- **WHEN** the pattern is `CKI-IT*` and the value is `CKI-IT-DEV`
- **THEN** the value matches

#### Scenario: Wildcard on both sides
- **WHEN** the pattern is `*galka*` and the value is `grzegorz.galka@pse.pl`
- **THEN** the value matches

#### Scenario: Case is ignored
- **WHEN** the pattern is `analyst` and the value is `Analyst`
- **THEN** the value matches

#### Scenario: Absent value or empty pattern list
- **WHEN** the value being tested is null, or the pattern list is empty or absent
- **THEN** no match is reported for that pattern kind

### Requirement: Admins are unrestricted

A user with role `ADMIN` SHALL pass every authorization check in the application.

#### Scenario: Admin edits any record
- **WHEN** a user with role `ADMIN` edits any employee, skill grade, or catalogue entry
- **THEN** the operation is permitted without further checks
