## Purpose

Maintains the roster of people whose skills the application tracks. An employee record is also the anchor for authentication, since the token's email is matched against it, and for authorization, since editing rights are largely defined relative to "yourself".

## Requirements

### Requirement: Employees are listed with pagination

The employee list SHALL be paged, with defaults and an upper bound applied by the framework so that a single request cannot pull the whole roster.

#### Scenario: Default listing
- **WHEN** a client calls `GET /api/employees` with no paging parameters
- **THEN** the response is a pagination envelope containing at most 20 employees, with `page`, `size`, `totalElements`, and `totalPages`

#### Scenario: Oversized page request
- **WHEN** a client requests a page size above 100
- **THEN** the size is capped at 100

### Requirement: Employees can be searched by name or email

A single search term SHALL filter the roster on first name, last name, or email, matching anywhere in the value and ignoring case.

#### Scenario: Partial name search
- **WHEN** a client calls `GET /api/employees?search=kowal`
- **THEN** the response contains employees whose first name, last name, or email contains "kowal" in any case, paged as usual

#### Scenario: Blank search term
- **WHEN** the `search` parameter is absent, empty, or only whitespace
- **THEN** the unfiltered paginated list is returned

### Requirement: A single employee can be retrieved by id

The application SHALL return one employee by its identifier, and MUST report a missing identifier rather than an empty result.

#### Scenario: Employee exists
- **WHEN** a client calls `GET /api/employees/{id}` for an existing employee
- **THEN** the response contains that employee's id, first name, last name, email, department, position, and timestamps

#### Scenario: Employee does not exist
- **WHEN** the id matches no employee
- **THEN** the response is HTTP 404 with a message naming the id

### Requirement: Only admins create employees, and email is unique

Creating an employee SHALL be reserved to `ADMIN`. A new employee MUST carry a first name, a last name, and a valid email address of at most 255 characters, unique across the roster. First name, last name, department, and position SHALL each be capped at 100 characters; department and position are optional.

#### Scenario: Admin creates an employee
- **WHEN** an admin posts a valid employee to `POST /api/employees`
- **THEN** the employee is created and the response is HTTP 201 with the stored record

#### Scenario: Non-admin attempts creation
- **WHEN** a non-admin posts to `POST /api/employees`
- **THEN** the request is refused with HTTP 403 and the message "Only admins can create employees"

#### Scenario: Email already in use
- **WHEN** the submitted email already belongs to another employee
- **THEN** the request is refused with HTTP 409

#### Scenario: Missing or malformed fields
- **WHEN** the request omits a first name, last name, or email, or the email is not a valid address
- **THEN** the response is HTTP 400 listing each failing field

### Requirement: An employee record is edited by its owner or an admin

Updating an employee SHALL be permitted to an admin and to the person that record describes, and MUST be refused to anyone else.

#### Scenario: Owner updates their own record
- **WHEN** an authenticated user updates the employee whose id is their own
- **THEN** the update succeeds and the stored record reflects the new values

#### Scenario: Admin updates any record
- **WHEN** an admin updates any employee
- **THEN** the update succeeds

#### Scenario: Someone else attempts the update
- **WHEN** a non-admin updates an employee that is not themselves
- **THEN** the request is refused with HTTP 403

#### Scenario: Update collides with another employee's email
- **WHEN** the update sets an email already held by a different employee
- **THEN** the request is refused with HTTP 409

### Requirement: Only admins delete employees, and dependent records follow

Deleting an employee SHALL be reserved to `ADMIN` and MUST remove their skill profile assignments and skill assessments. Where the deleted employee was recorded as the reviewer of someone else's assessment, that reviewer reference SHALL be cleared rather than the assessment deleted.

#### Scenario: Admin deletes an employee
- **WHEN** an admin calls `DELETE /api/employees/{id}` for an existing employee
- **THEN** the response is HTTP 204, and the employee's profile assignments and skill grades are removed with them

#### Scenario: Deleted employee was a reviewer
- **WHEN** the deleted employee was recorded as `reviewedBy` on another employee's assessment
- **THEN** that assessment survives with its reviewer reference set to null

#### Scenario: Non-admin attempts deletion
- **WHEN** a non-admin calls `DELETE /api/employees/{id}`
- **THEN** the request is refused with HTTP 403 and the message "Only admins can delete employees"

#### Scenario: Employee does not exist
- **WHEN** an admin deletes an id that matches no employee
- **THEN** the response is HTTP 404
