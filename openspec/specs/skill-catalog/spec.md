## Purpose

Holds the organisation's list of skills and connects each skill to the profiles that expect it. A skill belongs to many profiles and a profile contains many skills, so that a skill such as "SQL" can be shared across several roles without being duplicated.

## Requirements

### Requirement: Skills have a unique name

A skill SHALL carry a name of at most 100 characters, which MUST be unique across the catalogue, and MAY carry a free-text description. A skill MUST NOT carry a profile of its own; the relationship to profiles is held separately.

#### Scenario: Creating a skill
- **WHEN** an admin posts a skill with a name not already in use
- **THEN** the skill is created and returned with HTTP 201

#### Scenario: Name already in use
- **WHEN** the submitted name already belongs to another skill
- **THEN** the request is refused with HTTP 409

#### Scenario: Name missing
- **WHEN** the request omits the name or supplies only whitespace
- **THEN** the response is HTTP 400 naming the field

#### Scenario: Renaming to a name already in use
- **WHEN** an admin updates a skill to a name held by a different skill
- **THEN** the request is refused with HTTP 409

### Requirement: Only admins manage the skill catalogue

Creating, updating, and deleting skills SHALL be reserved to `ADMIN`. Deleting a skill MUST remove its grades, its profile associations, and every employee assessment of those grades.

#### Scenario: Non-admin attempts a change
- **WHEN** a non-admin creates, updates, or deletes a skill
- **THEN** the request is refused with HTTP 403 and the message "Only admins can manage skills"

#### Scenario: Deleting a skill
- **WHEN** an admin deletes an existing skill
- **THEN** the response is HTTP 204, and the skill's grades, its profile associations, and every employee assessment of those grades are removed with it

#### Scenario: Deleting a skill that does not exist
- **WHEN** an admin deletes an id matching no skill
- **THEN** the response is HTTP 404

### Requirement: A skill is returned with its profiles and grades

Reading a skill SHALL yield not just its own fields but the profiles it belongs to and the grade scale defined for it, so that a caller can render a skill without further requests.

#### Scenario: Retrieving one skill
- **WHEN** a client calls `GET /api/skills/{id}` for an existing skill
- **THEN** the response contains the skill's id, name, description, timestamps, its associated skill profiles, and its skill grades

#### Scenario: Retrieving a skill that does not exist
- **WHEN** the id matches no skill
- **THEN** the response is HTTP 404

#### Scenario: Listing skills
- **WHEN** a client calls `GET /api/skills`
- **THEN** the response is a pagination envelope whose entries each carry their associated profiles and grades

#### Scenario: Related data is loaded in bulk
- **WHEN** a page of skills is listed
- **THEN** the profiles and grades for the whole page are fetched in a fixed number of queries rather than one pair per skill

### Requirement: Skills are associated with profiles many-to-many

A skill MAY belong to any number of profiles and a profile to any number of skills, but each pairing MUST exist at most once. Changing an association SHALL be reserved to `ADMIN`.

#### Scenario: Associating a skill with a profile
- **WHEN** an admin calls `POST /api/skills/{skillId}/skill-profiles/{skillProfileId}` for a pairing that does not yet exist
- **THEN** the association is created and the response is HTTP 201

#### Scenario: Association already exists
- **WHEN** the skill is already associated with that profile
- **THEN** the request is refused with HTTP 409

#### Scenario: Associating an unknown skill or profile
- **WHEN** either the skill id or the profile id matches no record
- **THEN** the response is HTTP 404 naming the missing one

#### Scenario: Non-admin attempts an association change
- **WHEN** a non-admin creates or removes an association
- **THEN** the request is refused with HTTP 403 and the message "Only admins can manage skill-profile associations"

### Requirement: Associations can be read and removed

The profiles a skill belongs to SHALL be readable, and an existing association MUST be removable by an admin.

#### Scenario: Listing a skill's profiles
- **WHEN** a client calls `GET /api/skills/{skillId}/skill-profiles`
- **THEN** the response is an array of the profiles that skill belongs to

#### Scenario: Removing an association
- **WHEN** an admin calls `DELETE /api/skills/{skillId}/skill-profiles/{skillProfileId}` for an existing association
- **THEN** the association is removed and the response is HTTP 204

#### Scenario: Removing an association that does not exist
- **WHEN** no association exists between that skill and profile
- **THEN** the response is HTTP 404
