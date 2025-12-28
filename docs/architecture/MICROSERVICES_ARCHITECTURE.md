# OldFlick Microservices Architecture

## Overview

Transition from monolithic Express server to modular microservices architecture for better fault isolation, independent scaling, and easier debugging. Each module can be monitored and fail without affecting others.

## Proposed Microservices

### 1. **Authentication Service** (`services/auth/`)
Handles user identity verification and session management.

```
services/auth/
├── index.js              # Service entry point
├── routes.js             # Auth endpoints
├── controllers/
│   ├── loginController.js
│   ├── registerController.js
│   └── logoutController.js
├── middleware/
│   ├── validateToken.js
│   └── hashPassword.js
├── models/
│   └── user.js
├── __tests__/
│   ├── login.test.js
│   └── register.test.js
└── package.json
```

**Endpoints:**
- POST `/auth/login` - User login
- POST `/auth/register` - User registration
- POST `/auth/logout` - User logout
- GET `/auth/me` - Get current user
- POST `/auth/refresh-token` - Refresh JWT

**Dependencies:**
- express
- jsonwebtoken
- bcryptjs
- pg (shared database)

**Failure Modes:** Can fail independently without affecting content/media services

---

### 2. **Content Service** (`services/content/`)
Manages film and TV show catalog, metadata, and filtering.

```
services/content/
├── index.js              # Service entry point
├── routes.js             # Content endpoints
├── controllers/
│   ├── listController.js
│   ├── getController.js
│   ├── searchController.js
│   └── filterController.js
├── middleware/
│   ├── validateQuery.js
│   └── parsePagination.js
├── models/
│   └── content.js
├── utils/
│   ├── filterLogic.js
│   ├── searchLogic.js
│   └── transform.js
├── __tests__/
│   ├── list.test.js
│   ├── search.test.js
│   └── filter.test.js
└── package.json
```

**Endpoints:**
- GET `/api/content` - List all content with filters
- GET `/api/content/:id` - Get single item
- GET `/api/content/search?q=term` - Search content
- POST `/api/content` - Create (admin only)
- PUT `/api/content/:id` - Update (admin only)
- DELETE `/api/content/:id` - Delete (admin only)

**Dependencies:**
- express
- pg (shared database)
- Content validation schemas

**Failure Modes:** If fails, users can't browse/search content but auth and watch remain functional

---

### 3. **User Profile Service** (`services/users/`)
Manages user preferences, watchlists, ratings, and account settings.

```
services/users/
├── index.js              # Service entry point
├── routes.js             # User endpoints
├── controllers/
│   ├── profileController.js
│   ├── watchlistController.js
│   ├── ratingController.js
│   └── settingsController.js
├── models/
│   ├── profile.js
│   ├── watchlist.js
│   └── rating.js
├── middleware/
│   └── requireAuth.js
├── __tests__/
│   ├── profile.test.js
│   ├── watchlist.test.js
│   └── rating.test.js
└── package.json
```

**Endpoints:**
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update profile
- GET `/api/users/watchlist` - Get user's watchlist
- POST `/api/users/watchlist/:contentId` - Add to watchlist
- DELETE `/api/users/watchlist/:contentId` - Remove from watchlist
- POST `/api/users/ratings` - Rate content
- PUT `/api/users/ratings/:contentId` - Update rating

**Dependencies:**
- express
- pg (shared database)
- Auth middleware from auth-service

**Failure Modes:** Users can still watch, but can't manage lists/ratings

---

### 4. **Payment Service** (`services/payments/`)
Handles Stripe integration and subscription management.

```
services/payments/
├── index.js              # Service entry point
├── routes.js             # Payment endpoints
├── controllers/
│   ├── checkoutController.js
│   ├── webhookController.js
│   └── subscriptionController.js
├── middleware/
│   └── verifyWebhook.js
├── utils/
│   ├── stripeClient.js
│   └── invoiceHelpers.js
├── __tests__/
│   ├── checkout.test.js
│   └── webhook.test.js
└── package.json
```

**Endpoints:**
- POST `/api/payments/checkout` - Create checkout session
- GET `/api/payments/status` - Get subscription status
- POST `/api/webhooks/stripe` - Stripe webhook handler
- POST `/api/payments/cancel-subscription` - Cancel subscription

**Dependencies:**
- express
- stripe
- pg (shared database)

**Failure Modes:** Payments can't be processed, but streaming continues for existing subscribers

---

### 5. **Media/Streaming Service** (`services/media/`)
Handles video streaming, transcoding requests, and CDN integration.

```
services/media/
├── index.js              # Service entry point
├── routes.js             # Media endpoints
├── controllers/
│   ├── streamController.js
│   ├── transcodeController.js
│   └── cdnController.js
├── middleware/
│   ├── verifyAccess.js
│   └── trackPlayback.js
├── utils/
│   ├── bunnyClient.js
│   ├── streamingHelpers.js
│   └── playbackTracking.js
├── __tests__/
│   └── streaming.test.js
└── package.json
```

**Endpoints:**
- GET `/api/media/:contentId/stream` - Get streaming URL
- POST `/api/media/:contentId/playback` - Track playback
- POST `/api/media/:contentId/transcode` - Request transcode
- GET `/api/media/:contentId/availability` - Check availability

**Dependencies:**
- express
- bunny-sdk
- pg (shared database)

**Failure Modes:** Videos can't be played, but browsing and content info remain available

---

### 6. **Admin Service** (`services/admin/`)
Content management, user management, analytics, and system health.

```
services/admin/
├── index.js              # Service entry point
├── routes.js             # Admin endpoints
├── controllers/
│   ├── contentController.js
│   ├── userController.js
│   ├── analyticsController.js
│   └── systemController.js
├── middleware/
│   ├── requireAdmin.js
│   └── requireSuperAdmin.js
├── utils/
│   ├── analytics.js
│   └── reportGenerator.js
├── __tests__/
│   └── admin.test.js
└── package.json
```

**Endpoints:**
- POST `/api/admin/content` - Create content
- PUT `/api/admin/content/:id` - Edit content
- DELETE `/api/admin/content/:id` - Delete content
- GET `/api/admin/users` - List users
- PUT `/api/admin/users/:id/role` - Update user role
- GET `/api/admin/analytics` - Get analytics
- GET `/api/admin/health` - System health

**Dependencies:**
- express
- pg (shared database)
- Auth middleware

**Failure Modes:** Admin operations fail, but users can still access the platform

---

## Shared Resources

### Database Layer (`services/shared/db/`)
All services share the same PostgreSQL database through connection pooling.

```
services/shared/
├── db/
│   ├── pool.js           # Shared connection pool
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
├── middleware/
│   ├── errorHandler.js
│   ├── corsHandler.js
│   └── rateLimiter.js
├── utils/
│   ├── logger.js         # Structured logging
│   ├── metrics.js        # Service metrics
│   └── validators.js
└── __tests__/
```

### API Gateway (`gateway/`)
Single entry point routing requests to appropriate microservices.

```
gateway/
├── index.js              # Gateway entry point
├── routes.js             # Route definitions
├── middleware/
│   ├── authenticate.js
│   ├── authorize.js
│   ├── rateLimit.js
│   └── logging.js
├── utils/
│   ├── serviceRegistry.js
│   ├── loadBalancer.js
│   └── circuitBreaker.js
└── config/
    └── services.json     # Service URLs
```

---

## Service Health & Monitoring

### Health Check Endpoints
Each service exposes `/health` endpoint:
```
GET /health
{
  "status": "healthy",
  "service": "auth",
  "uptime": 1234567,
  "timestamp": "2025-12-28T12:00:00Z"
}
```

### Structured Logging
Centralized logging with context:
```javascript
logger.info('User login attempted', {
  service: 'auth',
  userId: user.id,
  timestamp: new Date(),
  duration: 125 // ms
})
```

### Service Metrics
Each service tracks:
- Response times (p50, p95, p99)
- Error rates by type
- Request counts per endpoint
- Database query performance

---

## Folder Structure

```
oldflick/
├── services/
│   ├── auth/
│   ├── content/
│   ├── users/
│   ├── payments/
│   ├── media/
│   ├── admin/
│   └── shared/
│       ├── db/
│       ├── middleware/
│       └── utils/
├── gateway/
├── tests/
│   ├── integration/
│   ├── e2e/
│   └── load/
├── scripts/
│   ├── start-services.sh
│   ├── start-gateway.sh
│   └── healthcheck.js
├── docs/
│   ├── MICROSERVICES.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
└── frontend/                  # Renamed from 'src'
    ├── hooks/
    ├── components/
    ├── pages/
    ├── types/
    ├── context/
    └── styles/
```

---

## Benefits

### ✅ Better Fault Isolation
- Content service down ≠ Auth service down
- Can identify exactly which module failed
- Easier to restart single failing service

### ✅ Independent Scaling
- High traffic to content? Scale content service
- Payments overloaded? Add more payment workers
- Each service can have different resource allocation

### ✅ Easier Debugging
- Service-specific logging and metrics
- Smaller codebase per service (easier to understand)
- Tests are focused on single service

### ✅ Technology Flexibility
- Each service could use different tech stack
- Can update dependencies per service independently
- Easy to rewrite underperforming service

### ✅ Deployment Flexibility
- Deploy auth updates without touching content
- Canary deployments per service
- Rollback single service without affecting others

### ✅ Team Organization
- Teams can own specific services
- Clearer responsibilities
- Reduced merge conflicts

---

## Migration Path

### Phase 1: Setup Gateway (Week 1)
- Create gateway with routing logic
- Implement health checks
- Setup logging and metrics

### Phase 2: Extract First Service (Week 2-3)
- Extract Auth service as POC
- Setup shared database layer
- Implement circuit breaker for failures
- Test end-to-end

### Phase 3: Extract Remaining Services (Week 4-6)
- Extract Content service
- Extract Users service
- Extract Payments service
- Extract Media service
- Extract Admin service

### Phase 4: Optimize & Monitor (Week 7-8)
- Setup comprehensive monitoring
- Add caching layer per service
- Load test all services
- Performance optimization

### Phase 5: Decommission Monolith
- Remove old server/index.js
- Archive monolithic code
- Update documentation

---

## Development Workflow

### Running All Services
```bash
npm run dev:services      # Starts all services
npm run dev:gateway       # Starts gateway
npm run dev:frontend      # Starts React app
```

### Running Individual Service
```bash
cd services/auth
npm run dev
```

### Testing
```bash
npm run test              # All tests
npm run test:auth         # Auth service tests only
npm run test:integration  # Integration tests
```

### Monitoring
```bash
npm run health:check      # Health status of all services
npm run metrics           # Service metrics dashboard
npm run logs             # Aggregated logs
```

---

## Error Handling Strategy

### Graceful Degradation
- Content service down: Show "Service temporarily unavailable"
- Auth service down: Can't login, but already-logged-in users continue
- Payment service down: Queue payments, retry later

### Circuit Breaker Pattern
```javascript
// If service fails 5 times in 60 seconds, stop sending requests
// Auto-recover after 30 seconds
circuitBreaker.configure({
  failureThreshold: 5,
  resetTimeout: 30000
})
```

### Fallback Responses
```javascript
// If content service slow, serve cached response
const content = await cache.get('content:list') ||
                await contentService.list()
```

---

## Service Communication

### Synchronous (REST)
Used for real-time requests like:
- Login validation
- Content retrieval
- Payment processing

### Asynchronous (Queues)
Used for background jobs like:
- Email notifications
- Video transcoding
- Analytics processing

---

## Example: Complete User Login Flow

```
1. Frontend: POST /api/auth/login {email, password}
2. Gateway: Route to Auth service
3. Auth Service:
   - Validate input
   - Query user from shared DB
   - Compare password hash
   - Generate JWT
   - Return token
4. Gateway: Return response to frontend
5. Frontend: Store token in localStorage
6. Frontend: Include token in subsequent requests
7. Gateway/Services: Validate token via Auth service
```

---

## Next Steps

1. **Review & Approve**: Get stakeholder approval on service boundaries
2. **Setup Gateway**: Implement routing and health checks
3. **Extract Auth**: Start with auth as first microservice
4. **Iterate**: Extract services one at a time with testing
5. **Monitor**: Setup comprehensive monitoring from day 1

This architecture provides clear module boundaries, independent failure modes, and easier debugging while maintaining a unified database and consistent API surface.
