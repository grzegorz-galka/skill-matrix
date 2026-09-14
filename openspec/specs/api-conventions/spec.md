## Purpose

The shapes every endpoint shares: how a page of results is wrapped, how a failure is reported, how the API describes itself, and which browsers may call it. Gathered here so that individual capabilities can describe behaviour without restating the envelope each time.

## Requirements

### Requirement: Paged collections are returned in an envelope

Where an endpoint pages its results, the response SHALL carry the page's contents alongside the metadata a client needs to page through the rest. The page index MUST be named `page` rather than Spring's default `number`, because that is what clients expect.

#### Scenario: Reading a paged collection
- **WHEN** a client calls a paginated endpoint such as `GET /api/employees` or `GET /api/skills`
- **THEN** the response carries `content`, `page`, `size`, `totalElements`, and `totalPages`

#### Scenario: Default and maximum page size
- **WHEN** a client supplies no page size
- **THEN** 20 items are returned, and any requested size above 100 is capped at 100

#### Scenario: Collections returned without the envelope
- **WHEN** a client calls `GET /api/skill-profiles`, `GET /api/skill-grades`, or `GET /api/employee-skill-grades`
- **THEN** the response is a bare JSON array, and supplying `paginated=true` pages the underlying query but still returns an array with no page metadata

### Requirement: Failures share one error shape

Every handled failure SHALL be reported with the same body, carrying the HTTP status, a short reason, a human-readable message, an optional list of details, and the time the error was produced.

#### Scenario: Reading an error response
- **WHEN** any request fails
- **THEN** the body carries `status`, `error`, `message`, and `timestamp`, with `details` present only where the failure has per-field information

### Requirement: Failures map to conventional status codes

Each class of failure SHALL map to its conventional HTTP status, so that a client can act on the status alone.

#### Scenario: Missing record
- **WHEN** a requested record does not exist
- **THEN** the response is HTTP 404 with error "Not Found"

#### Scenario: Uniqueness violated
- **WHEN** a write would duplicate a value that must be unique
- **THEN** the response is HTTP 409 with error "Conflict"

#### Scenario: Validation failed
- **WHEN** a request body fails bean validation
- **THEN** the response is HTTP 400 with error "Validation Failed" and a `details` entry of the form `field: message` for each failing field

#### Scenario: Not authenticated
- **WHEN** a protected endpoint is called without valid authentication
- **THEN** the response is HTTP 401 with error "Unauthorized"

#### Scenario: Not permitted
- **WHEN** an authenticated caller is refused by an authorization check
- **THEN** the response is HTTP 403 with error "Forbidden"

#### Scenario: Unhandled failure
- **WHEN** a request fails for a reason with no specific handler
- **THEN** the response is HTTP 500 with error "Internal Server Error" and a message prefixed "An unexpected error occurred"

### Requirement: The API describes itself

Endpoints SHALL be annotated so that an interactive description of the API is published alongside it, reachable without authentication.

#### Scenario: Reading the documentation
- **WHEN** a client opens `/swagger-ui.html`
- **THEN** the API browser is served, with operations grouped by tag and sorted by method

#### Scenario: Reading the machine-readable description
- **WHEN** a client requests `/api-docs`
- **THEN** the OpenAPI document is returned

### Requirement: Cross-origin requests are accepted from any origin

The API is called by a browser application served from a different origin, so cross-origin requests SHALL be permitted. Any origin MUST be accepted, with credentials allowed, for the methods and headers the frontend uses.

#### Scenario: Browser preflight
- **WHEN** a browser preflights a request from any origin
- **THEN** the response permits that origin with credentials, allowing GET, POST, PUT, DELETE, and OPTIONS, and the Authorization, Content-Type, Accept, Origin, and X-Requested-With headers

#### Scenario: Authorization header is readable
- **WHEN** a cross-origin response is returned
- **THEN** the Authorization header is exposed to the calling script

### Requirement: Schema changes are applied by versioned migration

The database schema SHALL be owned by versioned migration scripts run at startup, and the persistence layer MUST validate itself against the result rather than altering it. Applied migrations MUST NOT be edited; corrections arrive as new versions.

#### Scenario: Starting against an out-of-date database
- **WHEN** the application starts and migrations remain unapplied
- **THEN** they are applied in version order before the application serves traffic

#### Scenario: Entity mapping disagrees with the schema
- **WHEN** the mapped entities do not match the migrated schema
- **THEN** startup fails rather than the schema being altered to fit
