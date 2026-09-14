# Target authentication mechanism
Skill Matrix app in target environment will use a **federated authentication chain** — two separate OIDC/OAuth2 hops. Here's what's happening:

## The Architecture: Federated Identity (Two-Hop Auth)

```
Browser → skill-matrix.pse.pl → identity.intra.pse.pl → idpi.pse.pl (ADFS)
   (Skill matrix app)         (identity broker/gateway)      (actual AD auth)
```

---

## Hop 1 — Skill Matrix App → Identity Broker

**URL:** `https://identity.intra.pse.pl/connect/authorize/callback`

| Parameter       | Value                                                      | Meaning                                                       |
| --------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| `client_id`     | `skill-matrix`                                             | App name                                                      |
| `response_type` | `code id_token`                                            | **Hybrid Flow** (both auth code + id token returned together) |
| `response_mode` | `form_post`                                                | Tokens sent via HTTP POST, not in URL fragment                |
| `scope`         | `openid email profile offline_access skill-matrix`         | Requests refresh token (`offline_access`) + custom scope      |
| `redirect_uri`  | `https://intra.pse.pl/`                                    | Where to return after login                                   |
| `x-client-SKU`  | `ID_NET472`                                                | Microsoft's .NET 4.7.2 OIDC middleware                        |

**Server:** `identity.intra.pse.pl` — this is almost certainly **[IdentityServer4/Duende IdentityServer](https://duendesoftware.com/)**, a popular .NET identity broker. The `/connect/authorize` path is its signature endpoint.

---

## Hop 2 — Identity Broker → ADFS (the real AD authentication)

**URL:** `https://idpi.pse.pl/adfs/oauth2/authorize/`

|Parameter|Value|Meaning|
|---|---|---|
|`client_id`|`8464de9d-74f8-491a-8392-5096eef624da`|IdentityServer registered as a client in ADFS|
|`redirect_uri`|`https://identity.intra.pse.pl/signin-adfs`|Callback back to the identity broker|
|`response_type`|`code id_token`|Hybrid Flow again|
|`response_mode`|`form_post`|Same as above|
|`scope`|`openid profile`|Basic claims only — ADFS just authenticates the user|
|`x-client-SKU`|`ID_NET8_0`|Microsoft's .NET 8 OIDC middleware|

**Server:** `idpi.pse.pl/adfs/` — this is **Microsoft ADFS (Active Directory Federation Services)**. The `/adfs/oauth2/` path is the definitive ADFS signature.

---

## Summary

| Layer             | Server                          | Software                                | Role                                        |
| ----------------- | ------------------------------- | --------------------------------------- | ------------------------------------------- |
| Identity Broker   | `identity.intra.pse.pl`         | **Duende/IdentityServer4** (.NET 4.7.2) | Federates identities, issues tokens to apps |
| Corporate AD Auth | `idpi.pse.pl`                   | **Microsoft ADFS** (.NET 8)             | Actual Windows AD authentication            |
| Skill Matrix App  | `skill-matrix.pse-innowacje.pl` | Java                                    | Consumes tokens from IdentityServer         |

## What This Means for Configuring Your New App

You should integrate with **IdentityServer** (`identity.intra.pse.pl`), **not** directly with ADFS. Check its discovery document:

```
https://identity.intra.pse.pl/.well-known/openid-configuration
```

You'll need your IT/identity team to:

1. Register your new app as a client in IdentityServer with `client_id` of your choice
2. Add your app's callback URL as an allowed `redirect_uri`
3. Grant the scopes you need (`openid email profile` at minimum)
4. Provide you with a `client_secret`

The flow to implement in your app is **Authorization Code Flow with PKCE** (recommended for SPAs over the hybrid flow used in the existing app).

---

# Frontend Authentication Flow

The React SPA handles authentication directly via **Authorization Code Flow with PKCE**:

1. User clicks "Login" → SPA redirects browser to IdentityServer's `/connect/authorize` endpoint with a PKCE `code_challenge`
2. User authenticates via IdentityServer → ADFS chain
3. IdentityServer redirects back to the SPA's callback URL with an authorization `code`
4. SPA exchanges the `code` + `code_verifier` for an **access token** and **refresh token**
5. SPA stores tokens **in memory** (not localStorage — to mitigate XSS risks)
6. Every API request includes the `Authorization: Bearer <access_token>` header
7. When the access token expires, the SPA uses the refresh token (`offline_access` scope) to obtain a new one silently

---

# Backend Token Validation

The backend acts as a **stateless OAuth2 Resource Server**:

- Validates incoming JWT access tokens on every request
- Retrieves IdentityServer's signing keys via the JWKS endpoint (discovered from `/.well-known/openid-configuration`)
- No server-side sessions — authentication state lives entirely in the token
- Rejects requests with missing, expired, or invalid tokens with HTTP 401

---

# User Identity Mapping

- The `email` claim from the OIDC access token is used to look up the `Employee` record by its `email` column
- If no matching Employee record exists, access is denied (HTTP 403) — there is no auto-provisioning of users
- The matched Employee becomes the "current user" for authorization decisions

---

# Test authentication
For local development and testing, a `dev` Spring profile replaces OIDC with a simple login endpoint:

- **Endpoint:** `POST /api/auth/dev-login`
- **Request body:** `{ "email": "user@company.com", "password": "anything" }`
- **Behavior:** Accepts any password. The email must match an existing Employee record.
- **Response:** Returns a JWT signed with a local dev signing key
- **Activation:** `spring.profiles.active=dev` (via `application-dev.yml`)
- **Safety:** This endpoint does not exist when the `dev` profile is not active. It must never be enabled in production.

The returned JWT has the same structure as a real IdentityServer token (contains `email` claim), so the rest of the backend authorization logic works identically.

---

# Authorization

The authorization schema is a simple RBAC model with three roles: **EMPLOYEE**, **REVIEWER**, and **ADMIN**.

## Role Resolution

Roles are **not** carried in the OIDC token. They are resolved server-side based on the authenticated user's email and the `authorization.yml` configuration file:

- **EMPLOYEE** — Default role for every authenticated user. No configuration needed.
- **ADMIN** — Granted to users whose email appears in the `admins` list in `authorization.yml`.
- **REVIEWER** — Granted to users whose email appears in the `reviewers` list in `authorization.yml`, along with their specific permission patterns.

## Role Permissions

Everyone can **read** all data.

**EMPLOYEE** can edit only their own data:
- Their own employee details (name, department, position)
- Their own employee skill grades

**REVIEWER** can edit employee skill grades according to their permissions defined in `authorization.yml`. A reviewer's permission patterns are combined with **OR (union)** logic — if an employee matches **any** of the reviewer's configured patterns, the reviewer can edit that employee's skills.

**ADMIN** can view and edit everything.

## Configuration File: `authorization.yml`

Location: `backend/src/main/resources/authorization.yml` (classpath resource)

The file defines which users are admins and which are reviewers with their permission scopes:

```yaml
admins:
  - admin@company.com
  - jane.doe@company.com

reviewers:
  - email: john.smith@company.com
    permissions:
      department.patterns: ["CKI-P", "CKI-IT*"]
      profile.patterns: ["Analyst"]
  - email: anna.nowak@company.com
    permissions:
      skill.patterns: ["*Java*", "*Python*"]
      email.patterns: ["jak.kowalski*", "*galka*"]
```

### Pattern types

| Pattern key            | Matches against          | Example                          |
| ---------------------- | ------------------------ | -------------------------------- |
| `department.patterns`  | Employee's department    | `"CKI-P"`, `"CKI-IT*"`          |
| `profile.patterns`     | Skill profile name       | `"Analyst"`, `"*Developer*"`     |
| `skill.patterns`       | Skill name               | `"*Java*"`, `"*Python*"`         |
| `email.patterns`       | Employee's email address | `"jak.kowalski*"`, `"*galka*"`   |

Patterns use glob-style wildcards (`*` matches any sequence of characters).

### Permission evaluation

A reviewer can edit an employee's skill if the employee matches **any** of the reviewer's patterns (OR across all pattern types). For example, if a reviewer has:
```yaml
department.patterns: ["CKI-P"]
email.patterns: ["*galka*"]
```
They can edit skills of employees in department CKI-P **or** employees whose email contains "galka".
