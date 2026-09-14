## Purpose

Establishes who is using the Skill Matrix and binds that identity to an `Employee` record, so that every subsequent authorization decision has a known person behind it. Covers both the federated OIDC path used in deployed environments and the password-less local path used for development.

## Requirements

### Requirement: API endpoints require an authenticated caller

All endpoints under `/api/**` SHALL reject unauthenticated requests, except the authentication endpoints themselves, the OpenAPI documentation, and CORS preflight.

#### Scenario: Request without a token
- **WHEN** a client calls any `/api/**` endpoint with no `Authorization` header
- **THEN** the response is HTTP 401 with the standard error body and message "Authentication required"

#### Scenario: Authentication endpoints are open
- **WHEN** a client calls `/api/auth/**` without a token
- **THEN** the request is permitted, so that login can take place

#### Scenario: Documentation is open
- **WHEN** a client requests `/swagger-ui/**`, `/api-docs/**`, or `/v3/api-docs/**`
- **THEN** the request is permitted without authentication

#### Scenario: Preflight is open
- **WHEN** a browser issues an `OPTIONS` request to any path
- **THEN** the request is permitted without authentication

### Requirement: The backend validates tokens as a stateless resource server

The application SHALL hold no server-side session. Authentication state lives entirely in the bearer token presented on each request, which MUST be validated against the issuer's published signing keys.

#### Scenario: Valid token
- **WHEN** a request carries a bearer JWT signed by the configured issuer and not expired
- **THEN** the request proceeds with that token's claims as the authenticated principal

#### Scenario: Expired or malformed token
- **WHEN** a request carries a token that is expired, unsigned, or signed by an unknown key
- **THEN** the response is HTTP 401 and no session is created

#### Scenario: No session is retained between requests
- **WHEN** two requests arrive from the same client
- **THEN** each is authenticated independently from its own token, with session creation policy STATELESS

### Requirement: The authenticated identity resolves to an Employee by email

The `email` claim of the token SHALL identify the user. Where that claim is absent, the token subject SHALL be used instead. The resulting address MUST be matched against the `email` column of `employee`.

#### Scenario: Token carries an email claim
- **WHEN** a valid token contains `email: "jan.kowalski@company.com"` and an Employee exists with that email
- **THEN** that Employee becomes the current user for the request

#### Scenario: Token carries no email claim
- **WHEN** a valid token has no `email` claim but has a subject
- **THEN** the subject is used as the email for Employee lookup

#### Scenario: Token carries neither
- **WHEN** a valid token has neither an `email` claim nor a subject
- **THEN** access is denied with HTTP 403

### Requirement: Users are not auto-provisioned

A successfully authenticated person who has no `Employee` record SHALL be denied access, and no record MUST be created on their behalf.

#### Scenario: Authenticated but unknown person
- **WHEN** a caller presents a valid token for an email with no matching Employee row
- **THEN** access is denied with HTTP 403 and the message names the unmatched email
- **AND** no Employee record is created

### Requirement: The current user is discoverable

The application SHALL expose the identity it is acting as, including the role resolved for that person, so that the frontend need not inspect the token itself.

#### Scenario: Reading the current user
- **WHEN** an authenticated client calls `GET /api/auth/me`
- **THEN** the response contains the current user's `email`, `firstName`, `lastName`, and resolved `role`

### Requirement: A development profile provides password-less login

When the `dev` Spring profile is active, a local login endpoint SHALL issue tokens signed with a local key, so the application can run without reaching a corporate identity provider. This endpoint MUST NOT exist under any other profile.

#### Scenario: Dev login for a known employee
- **WHEN** the `dev` profile is active and a client posts an email matching an existing Employee to `POST /api/auth/dev-login`
- **THEN** the response contains a JWT valid for 8 hours, carrying issuer `skill-matrix-dev` and an `email` claim, plus the caller's email and resolved role

#### Scenario: The password is not checked
- **WHEN** a dev login request supplies any password, or none
- **THEN** the password is ignored and the token is issued on the strength of the email alone

#### Scenario: Dev login for an unknown employee
- **WHEN** a dev login request names an email with no Employee record
- **THEN** access is denied with HTTP 403

#### Scenario: Dev login is absent outside the dev profile
- **WHEN** the `dev` profile is not active
- **THEN** `POST /api/auth/dev-login` is not registered and the dev token signing key is not created
