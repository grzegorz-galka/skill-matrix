# CLAUDE.md - Employee Skills Management Application

## Project Overview

A web application for collecting and maintaining employee skills information.
Skills are grouped into skill profiles. Every employee has a few skill profiles assigned.
Every skill has three to five grades defined, e.g. beginner, intermediate, advanced, expert.
Based on the assigned profiles the employee selects a grade for every skill they possess.
A Skills Matrix report cross-tabulates employees against skills for reporting and export.

**Tech Stack:**
- **Database:** PostgreSQL 16 (`postgres:16-alpine` via Docker Compose)
- **Backend:** Java 21, Spring Boot 3.2.1
- **Frontend:** React 18.2 with TypeScript 5.3, Material-UI (MUI) 7
- **Build:** Maven (backend), Vite 5 (frontend)
- **Auth:** OIDC / OAuth2 resource server, with a dev-profile fallback
- **IDE:** IntelliJ IDEA

### Backend dependencies

| Dependency | Version | Purpose |
|---|---|---|
| `spring-boot-starter-parent` | 3.2.1 | Dependency management |
| `spring-boot-starter-web` | (managed) | REST controllers |
| `spring-boot-starter-data-jpa` | (managed) | Persistence |
| `spring-boot-starter-validation` | (managed) | Bean Validation on DTOs |
| `spring-boot-starter-security` | (managed) | Filter chain, method security |
| `spring-boot-starter-oauth2-resource-server` | (managed) | JWT validation |
| `postgresql` | (managed) | JDBC driver, runtime |
| `flyway-core` + `flyway-database-postgresql` | 11.20.0 | Schema migrations |
| `springdoc-openapi-starter-webmvc-ui` | 2.3.0 | OpenAPI 3 + Swagger UI |
| `spring-boot-devtools` | (managed) | Local reload, runtime/optional |
| `spring-boot-starter-test` | (managed) | JUnit 5, Mockito, AssertJ |
| `spring-security-test` | (managed) | Security-aware test support |
| `h2` | (managed) | In-memory DB for the `test` profile |

SnakeYAML (transitive via Spring Boot) is used directly to parse `authorization.yml`.

### Frontend dependencies

| Dependency | Version | Purpose |
|---|---|---|
| `react` / `react-dom` | 18.2 | UI runtime |
| `typescript` | 5.3 | Types |
| `vite` + `@vitejs/plugin-react` | 5.0 / 4.2 | Dev server and build |
| `@mui/material` + `@mui/icons-material` | 7.3 | Component library |
| `@emotion/react` + `@emotion/styled` | 11 | MUI's styling engine |
| `react-router-dom` | 6.20 | Routing |
| `axios` | 1.6 | HTTP client |
| `xlsx` | 0.18 | Skills Matrix spreadsheet export |
| `eslint` + `@typescript-eslint/*` | 8.55 / 6.14 | Linting |

There is **no** Tailwind, no TanStack Query, no Redux, and no frontend test runner configured.

---

## Project Structure

```
skill-matrix/
├── backend/
│   ├── src/main/java/org/gga/skills/
│   │   ├── SkillsApplication.java
│   │   ├── config/          # SecurityConfig, DevSecurityConfig, AuthorizationConfig
│   │   ├── controller/      # REST controllers + GlobalExceptionHandler
│   │   ├── service/         # Business logic + domain exceptions
│   │   ├── repository/      # Spring Data JPA interfaces
│   │   ├── model/           # JPA entities + Role enum
│   │   ├── dto/             # Request/response records
│   │   └── util/            # GlobMatcher
│   ├── src/main/resources/
│   │   ├── application.yml          # Base config
│   │   ├── application-dev.yml      # Dev profile: local JWT signing
│   │   ├── application-test.yml     # Test profile: H2, Flyway off
│   │   ├── authorization.yml        # Admins and reviewers (see Authorization)
│   │   └── db/migration/            # Flyway V001..V009
│   ├── mvnw
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── auth/            # AuthContext, AuthProvider, DevLoginPage, OidcCallback
│   │   ├── components/      # DataTable, SkillEditModal, Layout, Loading, ErrorMessage
│   │   ├── pages/           # Route-level components
│   │   ├── hooks/           # useEmployees, useSkills, useSkillGrades, useSkillProfiles
│   │   ├── services/        # api.ts + one service per resource
│   │   ├── theme/           # MUI theme
│   │   ├── types/           # Shared TypeScript interfaces
│   │   ├── utils/           # apiError, levelColors
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── openspec/
│   ├── specs/               # Capability specs - the behavioural baseline
│   └── config.yaml
├── docker-compose.yml
├── Security.md              # Auth/authorization design notes
├── ocp-deployment.md        # OpenShift deployment notes
└── README.md
```

---

## Architecture Principles

### Keep It Simple
- **No over-engineering.** Start with the simplest solution that works.
- **Flat structure preferred.** Avoid deep package nesting.
- **One responsibility per class.** But don't create classes for trivial operations.

### Backend Guidelines

**Layer Responsibilities:**
- `controller/` — HTTP handling, validation, DTO mapping. No business logic.
- `service/` — Business logic, authorization checks, transaction boundaries.
- `repository/` — Data access only. Use Spring Data JPA interfaces.
- `model/` — JPA entities. Keep them focused on persistence.
- `dto/` — Request/response records. Separate from entities.

**Naming Conventions:**
- Controllers: `EmployeeController`, `SkillController`
- Services: `EmployeeService`, `SkillService`
- Repositories: `EmployeeRepository`, `SkillRepository`
- Entities: `Employee`, `Skill`, `EmployeeSkillGrade`
- DTOs: `EmployeeRequest`, `EmployeeResponse`, `SkillGradeResponse`

**Code Style:**
```java
// Prefer constructor injection (implicit with single constructor)
@Service
@Transactional(readOnly = true)
public class EmployeeService {
    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }
}

// Use records for DTOs
public record EmployeeRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @Email String email
) {}

// Keep controllers thin
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @GetMapping("/{id}")
    public EmployeeResponse getEmployee(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }
}
```

**Authorization belongs in the service layer.** Controllers do not check roles.
Services call `CurrentUserService` / `AuthorizationService` and throw
`AccessDeniedException`, which `GlobalExceptionHandler` maps to 403.

**Database Migrations:**
- Use Flyway for schema migrations
- Naming: `V001__create_employee_table.sql`, `V002__create_skill_profile_table.sql`
- Never modify existing migrations; create new ones
- `ddl-auto: validate` — entities are checked against the migrated schema, never the reverse

### Frontend Guidelines

**Component Organization:**
- `pages/` — Route-level components (EmployeesPage, SkillsMatrixPage)
- `components/` — Reusable UI components (DataTable, SkillEditModal)
- `hooks/` — Custom hooks (useEmployees, useSkills)
- `services/` — API calls (api.ts, employeeService.ts)
- `types/` — TypeScript interfaces and types

**Code Style:**
```typescript
// Use functional components with TypeScript
interface EmployeeCardProps {
  employee: Employee;
  onEdit: (id: number) => void;
}

export function EmployeeCard({ employee, onEdit }: EmployeeCardProps) {
  return (
    <Card>
      <Typography>{employee.firstName} {employee.lastName}</Typography>
      <Button onClick={() => onEdit(employee.id)}>Edit</Button>
    </Card>
  );
}

// Custom hooks for data fetching
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeService.getAll()
      .then(setEmployees)
      .finally(() => setLoading(false));
  }, []);

  return { employees, loading };
}
```

**State Management:**
- React's built-in `useState` / `useContext`. Auth state lives in `AuthContext`.
- Server state is fetched per-page with axios through `services/`. No query cache library.
- Do not introduce Redux, Zustand, or TanStack Query without a concrete need.

**Styling:**
- Material-UI components with the `sx` prop and the shared theme in `theme/theme.ts`
- Level colours for grades come from `utils/levelColors.ts` — do not hard-code them
- Avoid inline `style={{}}` except for dynamic values

---

## Data Model

### Core Entities

```
Employee
├── id (PK)
├── firstName
├── lastName
├── email (unique)
├── department
├── position
├── createdAt
└── updatedAt

SkillProfile
├── id (PK)
├── name (unique)
├── description
├── createdAt
└── updatedAt

EmployeeSkillProfile (junction: employee <-> profile)
├── id (PK)
├── employeeId (FK)
├── skillProfileId (FK)
├── createdAt
└── unique (employeeId, skillProfileId)

Skill
├── id (PK)
├── name (unique)
├── description
├── createdAt
└── updatedAt

SkillProfileSkill (junction: profile <-> skill, many-to-many)
├── id (PK)
├── skillProfileId (FK)
├── skillId (FK)
├── createdAt
└── unique (skillProfileId, skillId)

SkillGrade
├── id (PK)
├── skillId (FK)
├── code
├── description
├── level (1..5, NOT NULL, default 1)
├── createdAt
├── updatedAt
└── unique (skillId, code)

EmployeeSkillGrade (junction: employee <-> grade)
├── id (PK)
├── employeeId (FK)
├── skillGradeId (FK)
├── yearsOfExperience (>= 0)
├── lastUsedDate
├── certified (boolean, default false)
├── employeeComment
├── reviewedByEmployeeId (FK, nullable, ON DELETE SET NULL)
├── reviewerComment
├── createdAt
├── updatedAt
└── unique (employeeId, skillGradeId)
```

### Relationships

```
Employee >--- EmployeeSkillProfile ---< SkillProfile
                                             |
                                   SkillProfileSkill (M:N)
                                             |
                                           Skill
                                             |
                                        SkillGrade (level 1..5)
                                             |
Employee >--- EmployeeSkillGrade ------------+
```

**A skill does not belong to a single profile.** Skills and profiles are
many-to-many through `skill_profile_skill`. Migration V004 originally gave
`skill` a mandatory `skill_profile_id`; V007 replaced it with the junction
table and V008 renamed everything back from the short-lived "job profile"
naming. V009 added `skill_grade.level`.

**An employee holds at most one grade per skill.** The database enforces
uniqueness on `(employeeId, skillGradeId)`; `EmployeeSkillGradeService`
additionally enforces one grade per *skill*, returning 409 on a second.

---

## Authentication & Authorization

Full design notes live in `Security.md`. Summary:

**Authentication** — The backend is a stateless OAuth2 resource server. Every
`/api/**` request needs a bearer JWT, except `/api/auth/**`, the OpenAPI
endpoints, and `OPTIONS`. The token's `email` claim (falling back to the
subject) is matched against `employee.email`. There is **no auto-provisioning**:
an authenticated person with no Employee row gets 403.

With the `dev` profile active, `POST /api/auth/dev-login` issues a locally
signed 8-hour JWT for any email that matches an Employee. The password field is
ignored. The endpoint does not exist under any other profile.

**Authorization** — Three roles resolved server-side from
`src/main/resources/authorization.yml`, never from the token:

| Role | Rights |
|---|---|
| `EMPLOYEE` | Read everything. Edit only their own employee record and own skill grades. |
| `REVIEWER` | As EMPLOYEE, plus edit skill grades of employees matching their configured patterns. |
| `ADMIN` | Everything, including the catalogue and all assignments. |

Reviewer patterns come in four kinds — `department.patterns`, `profile.patterns`,
`skill.patterns`, `email.patterns` — matched as case-insensitive globs by
`GlobMatcher`. **They are combined with OR.** A pattern of one kind can only
widen a reviewer's reach; it can never narrow what another kind granted.

All authenticated users can **read** everything, including other employees'
comments.

---

## API Design

### Endpoints

```
GET    /api/auth/me                                  - Current user + resolved role
POST   /api/auth/dev-login                           - Dev profile only

GET    /api/employees?search=&page=&size=            - Paginated list, optional search
GET    /api/employees/{id}                           - Single employee
POST   /api/employees                                - Create (ADMIN)
PUT    /api/employees/{id}                           - Update (self or ADMIN)
DELETE /api/employees/{id}                           - Delete (ADMIN)

GET    /api/employees/{id}/skill-profiles            - Profiles assigned to employee
POST   /api/employees/{eId}/skill-profiles/{pId}     - Assign profile (ADMIN)
DELETE /api/employees/{eId}/skill-profiles/{pId}     - Remove assignment (ADMIN)

GET    /api/skills                                   - Paginated, with profiles + grades
GET    /api/skills/{id}                              - Single skill with relations
POST   /api/skills                                   - Create (ADMIN)
PUT    /api/skills/{id}                              - Update (ADMIN)
DELETE /api/skills/{id}                              - Delete (ADMIN)
GET    /api/skills/{sId}/skill-profiles              - Profiles this skill belongs to
POST   /api/skills/{sId}/skill-profiles/{pId}        - Associate (ADMIN)
DELETE /api/skills/{sId}/skill-profiles/{pId}        - Remove association (ADMIN)

GET    /api/skill-profiles?paginated=                - List (array)
GET    /api/skill-profiles/{id}                      - Single profile
POST   /api/skill-profiles                           - Create (ADMIN)
PUT    /api/skill-profiles/{id}                      - Update (ADMIN)
DELETE /api/skill-profiles/{id}                      - Delete (ADMIN)

GET    /api/skill-grades?skillId=&paginated=         - List (array)
GET    /api/skill-grades/{id}                        - Single grade
POST   /api/skill-grades                             - Create (ADMIN)
PUT    /api/skill-grades/{id}                        - Update (ADMIN)
DELETE /api/skill-grades/{id}                        - Delete (ADMIN)

GET    /api/employee-skill-grades?employeeId=&skillGradeId=  - List (array)
GET    /api/employee-skill-grades/{id}               - Single assessment
POST   /api/employee-skill-grades                    - Create (owner, scoped REVIEWER, ADMIN)
PUT    /api/employee-skill-grades/{id}               - Update (same)
DELETE /api/employee-skill-grades/{id}               - Delete (same)

POST   /api/skills-matrix                            - Matrix with glob filters
GET    /api/skills-matrix/filter-hints               - Distinct values for each filter
```

### Response Format

```json
// Success (single item)
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com"
}

// Success (paginated: /api/employees and /api/skills only)
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5
}

// Error
{
  "status": 400,
  "error": "Validation Failed",
  "message": "One or more fields have validation errors",
  "details": ["email: Email must be valid", "firstName: First name is required"],
  "timestamp": "2026-01-01T12:00:00"
}
```

**Pagination is inconsistent by design-drift, not intent.** Only `/api/employees`
and `/api/skills` return the `PageResponse` envelope. `/api/skill-profiles`,
`/api/skill-grades`, and `/api/employee-skill-grades` return bare arrays;
`paginated=true` pages the query but still drops the metadata.

### Status codes

| Condition | Status | `error` |
|---|---|---|
| Not authenticated | 401 | `Unauthorized` |
| Authenticated but not permitted | 403 | `Forbidden` |
| Record not found | 404 | `Not Found` |
| Uniqueness violated | 409 | `Conflict` |
| Bean Validation failed | 400 | `Validation Failed` |
| Anything else | 500 | `Internal Server Error` |

---

## Skills Matrix

`POST /api/skills-matrix` returns a grid of employees against skills.

- Five filter dimensions: `namePatterns`, `departmentPatterns`, `positionPatterns`,
  `skillNamePatterns`, `skillProfilePatterns`. Each is a list of case-insensitive
  globs. Patterns within one dimension are alternatives; dimensions are AND-ed.
  An empty or absent dimension matches everything.
- Cells are keyed `"{employeeId}_{skillId}"`.
- **Rows and columns with no grades are elided** — an employee who matched the
  filter but has no assessments does not appear.
- Each skill carries a summary of grade-code counts.
- The frontend exports the displayed grid to `.xlsx` via the `xlsx` package.

---

## Development Commands

### Backend
```bash
cd backend

# Run application (needs PostgreSQL; use the dev profile for local login)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Run tests (H2, Flyway disabled)
./mvnw test

# Build JAR
./mvnw clean package
```

### Frontend
```bash
cd frontend

npm install
npm run dev        # Vite dev server on :5173, proxies /api to :8080
npm run build      # tsc && vite build
npm run lint       # eslint, --max-warnings 0
```

There is no `npm test` script; the frontend has no test runner configured.

### Docker
```bash
docker-compose up -d postgres              # Database only (the usual local setup)
docker-compose --profile full-stack up -d  # Everything
docker-compose logs -f
docker-compose down
```

---

## Configuration

### Backend (application.yml)
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/skills_db}
    username: ${DB_USERNAME:skills_user}
    password: ${DB_PASSWORD:skills_pass}
  jpa:
    hibernate:
      ddl-auto: validate    # Flyway owns the schema
    open-in-view: false
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
  data.web.pageable:
    default-page-size: 20
    max-page-size: 100

spring.security.oauth2.resourceserver.jwt:
  issuer-uri: ${OIDC_ISSUER_URI:https://identity.intra.pse.pl}
  jwk-set-uri: ${OIDC_JWKS_URI:.../jwks}

server:
  port: 8080

springdoc:
  api-docs.path: /api-docs
  swagger-ui.path: /swagger-ui.html
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_AUTH_MODE=dev            # or "oidc"
VITE_OIDC_AUTHORITY=https://identity.intra.pse.pl
VITE_OIDC_CLIENT_ID=skill-matrix
```

---

## Testing Strategy

### Backend
- **Unit tests:** Services with mocked repositories (JUnit 5 + Mockito).
  Existing: `EmployeeServiceTest`, `SkillServiceTest`, `SkillProfileServiceTest`,
  `SkillProfileSkillServiceTest`, `EmployeeSkillProfileServiceTest`,
  `AuthorizationServiceTest`, `GlobMatcherTest`.
- **Integration tests:** Controllers with `@WebMvcTest` + `spring-security-test`
- **Repository tests:** `@DataJpaTest` against H2 (`test` profile)
- **Naming:** `EmployeeServiceTest`, `EmployeeControllerIT`

Services that call `CurrentUserService` need an authenticated principal in the
security context, or a mocked `CurrentUserService`.

### Frontend
No test runner is configured. If one is added, prefer Vitest with React Testing
Library and record the decision here and in the specs.

---

## OpenSpec: keeping specs, code, and this file in sync

`openspec/specs/` holds the behavioural baseline for this project — nine
capabilities, reverse-engineered from the code and validated with
`openspec validate --specs`:

```
authentication            authorization            api-conventions
employee-management       skill-profile-management skill-catalog
skill-grade-scale         employee-skill-assessment skills-matrix-report
```

**These three must agree: the specs, the code, and this file.** When they
disagree, the code is the fact and the other two are stale.

When you change behaviour:

1. **Find the capability** the change belongs to — `openspec list --specs`,
   then `openspec show "<id>" --type spec`.
2. **Update the spec** alongside the code, in the same change. A new rule is a
   new `### Requirement:` with at least one `#### Scenario:`; a changed rule is
   an edited one. Requirement bodies must contain SHALL/MUST (RFC 2119) or
   validation fails.
3. **Update CLAUDE.md** when the change touches anything this file states: the
   data model, the endpoint list, the roles table, the dependency tables, the
   commands, or the configuration blocks.
4. **Validate** with `openspec validate --specs` before finishing.

Anything non-trivial should start as a change proposal under `openspec/changes/`
via `openspec new change "<name>"` rather than editing the baseline specs
directly. Baseline specs describe what is shipped; changes describe what is
being proposed.

Do not hand-create directories under `openspec/changes/` — the CLI scaffold
writes required metadata.

---

## Code Generation Preferences

When generating code, Claude should:

1. **Use Java records for DTOs** — immutable, concise, built-in equals/hashCode
2. **Prefer Spring Data JPA query methods** over `@Query` when possible
3. **Use Bean Validation annotations** (`@NotBlank`, `@Email`, `@Size`) on DTOs
4. **Return ResponseEntity only when needed** (custom status codes, headers)
5. **Use Optional properly** — never call `.get()` without checking
6. **Generate OpenAPI annotations** (`@Tag`, `@Operation`) on controllers
7. **Use meaningful variable names** — no abbreviations except common ones (id, dto)
8. **Put authorization checks in services**, not controllers
9. **Batch-load relations** rather than letting N+1 queries through
10. **Generate complete error handling** — let `GlobalExceptionHandler` map
    `ResourceNotFoundException`, `DuplicateResourceException`, and
    `AccessDeniedException` rather than catching them locally

### Avoid
- Lombok (use records and IDE generation instead)
- MapStruct for simple projects (manual mapping is fine)
- Over-abstraction (no interfaces for services unless needed for testing)
- Premature optimization
- Comments that state the obvious
- Tailwind or other CSS frameworks — this project uses MUI
- Adding a client-side state library without a concrete need

---

## Security Notes

Authentication and authorization are implemented; see `Security.md` and the
`authentication` / `authorization` specs. Known rough edges, recorded rather
than fixed:

- `GlobMatcher` escapes only `.` when building its regex, so every other regex
  metacharacter in a pattern is interpreted rather than matched literally.
  `[` or an unmatched `)` throw `PatternSyntaxException` and surface as a 500
  (verified: `A[b`, `x)y`). Others do not throw but match wrongly - `a|b`
  alternates, `^`/`$` anchor, `C++` becomes a possessive quantifier and
  silently matches nothing.
- CORS allows any origin with credentials. Auth is bearer-token rather than
  cookie-based, so the practical exposure is limited.
- Reviewer pattern kinds are OR-ed, so `skill.patterns` cannot narrow a grant
  made by `department.patterns`.
- Every authenticated user can read every other employee's comments.

---

## Common Tasks Reference

### Add a new entity
1. Create entity in `model/`
2. Create repository interface in `repository/`
3. Create request/response records in `dto/`
4. Create service in `service/` — including its authorization checks
5. Create controller in `controller/` with OpenAPI annotations
6. Add Flyway migration in `db/migration/` (next free `V0NN__`)
7. Add or update the capability spec in `openspec/specs/`
8. Update the data model and endpoint sections of this file

### Add a new frontend page
1. Create page component in `pages/`
2. Add route in `App.tsx`
3. Create service function in `services/`
4. Add types in `types/index.ts`
5. Create any reusable components in `components/`

---

## Questions to Ask Before Coding

1. Is this feature actually needed, or are we over-engineering?
2. Can we use an existing Spring/React/MUI feature instead of custom code?
3. Which capability spec does this belong to, and does that spec need updating?
4. Will this be easy to test?
5. Will another developer understand this in 6 months?
