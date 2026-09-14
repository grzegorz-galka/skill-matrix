## Purpose

Defines the proficiency scale for each skill. Every skill carries its own set of named grades, so that "Java" can be scored beginner-to-expert while a different skill uses a scale of its own. A numeric level sits alongside each grade so that grades from different skills can be compared and rendered on a common colour ramp.

## Requirements

### Requirement: A grade belongs to one skill and carries a code, description, and level

A skill grade SHALL be defined by the skill it applies to, a short code of at most 50 characters, a numeric level, and optionally a description of at most 255 characters.

#### Scenario: Creating a grade
- **WHEN** an admin posts a grade naming an existing skill, with a code not already used for that skill
- **THEN** the grade is created and returned with HTTP 201

#### Scenario: Grade names an unknown skill
- **WHEN** the request's skill id matches no skill
- **THEN** the response is HTTP 404

#### Scenario: Required fields missing
- **WHEN** the request omits the skill id or the code
- **THEN** the response is HTTP 400 naming each failing field

### Requirement: Level runs from 1 to 5 and defaults to 1

The level SHALL express proficiency on a shared five-point ramp, from 1 for the least proficient grade to 5 for the most. It MUST be stored as a non-null integer constrained by the database to the range 1 to 5 inclusive.

#### Scenario: Level omitted
- **WHEN** a grade is submitted with no level
- **THEN** the grade is stored with level 1

#### Scenario: Level out of range
- **WHEN** a grade is submitted with a level below 1 or above 5
- **THEN** the response is HTTP 400 with the message "Level must be between 1 and 5"

#### Scenario: Level within range
- **WHEN** a grade is submitted with a level of 3
- **THEN** the grade is stored with level 3

### Requirement: Grade codes are unique within their skill

A code MAY be reused across different skills, but MUST NOT be defined twice within one skill.

#### Scenario: Duplicate code for the same skill
- **WHEN** a grade is created with a code already defined for that skill
- **THEN** the request is refused with HTTP 409

#### Scenario: Same code on a different skill
- **WHEN** a grade is created with a code already used, but for a different skill
- **THEN** the grade is created

#### Scenario: Updating a grade into a collision
- **WHEN** an update would give a grade a code already held by another grade of the same skill
- **THEN** the request is refused with HTTP 409

### Requirement: Only admins manage skill grades

Creating, updating, and deleting skill grades SHALL be reserved to `ADMIN`. Deleting a grade MUST remove every employee assessment recorded against it.

#### Scenario: Non-admin attempts a change
- **WHEN** a non-admin creates, updates, or deletes a skill grade
- **THEN** the request is refused with HTTP 403 and the message "Only admins can manage skill grades"

#### Scenario: Deleting a grade
- **WHEN** an admin deletes an existing grade
- **THEN** the response is HTTP 204, and every employee assessment recorded against that grade is removed with it

#### Scenario: Deleting a grade that does not exist
- **WHEN** an admin deletes an id matching no grade
- **THEN** the response is HTTP 404

### Requirement: Grades can be listed for a skill or across the catalogue

Listing SHALL return a plain array. Passing `paginated=true` SHALL page the underlying query, though the response MUST remain an array rather than a pagination envelope.

#### Scenario: Listing grades of one skill
- **WHEN** a client calls `GET /api/skill-grades?skillId={id}` for an existing skill
- **THEN** the response is an array of that skill's grades

#### Scenario: Listing grades of an unknown skill
- **WHEN** the supplied skill id matches no skill
- **THEN** the response is HTTP 404

#### Scenario: Listing every grade
- **WHEN** a client calls `GET /api/skill-grades` with no filter
- **THEN** the response is an array of every grade in the catalogue

#### Scenario: Retrieving one grade
- **WHEN** a client calls `GET /api/skill-grades/{id}` for an existing grade
- **THEN** the response contains the grade's id, skill id, skill name, code, description, level, and timestamps
