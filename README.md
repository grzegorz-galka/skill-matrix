# Employee Skills Management System

A full-stack web application for managing employee skills and skill profiles.

## Tech Stack

- **Database:** PostgreSQL 16+
- **Backend:** Java 21 with Spring Boot 3.x
- **Frontend:** React 18 with TypeScript and Vite
- **Build Tools:** Maven (backend), npm (frontend)
- **Containerization:** Docker & Docker Compose

## Features

- Manage employees with full CRUD operations
- Define skill profiles to group related skills
- Manage skills within profiles
- Define skill grades (beginner, intermediate, advanced, expert)
- Assign skill profiles to employees
- Track employee skill assessments with grades, experience, and certifications
- RESTful API with OpenAPI/Swagger documentation
- Responsive React frontend with TypeScript

## Project Structure

```
skill-matrix/
├── backend/              # Spring Boot application
│   ├── src/main/java/
│   │   └── org/gga/skills/
│   │       ├── controller/     # REST controllers
│   │       ├── service/        # Business logic
│   │       ├── repository/     # Data access
│   │       ├── model/          # JPA entities
│   │       └── dto/            # Request/Response DTOs
│   ├── src/main/resources/
│   │   ├── application.yml     # Application config
│   │   └── db/migration/       # Flyway migrations
│   └── pom.xml
├── frontend/             # React + TypeScript application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API service layer
│   │   └── types/              # TypeScript definitions
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml    # Container orchestration
└── README.md
```

## Prerequisites

- **Java 21+** - [Download](https://adoptium.net/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker & Docker Compose** - [Download](https://www.docker.com/products/docker-desktop)
- **Maven 3.8+** (or use included Maven wrapper)

## Quick Start

### 1. Start PostgreSQL Database

```bash
docker-compose up -d postgres
```

This starts PostgreSQL on `localhost:5432` with database `skills_db`.

### 2. Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

- API Documentation: `http://localhost:8080/swagger-ui.html`
- OpenAPI Spec: `http://localhost:8080/api-docs`

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Employees
- `GET /api/employees` - List all employees (paginated)
- `GET /api/employees/{id}` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee
- `GET /api/employees/{id}/skill-profiles` - Get employee's skill profiles
- `POST /api/employees/{employeeId}/skill-profiles/{skillProfileId}` - Assign profile
- `DELETE /api/employees/{employeeId}/skill-profiles/{skillProfileId}` - Remove profile

### Skill Profiles
- `GET /api/skill-profiles` - List all skill profiles
- `GET /api/skill-profiles/{id}` - Get skill profile by ID
- `POST /api/skill-profiles` - Create skill profile
- `PUT /api/skill-profiles/{id}` - Update skill profile
- `DELETE /api/skill-profiles/{id}` - Delete skill profile

### Skills
- `GET /api/skills` - List all skills
- `GET /api/skills?profileId={id}` - List skills by profile
- `GET /api/skills/{id}` - Get skill by ID
- `POST /api/skills` - Create skill
- `PUT /api/skills/{id}` - Update skill
- `DELETE /api/skills/{id}` - Delete skill

### Skill Grades
- `GET /api/skill-grades` - List all skill grades
- `GET /api/skill-grades?skillId={id}` - List grades for a skill
- `GET /api/skill-grades/{id}` - Get skill grade by ID
- `POST /api/skill-grades` - Create skill grade
- `PUT /api/skill-grades/{id}` - Update skill grade
- `DELETE /api/skill-grades/{id}` - Delete skill grade

### Employee Skill Grades
- `GET /api/employee-skill-grades` - List all assessments
- `GET /api/employee-skill-grades?employeeId={id}` - Get by employee
- `GET /api/employee-skill-grades/{id}` - Get by ID
- `POST /api/employee-skill-grades` - Create assessment
- `PUT /api/employee-skill-grades/{id}` - Update assessment
- `DELETE /api/employee-skill-grades/{id}` - Delete assessment

## Database Schema

The application uses 6 main tables:

1. **employee** - Employee information
2. **skill_profile** - Skill profile definitions
3. **employee_skill_profile** - Employee to profile assignments
4. **skill** - Individual skills
5. **skill_grade** - Grade levels for skills
6. **employee_skill_grade** - Employee skill assessments

Flyway automatically runs migrations on startup.

## Development

### Backend Development

```bash
cd backend

# Run tests
./mvnw test

# Build JAR
./mvnw clean package

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Running with Docker Compose (Full Stack)

```bash
# Start all services (requires Dockerfiles for backend/frontend)
docker-compose --profile full-stack up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/skills_db
    username: ${DB_USERNAME:skills_user}
    password: ${DB_PASSWORD:skills_pass}
```

Use environment variables to override defaults:
```bash
export DB_USERNAME=myuser
export DB_PASSWORD=mypassword
```

### Frontend Configuration

Edit `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Testing

### Backend Tests

```bash
cd backend
./mvnw test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Building for Production

### Backend

```bash
cd backend
./mvnw clean package
java -jar target/skills-0.0.1-SNAPSHOT.jar
```

### Frontend

```bash
cd frontend
npm run build
# Output in dist/ directory
```

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running: `docker-compose ps`
2. Check logs: `docker-compose logs postgres`
3. Verify connection: `psql -h localhost -U skills_user -d skills_db`

### Backend Won't Start

1. Check Java version: `java -version` (requires 21+)
2. Verify port 8080 is available: `lsof -i :8080`
3. Check logs for Flyway migration errors

### Frontend Build Errors

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check Node version: `node -v` (requires 18+)

## Architecture Notes

- **Backend:** Clean layered architecture (Controller → Service → Repository)
- **Frontend:** Component-based with custom hooks for data fetching
- **API:** RESTful with JSON, follows Spring Boot conventions
- **Database:** Relational model with Flyway versioned migrations
- **Validation:** Bean Validation on backend, HTML5 validation on frontend
- **Error Handling:** Global exception handler with structured error responses

## License

This project is for educational/portfolio purposes.

## Contact

For questions or issues, please open an issue in the repository.
