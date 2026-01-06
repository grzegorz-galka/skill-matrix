# CLAUDE.md - Employee Skills Management Application

## Project Overview

A web application for collecting and maintaining employee skills information.
Skills are grouuped into skill profiles. Every employee has few skill profiles assigned.
Every skill has three to five grades defined e.g. beginner, intermediate, advanced, expert.
Based on the assigned profiles the employee selects grade for every skill he possess.

**Tech Stack:**
- **Database:** PostgreSQL 16+
- **Backend:** Java 21+ with Spring Boot 3.x
- **Frontend:** React 18+ with TypeScript
- **Build:** Maven (backend), Vite (frontend)
- **IDE:** IntelliJ IDEA

---

## Project Structure

```
skill-matrix/
├── backend/
│   ├── src/main/java/org/gga/skills/
│   │   ├── SkillsApplication.java
│   │   ├── config/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   └── dto/
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
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
- `service/` — Business logic. Transaction boundaries live here.
- `repository/` — Data access only. Use Spring Data JPA interfaces.
- `model/` — JPA entities. Keep them focused on persistence.
- `dto/` — Request/response objects. Separate from entities.

**Naming Conventions:**
- Controllers: `EmployeeController`, `SkillController`
- Services: `EmployeeService`, `SkillService`
- Repositories: `EmployeeRepository`, `SkillRepository`
- Entities: `Employee`, `Skill`, `EmployeeSkill`
- DTOs: `EmployeeRequest`, `EmployeeResponse`, `SkillDto`

**Code Style:**
```java
// Prefer constructor injection (implicit with single constructor)
@Service
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
        return employeeService.findById(id);
    }
}
```

**Database Migrations:**
- Use Flyway for schema migrations
- Naming: `V001__create_employee_table.sql`, `V002__create_skill_table.sql`
- Never modify existing migrations; create new ones

### Frontend Guidelines

**Component Organization:**
- `pages/` — Route-level components (EmployeesPage, SkillsPage)
- `components/` — Reusable UI components (EmployeeCard, SkillBadge, DataTable)
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
    <div className="employee-card">
      <h3>{employee.firstName} {employee.lastName}</h3>
      <button onClick={() => onEdit(employee.id)}>Edit</button>
    </div>
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
- Start with React's built-in useState and useContext
- Add TanStack Query (React Query) for server state
- Only add Redux/Zustand if genuinely needed

**Styling:**
- Use Tailwind CSS for utility-first styling
- Or CSS Modules for component-scoped styles
- Avoid inline styles except for dynamic values

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

EmployeeSkillProfile (junction table)
├── id (PK)
├── employeeId (FK)
├── skillProfileId (FK)
├── createdAt

Skill
├── id (PK)
├── name (unique)
├── skillProfileId (FK, mandatory)
├── description
├── createdAt
└── updatedAt

SkillGrade
├── id (PK)
├── skillId (FK)
├── code
├── description
├── createdAt
└── updatedAt

EmployeeSkillGrade (junction table)
├── id (PK)
├── employeeId (FK)
├── skillGradeId (FK)
├── yearsOfExperience
├── lastUsedDate
├── certified (boolean)
├── employeeComment
├── reviewedByEmployeeId (FK, nullable)
├── reviewerComment
├── createdAt
└── updatedAt
```

---

## API Design

### REST Conventions

```
GET    /api/employees          - List all employees (with pagination)
GET    /api/employees/{id}     - Get single employee with skills
POST   /api/employees          - Create employee
PUT    /api/employees/{id}     - Update employee
DELETE /api/employees/{id}     - Delete employee

GET    /api/employees/{id}/skills     - Get employee's skills
POST   /api/employees/{id}/skills     - Add skill to employee
PUT    /api/employees/{id}/skills/{skillId} - Update employee's skill
DELETE /api/employees/{id}/skills/{skillId} - Remove skill from employee

GET    /api/skills             - List all available skills
POST   /api/skills             - Create new skill
PUT    /api/skills/{id}        - Update skill
DELETE /api/skills/{id}        - Delete skill

GET    /api/skills/{id}/employees - Get employees with this skill
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

// Success (list with pagination)
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5
}

// Error
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": ["Email is required", "First name cannot be blank"]
}
```

---

## Development Commands

### Backend
```bash
cd backend

# Run application
./mvnw spring-boot:run

# Run tests
./mvnw test

# Build JAR
./mvnw clean package

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint
npm run lint
```

### Docker
```bash
# Start PostgreSQL only
docker-compose up -d postgres

# Start full stack
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all
docker-compose down
```

---

## Configuration

### Backend (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/skills_db
    username: ${DB_USERNAME:skills_user}
    password: ${DB_PASSWORD:skills_pass}
  jpa:
    hibernate:
      ddl-auto: validate  # Use Flyway for migrations
    open-in-view: false
  flyway:
    enabled: true
    locations: classpath:db/migration

server:
  port: 8080

# Pagination defaults
spring.data.web.pageable:
  default-page-size: 20
  max-page-size: 100
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## Testing Strategy

### Backend
- **Unit tests:** Services with mocked repositories
- **Integration tests:** Controllers with @WebMvcTest
- **Repository tests:** Use @DataJpaTest with H2 or Testcontainers
- **Naming:** `EmployeeServiceTest`, `EmployeeControllerIT`

### Frontend
- **Component tests:** React Testing Library
- **Hook tests:** @testing-library/react-hooks
- **E2E (optional):** Playwright or Cypress

---

## Code Generation Preferences

When generating code, Claude should:

1. **Use Java records for DTOs** — immutable, concise, built-in equals/hashCode
2. **Prefer Spring Data JPA query methods** over @Query when possible
3. **Use Bean Validation annotations** (@NotBlank, @Email, @Size) on DTOs
4. **Return ResponseEntity only when needed** (custom status codes, headers)
5. **Use Optional properly** — never call .get() without checking
6. **Generate OpenAPI annotations** on controllers for documentation
7. **Use meaningful variable names** — no abbreviations except common ones (id, dto)
8. **Include null checks** where appropriate, consider using @NonNull annotations
9. **Generate complete error handling** with @RestControllerAdvice

### Avoid
- Lombok (use records and IDE generation instead)
- MapStruct for simple projects (manual mapping is fine)
- Over-abstraction (no interfaces for services unless needed for testing)
- Premature optimization
- Comments that state the obvious

---

## Security Notes (Future)

When adding authentication:
- Use Spring Security with JWT or OAuth2
- Store only hashed passwords (bcrypt)
- Implement role-based access (ADMIN, MANAGER, USER)
- Add CORS configuration for frontend

---

## Common Tasks Reference

### Add a new entity
1. Create entity in `model/`
2. Create repository interface in `repository/`
3. Create request/response DTOs in `dto/`
4. Create service in `service/`
5. Create controller in `controller/`
6. Add Flyway migration in `db/migration/`

### Add a new frontend page
1. Create page component in `pages/`
2. Add route in App.tsx
3. Create service function in `services/`
4. Add types in `types/`
5. Create any reusable components in `components/`

---

## Questions to Ask Before Coding

1. Is this feature actually needed, or are we over-engineering?
2. Can we use an existing Spring/React feature instead of custom code?
3. Will this be easy to test?
4. Will another developer understand this in 6 months?
