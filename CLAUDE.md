# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A comprehensive photography platform for amateur photographers supporting check-in spots, booking platform, portfolio showcase, experience sharing, and AI-enhanced photo editing. Multi-platform support: Web (Next.js), Mobile (React Native), Mini-programs (uni-app).

## Project Status

### Current Phase: P0 Complete (Foundation UI)

**Completed Tasks (P0)**:
- ✅ Homepage redesign with Hero Carousel, Stats Bar, Featured Works/Spots, Community Feed
- ✅ Works page with masonry layout for photo portfolio showcase
- ✅ Spots page with map/list toggle view for check-in locations
- ✅ Booking cards with enhanced design and functionality
- ✅ User profile header with comprehensive user information display

**Recent Commits**:
- `5b71af1` feat(web): integrate BookingCard and UserProfileHeader into pages
- `8518d91` feat(web): add BookingCard and UserProfileHeader components
- `7ff8720` feat(web): add map/list toggle view for spots page
- `f4eb28a` feat(web): add masonry layout for works page
- `c85d46c` feat(web): redesign homepage with hero carousel, stats bar, featured content

**New Components Added**:
- `HeroCarousel` - Auto-rotating hero section with featured content
- `StatsBar` - Platform statistics display bar
- `FeaturedWorks` - Curated photography works showcase
- `FeaturedSpots` - Highlighted check-in locations
- `CommunityFeed` - Latest community activity stream
- `WorksMasonry` - Masonry grid layout for photo portfolio
- `SpotsMapView` - Dual view (map/list) for spots exploration
- `BookingCard` - Enhanced booking request cards
- `UserProfileHeader` - Comprehensive user profile header component

### Next Steps: P1 (Social Features)

**Planned Features**:
- 🔜 Follow System - User following/followers functionality
- 🔜 Direct Messages - Private messaging between users
- 🔜 Topic Tags - Hashtag system for content categorization
- 🔜 Leaderboards - Ranking system for photographers, spots, and popular content

### Development Commands

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

# E2E Testing (Playwright)
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui       # Run E2E tests with UI mode
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
├── infrastructure/
│   ├── database/       # SQL schema, migrations, seeds
│   ├── docker/        # Dockerfiles
│   └── nginx/         # Nginx configuration
└── design-system/     # Design system documentation
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
- `notifications/` - WebSocket real-time notifications
- `works/` - Photo portfolio management
- `spots/` - Check-in spots (geospatial)
- `bookings/` - Photography booking platform
- `orders/` - Order management
- `articles/` - Article/experience sharing

**Global Configuration** (in `main.ts`):
- CORS enabled for frontend origins
- Global ValidationPipe with class-validator (whitelist, transform, forbidNonWhitelisted)
- GlobalExceptionFilter for friendly error messages
- Static files served from `/uploads/` at `/uploads/` route
- API prefix: `/api/v1`
- Swagger docs at `/api/docs`
- WebSocket support via Socket.io adapter
- Increased request body limit: 50MB for file uploads
- Server timeout: 120s for large file uploads

**Database**: PostgreSQL with TypeORM, entities auto-discovered from `**/*.entity{.ts,.js}`

### Frontend Architecture (Next.js 14)

**App Router**: Pages in `apps/web/src/app/` using Next.js 14 App Router

**Styling**: TailwindCSS v3 for utility-first styling

**Real-time Features**: Socket.io client integration via `NotificationsSocketWrapper` component in root layout

### Shared Services
- **PostgreSQL**: Main database with PostGIS extension for geospatial queries
- **Redis**: Caching and session storage
- **RabbitMQ**: Message queue for async jobs (via Bull queues)
- **MinIO**: S3-compatible object storage for file uploads

## Design System

### Location
- Global: `design-system/MASTER.md` - Source of truth for all design rules
- Page-specific: `design-system/pages/*.md` - Per-page overrides

### Design Style
- **Current Style**: Apple-like minimalism (inspired by Apple website)
- **Philosophy**: Clean, spacious, white backgrounds with single blue accent
- **Color Palette**:
  - Background: `#FFFFFF` / `#FBFBFD` (white, neutral-50)
  - Primary text: `#1D1D1F` (neutral-900)
  - Secondary text: `#6E6E73` (neutral-500)
  - Accent/CTA: `#0071E3` (blue-600)
  - Borders: `#D2D2D7` (neutral-200)

### UI/UX Guidelines
When building UI components, consult `.cursor/skills/ui-ux-pro-max/SKILL.md` for:
- Comprehensive UI/UX patterns and best practices
- Anti-patterns to avoid
- Stack-specific implementation guidelines

### Key Principles
- No emojis as icons (use SVG from Lucide React)
- Cursor pointer on all clickable elements
- Stable hover states (no scale transforms)
- System font stack: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
- Large headings with tracking-tight
- Minimum 44px touch targets
- Smooth transitions (150-200ms)

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

### WebSocket Real-time Notifications
- Socket.io server configured in `main.ts` with `IoAdapter`
- Frontend connects via `NotificationsSocketWrapper` in root layout
- JWT-based WebSocket authentication
- Real-time unread notification badge on header

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
- Map API keys (AMAP_KEY for Amap/Gaode)

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
- PostGIS extension for geospatial queries
- Connection via TypeORM in `app.module.ts`

## Testing

### E2E Testing (Playwright)
- Test files in `apps/web/e2e/`
- Configuration: `apps/web/playwright.config.ts`
- Run with: `npm run test:e2e` (headless) or `npm run test:e2e:ui` (with UI)
- Browsers: Chromium, Mobile (Pixel 5)
- Retries: 2 in CI, 0 locally
- Auto-starts dev server in CI mode

## Important Notes
- The API uses `DB_SYNCHRONIZE` env var for schema sync - disable in production
- File uploads stored locally in `uploads/` directory (MinIO for production)
- AI service uses external models (Real-ESRGAN, Stable Diffusion) - model files not included
- Project uses Apple-inspired minimal design system - check `design-system/MASTER.md`
- WebSocket notifications via Socket.io with JWT authentication
- Request body limit increased to 50MB for large file uploads
- Server timeout set to 120s for large file uploads

## Common Patterns

### Adding a New API Feature
1. Create module: `nest g module modules/feature`
2. Create entity: Define TypeORM entity in `*.entity.ts`
3. Create DTOs: Request/response DTOs in `dto/` folder with validation
4. Create service: Business logic in `*.service.ts`
5. Create controller: HTTP handlers in `*.controller.ts`
6. Import module in `app.module.ts`

### Building UI Components
1. Check `design-system/MASTER.md` for global design rules
2. Check `design-system/pages/<page-name>.md` for page-specific overrides
3. Consult `.cursor/skills/ui-ux-pro-max/SKILL.md` for UI/UX best practices
4. Use Lucide React icons only (no emojis)
5. Ensure proper cursor-pointer on interactive elements
6. Maintain Apple-like minimalism with proper spacing
7. Test responsive design (mobile, tablet, desktop)
8. Verify accessibility (alt text, labels, contrast)
