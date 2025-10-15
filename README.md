# Candidate Loader Application

Full-stack application for loading and managing candidate data through Excel file uploads.

## Tech Stack

### Frontend
- **Angular 20** with Standalone Components
- **Angular Material** for UI components
- **Signals** for reactive state management
- **RxJS** for asynchronous operations
- **TypeScript** with strict mode
- **Jasmine/Karma** for testing

### Backend
- **NestJS 11** with TypeScript
- **Hexagonal Architecture** (Domain-Driven Design)
- **TypeORM** with SQLite database
- **XLSX** for Excel parsing
- **Jest** for testing
- **Supertest** for E2E testing

## Features

- ✅ Reactive form with validation (name, surname, Excel file)
- ✅ Excel file upload and parsing (seniority, years, availability)
- ✅ Incremental data storage (SQLite backend + frontend state)
- ✅ Material Table displaying all loaded candidates
- ✅ Error handling with dismissible banners
- ✅ Comprehensive test coverage (unit, integration, E2E)
- ✅ Responsive design
- ✅ RESTful API with CORS support

## Project Structure

```
candidate-loader-app/
├── backend/
│   ├── src/
│   │   ├── candidate/
│   │   │   ├── domain/           # Entities, Value Objects, Exceptions
│   │   │   ├── application/      # Use Cases, DTOs, Interfaces
│   │   │   └── infrastructure/   # Controllers, Services, Repositories
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── core/             # Services, Store, Models
    │   │   ├── features/         # Components (form, table)
    │   │   └── shared/           # Shared components (error-banner)
    │   ├── index.html
    │   └── main.ts
    └── package.json
```

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd candidate-loader-app
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### Backend

```bash
cd backend
npm run start:dev
```

The backend will start on **http://localhost:3000**

API Endpoints:
- `POST /candidates` - Create a new candidate (multipart/form-data)
- `GET /candidates` - Retrieve all candidates

### Frontend

```bash
cd frontend
npm start
```

The frontend will start on **http://localhost:4200**

Open your browser and navigate to **http://localhost:4200**

## Running Tests

### Backend Tests

```bash
cd backend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --no-watch --code-coverage
```

## API Testing with Postman

A Postman collection is included in `backend/Candidate-API.postman_collection.json`

Import it into Postman to test the API endpoints.

## Excel File Format

The Excel file must contain **exactly one data row** with the following columns:

| Column | Type | Values | Required |
|--------|------|--------|----------|
| seniority | string | `junior` or `senior` | Yes |
| years | number | Any non-negative number | Yes |
| availability | boolean | `true`, `false`, `yes`, `no`, `1`, `0` | Yes |

### Example Excel

| seniority | years | availability |
|-----------|-------|--------------|
| senior    | 5     | true         |

## Test Excel Files

Generate test Excel files using the provided script:

```bash
cd backend
node create-test-excels.js
```

This creates:
- `test-valid-candidate.xlsx` - Valid senior candidate
- `test-valid-junior.xlsx` - Valid junior candidate
- `test-two-rows.xlsx` - Invalid (2 rows)
- `test-empty.xlsx` - Invalid (no data)
- `test-missing-columns.xlsx` - Invalid (missing column)
- `test-invalid-values.xlsx` - Invalid (wrong data types)
- `test-invalid-seniority.xlsx` - Invalid (wrong seniority value)

## Architecture Highlights

### Backend - Hexagonal Architecture

The backend follows hexagonal architecture principles with clear separation of concerns:

- **Domain Layer**: Pure business logic (entities, value objects, exceptions)
- **Application Layer**: Use cases, DTOs, and port interfaces
- **Infrastructure Layer**: Adapters (controllers, repositories, services)

### Frontend - Feature-based Structure

The frontend uses Angular best practices:

- **Core Module**: Singleton services and state management
- **Feature Modules**: Self-contained feature components
- **Shared Module**: Reusable components and utilities

### State Management

- **Signals** for reactive state (Angular 16+ feature)
- Centralized store with computed values
- Incremental data updates
- Separated error states (load vs create)

## Development Decisions

1. **Hexagonal Architecture (Backend)**: Demonstrates clean architecture and testability
2. **Signals (Frontend)**: Modern Angular reactive primitives for better performance
3. **SQLite**: Persistent storage without external database setup
4. **Functional Programming**: Pure functions in Excel parser for testability
5. **Comprehensive Testing**: Unit, integration, and E2E tests for reliability
6. **Material Design**: Professional UI with minimal custom CSS
7. **Error Separation**: Different error handling for load vs create operations
8. **Dismissible Errors**: User control over error message visibility

## License

This project is created as a technical assessment.
