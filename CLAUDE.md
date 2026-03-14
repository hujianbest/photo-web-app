# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A comprehensive photography platform for amateur photographers supporting check-in spots, booking platform, portfolio showcase, experience sharing, and AI-enhanced photo editing. Multi-platform support: Web (Next.js), Mobile (React Native), Mini-programs (uni-app).

## Development Commands

### Infrastructure
```bash
# Start all infrastructure services (postgres, redis, rabbitmq, minio)
docker-compose up -d postgres redis rabbitmq minio

# Stop all services
docker-compose down

# View service logs
docker-compose logs -f <service_name>

# Start full stack with Docker
docker-compose up -d
```

### API Service (NestJS)
```bash
cd services/api

# Development server with hot reload
npm run start:dev

# Build production bundle
npm run build

# Run production server
npm run start:prod

# Run tests
npm run test              # All tests
npm run test:e2e         # E2E tests only
npm run test:cov         # Coverage report

# Database operations
npm run db:migrate       # Run pending migrations
npm run db:rollback      # Rollback last migration
npm run db:seed          # Seed database with test data

# Code quality
npm run lint             # Lint code
npm run format           # Format code with Prettier
```

### Web Frontend (Next.js)
```bash
cd apps/web

# Development server
npm run dev

# Production build
npm run build

# Run production build
npm run start

# Code quality
npm run lint             # ESLint
npm run typecheck        # TypeScript type checking
npm run format           # Prettier formatting
```

### AI Service (FastAPI/Python)
```bash
cd services/ai

# Install dependencies
pip install -r requirements.txt

# Development server
uvicorn src.main:app --reload

# Production server
uvicorn src.main:app --host 0.0.0.0 --port 8001

# Run tests
pytest
```

## Architecture

### Directory Structure
```
photo-web-app/
├── apps/
│   ├── web/           # Next.js web frontend (primary target)
│   ├── mobile/         # React Native mobile app
│   └── miniapp/       # uni-app mini-program
├── services/
│   ├── api/           # NestJS API service
│   ├── ai/            # FastAPI AI service (image enhancement, AI editing)
│   └── worker/        # Background job processor
├── shared/
│   ├── types/         # Shared TypeScript types
│   ├── constants/     # Shared constants
│   └── utils/         # Shared utilities
└── infrastructure/
    ├── database/       # SQL schema, migrations, seeds
    ├── docker/        # Dockerfiles
    └── nginx/         # Nginx configuration
```

### API Architecture (NestJS)

**Module Pattern**: Each business domain is a NestJS module with:
- `*.module.ts` - Module definition with imports/exports
- `*.controller.ts` - HTTP request handlers with decorators
- `*.service.ts` - Business logic
- `dto/*.ts` - Data Transfer Objects with validation decorators
- `*.entity.ts` - TypeORM database entities
- `strategies/*.ts` - Passport auth strategies

**Key Modules**:
- `auth/` - JWT authentication, registration, password reset
- `users/` - User CRUD, profile management
- `upload/` - File upload handling

**Global Configuration** (in `main.ts`):
- CORS enabled for frontend origins
- Global ValidationPipe with class-validator (whitelist, transform, forbidNonWhitelisted)
- Static files served from `/uploads/` at `/uploads/` route
- API prefix: `/api/v1`
- Swagger docs at `/api/docs`

**Database**: PostgreSQL with TypeORM, entities auto-discovered from `**/*.entity{.ts,.js}`

### Frontend Architecture (Next.js 14)

**App Router**: Pages in `apps/web/src/app/` using Next.js 14 App Router

**Styling**: TailwindCSS v4 for utility-first styling

### Shared Services
- **PostgreSQL**: Main database with PostGIS extension for geospatial queries
- **Redis**: Caching and session storage
- **RabbitMQ**: Message queue for async jobs (via Bull queues)
- **MinIO**: S3-compatible object storage for file uploads

## Code Patterns & Conventions

### API Response Format
All API endpoints return consistent response structure:
```typescript
{
  success: boolean;
  message: string;
  data?: any;
  timestamp?: number;
}
```

### Authentication
- JWT tokens for authentication (access + refresh token pattern)
- JWT auth guard: `@UseGuards(JwtAuthGuard)` decorator
- Current user access: `@CurrentUser()` decorator in controllers
- Verification codes stored in-memory (should migrate to Redis)

### DTO Validation
Use `class-validator` decorators in DTOs:
```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

### NestJS CLI for Module Generation
```bash
# Generate new module structure
nest g module modules/feature
nest g service modules/feature
nest g controller modules/feature
nest g interface modules/feature
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
- Database connection (PostgreSQL)
- Redis connection
- JWT secret and expiration
- File upload settings
- Third-party API keys (Alipay, WeChat Pay, SMS, etc.)

## Service URLs (Development)
- Web frontend: http://localhost:3000
- API service: http://localhost:8000
- API documentation: http://localhost:8000/api/docs
- AI service: http://localhost:8001
- MinIO console: http://localhost:9001 (minioadmin/minioadmin)
- RabbitMQ management: http://localhost:15672 (guest/guest)

## Database
- PostgreSQL on port 5432
- Database name: `photo_platform`
- Default schema in `infrastructure/database/schema.sql`
- Connection via TypeORM in `app.module.ts`

## Important Notes
- The API uses `DB_SYNCHRONIZE` env var for schema sync - disable in production
- File uploads stored locally in `uploads/` directory (MinIO for production)
- AI service uses external models (Real-ESRGAN, Stable Diffusion) - model files not included
- Project is in early development - many modules are scaffolds or incomplete

## Common Patterns

### Adding a New API Feature
1. Create module: `nest g module modules/feature`
2. Create entity: Define TypeORM entity in `*.entity.ts`
3. Create DTOs: Request/response DTOs in `dto/` folder with validation
4. Create service: Business logic in `*.service.ts`
5. Create controller: HTTP handlers in `*.controller.ts`
6. Import module in `app.module.ts`

### Database Migration Flow
1. Modify entity or create new migration file
2. Run `npm run db:migrate` to apply
3. Use `npm run db:rollback` to revert if needed
