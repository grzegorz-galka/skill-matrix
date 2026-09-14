## Purpose

Groups skills into named profiles such as "Java Developer" or "Analyst", and assigns those profiles to employees. A person's assigned profiles determine which skills they are expected to grade themselves on, and profile names are also one of the dimensions a reviewer's permissions can be written against.

## Requirements

### Requirement: Skill profiles have a unique name

A profile SHALL carry a name of at most 100 characters, which MUST be unique across all profiles, and MAY carry a free-text description.

#### Scenario: Creating a profile
- **WHEN** an admin posts a profile with a name not already in use
- **THEN** the profile is created and returned with HTTP 201

#### Scenario: Name already in use
- **WHEN** the submitted name already belongs to another profile
- **THEN** the request is refused with HTTP 409

#### Scenario: Name missing
- **WHEN** the request omits the name or supplies only whitespace
- **THEN** the response is HTTP 400 naming the field

#### Scenario: Renaming to a name already in use
- **WHEN** an admin updates a profile to a name held by a different profile
- **THEN** the request is refused with HTTP 409

#### Scenario: Renaming to its own current name
- **WHEN** an admin updates a profile without changing its name
- **THEN** the update succeeds

### Requirement: Only admins manage skill profiles

Creating, updating, and deleting skill profiles SHALL be reserved to `ADMIN`. Deleting a profile MUST remove its employee assignments and skill associations with it.

#### Scenario: Non-admin attempts a change
- **WHEN** a non-admin creates, updates, or deletes a skill profile
- **THEN** the request is refused with HTTP 403 and the message "Only admins can manage skill profiles"

#### Scenario: Deleting a profile
- **WHEN** an admin deletes an existing profile
- **THEN** the response is HTTP 204, and the profile's employee assignments and skill associations are removed with it

#### Scenario: Deleting a profile that does not exist
- **WHEN** an admin deletes an id matching no profile
- **THEN** the response is HTTP 404

### Requirement: Skill profiles can be listed and retrieved

Listing SHALL return every profile as a plain array by default. Passing `paginated=true` SHALL page the underlying query, though the response MUST remain an array rather than a pagination envelope.

#### Scenario: Listing all profiles
- **WHEN** a client calls `GET /api/skill-profiles`
- **THEN** the response is an array of every profile

#### Scenario: Listing with paging requested
- **WHEN** a client calls `GET /api/skill-profiles?paginated=true`
- **THEN** the response is an array holding only the requested page's profiles, without page metadata

#### Scenario: Retrieving one profile
- **WHEN** a client calls `GET /api/skill-profiles/{id}` for an existing profile
- **THEN** the response contains that profile's id, name, description, and timestamps

#### Scenario: Retrieving a profile that does not exist
- **WHEN** the id matches no profile
- **THEN** the response is HTTP 404

### Requirement: Admins assign skill profiles to employees

Assigning and removing an employee's skill profiles SHALL be reserved to `ADMIN`. An employee MAY hold any number of profiles, but each profile MUST be held at most once.

#### Scenario: Assigning a profile
- **WHEN** an admin calls `POST /api/employees/{employeeId}/skill-profiles/{skillProfileId}` for a pairing that does not yet exist
- **THEN** the assignment is created and the response is HTTP 204

#### Scenario: Assigning a profile the employee already holds
- **WHEN** the employee already has that profile assigned
- **THEN** the request is refused with HTTP 409

#### Scenario: Assigning an unknown employee or profile
- **WHEN** either the employee id or the profile id matches no record
- **THEN** the response is HTTP 404 naming the missing one

#### Scenario: Non-admin attempts an assignment
- **WHEN** a non-admin assigns or removes a profile on an employee
- **THEN** the request is refused with HTTP 403 and the message "Only admins can manage employee skill profile assignments"

### Requirement: Profile assignments can be read and removed

The profiles assigned to an employee SHALL be readable, and an existing assignment MUST be removable by an admin.

#### Scenario: Listing an employee's profiles
- **WHEN** a client calls `GET /api/employees/{id}/skill-profiles` for an existing employee
- **THEN** the response is an array of the profiles assigned to that employee

#### Scenario: Listing profiles for an unknown employee
- **WHEN** the employee id matches no record
- **THEN** the response is HTTP 404

#### Scenario: Removing an assignment
- **WHEN** an admin calls `DELETE /api/employees/{employeeId}/skill-profiles/{skillProfileId}` for an existing assignment
- **THEN** the assignment is removed and the response is HTTP 204

#### Scenario: Removing an assignment that does not exist
- **WHEN** the employee does not hold that profile
- **THEN** the response is HTTP 404
