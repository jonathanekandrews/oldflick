# Microservices Reference Guide

**Purpose**: Quick reference for all microservices, ports, and communication
**Last Updated**: December 28, 2025
**Architecture Version**: 2.0 (Microservices)

## Services Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (Port 5000)                      │
│                  React Application + Vite                    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              API Gateway (Port 3000)                          │
│   Single Entry Point with Routing & Authentication           │
└──────────────────────────┬───────────────────────────────────┘
    │          │        │       │        │        │
    ▼          ▼        ▼       ▼        ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Auth   │ │Content │ │ Users  │ │Payment │ │ Media  │ │ Admin  │
│Service │ │Service │ │Service │ │Service │ │Service │ │Service │
│:3001   │ │:3002   │ │:3003   │ │:3004   │ │:3005   │ │:3006   │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
    │          │        │       │        │        │
    └──────────┴────────┴───────┴────────┴────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │  PostgreSQL (Neon)       │
        │  Shared Database         │
        └──────────────────────────┘
```

## Service Details

### 1. API Gateway

**Purpose**: Route requests, handle authentication, enforce rate limits

| Property | Value |
|----------|-------|
| **Port** | 3000 |
| **Type** | Express.js HTTP Server |
| **Language** | JavaScript (ES6) |
| **Entry Point** | `gateway/index.js` |
| **Status** | ✅ Ready |

**Responsibilities**:
- Route /api/* requests to services
- Verify JWT tokens
- Rate limiting (100 req/min per IP)
- Request logging
- Circuit breaker management

**Health Check**:
```bash
curl http://localhost:3000/health
```

**Metrics**:
```bash
curl http://localhost:3000/metrics
```

---

### 2. Auth Service

**Purpose**: User authentication, identity management, JWT tokens

| Property | Value |
|----------|-------|
| **Port** | 3001 |
| **Type** | Express.js HTTP Server |
| **Language** | JavaScript (ES6) |
| **Entry Point** | `services/auth/index.js` |
| **Database** | PostgreSQL (Neon) - shared |
| **Status** | ⏳ In Development |

**API Endpoints**:
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `GET /me` - Get current user

**Request Body**:
```json
// Login
{
  "email": "user@example.com",
  "password": "password123"
}

// Register
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "name": "Full Name"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Full Name",
    "role": "user"
  }
}
```

**Database Tables**:
- `users` - User accounts and credentials

**Key Files**:
- `services/auth/index.js` - Service entry
- `services/auth/routes.js` - Endpoint routing
- `services/auth/controllers/` - Business logic
- `services/auth/models/user.js` - Database queries

---

### 3. Content Service

**Purpose**: Film and TV show catalog, search, filtering

| Property | Value |
|----------|-------|
| **Port** | 3002 |
| **Type** | Express.js HTTP Server |
| **Language** | JavaScript (ES6) |
| **Entry Point** | `services/content/index.js` |
| **Database** | PostgreSQL (Neon) - shared |
| **Status** | ⏳ In Development |

**API Endpoints**:
- `GET /list` - List all content with filters
- `GET /:id` - Get single item
- `GET /search?q=term` - Search content
- `POST /` - Create content (admin)
- `PUT /:id` - Update content (admin)
- `DELETE /:id` - Delete content (admin)

**Query Parameters**:
```
GET /api/content?genre=Drama&limit=10&offset=0&sort=rating
GET /api/content/search?q=The%20Kid&type=film
```

**Database Tables**:
- `content` - Films and shows metadata

**Key Files**:
- `services/content/index.js` - Service entry
- `services/content/routes.js` - Endpoint routing
- `services/content/controllers/` - Business logic
- `services/content/models/content.js` - Database queries

---

### 4. User Service

**Purpose**: User profiles, watchlists, ratings, preferences

| Property | Value |
|----------|-------|
| **Port** | 3003 |
| **Type** | Express.js HTTP Server |
| **Language** | JavaScript (ES6) |
| **Entry Point** | `services/users/index.js` |
| **Database** | PostgreSQL (Neon) - shared |
| **Status** | ⏳ In Development |

**API Endpoints**:
- `GET /profile` - User profile
- `PUT /profile` - Update profile
- `GET /watchlist` - User's watchlist
- `POST /watchlist/:id` - Add to watchlist
- `DELETE /watchlist/:id` - Remove from watchlist
- `POST /ratings` - Rate content
- `PUT /ratings/:id` - Update rating

**Database Tables**:
- `user_profiles` - Extended user information
- `user_watchlist` - Saved films
- `user_ratings` - Content ratings

**Key Files**:
- `services/users/index.js` - Service entry
- `services/users/routes.js` - Endpoint routing
- `services/users/controllers/` - Business logic

---

### 5. Payment Service

**Purpose**: Stripe integration, subscription management

| Property | Value |
|----------|-------|
| **Port** | 3004 |
| **Type** | Express.js HTTP Server |
| **Language** | JavaScript (ES6) |
| **Entry Point** | `services/payments/index.js` |
| **Database** | PostgreSQL (Neon) - shared |
| **External API** | Stripe (https://api.stripe.com) |
| **Status** | ⏳ In Development |

**API Endpoints**:
- `POST /checkout` - Create checkout session
- `GET /status` - Get subscription status
- `POST /webhooks/stripe` - Handle Stripe webhooks
- `POST /cancel-subscription` - Cancel subscription

**Environment Variables**:
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_PUBLISHABLE_KEY` - Frontend key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing

**Database Tables**:
- `subscriptions` - User subscriptions
- `payments` - Payment history

**Key Files**:
- `services/payments/index.js` - Service entry
- `services/payments/controllers/checkoutController.js`
- `services/payments/utils/stripeClient.js` - Stripe integration

---

### 6. Media Service

**Purpose**: Video streaming, playback tracking, CDN integration

| Property | Value |
|----------|-------|
| **Port** | 3005 |
| **Type** | Express.js HTTP Server |
| **Language** | JavaScript (ES6) |
| **Entry Point** | `services/media/index.js` |
| **Database** | PostgreSQL (Neon) - shared |
| **CDN** | Bunny.NET |
| **Status** | ⏳ In Development |

**API Endpoints**:
- `GET /:id/stream` - Get streaming URL
- `POST /:id/playback` - Track playback
- `GET /:id/availability` - Check video availability

**Response**:
```json
{
  "contentId": 1,
  "streamUrl": "https://cdn.oldflick.com/video/1.mp4",
  "cdnProvider": "bunnynet",
  "quality": ["720p", "1080p"],
  "duration": 4080
}
```

**External APIs**:
- Bunny.NET API for CDN operations

**Database Tables**:
- `video_streams` - Video metadata
- `playback_history` - User playback tracking

**Key Files**:
- `services/media/index.js` - Service entry
- `services/media/utils/bunnyClient.js` - CDN integration
- `services/media/controllers/streamController.js`

---

### 7. Admin Service

**Purpose**: Admin dashboard, user management, analytics, system health

| Property | Value |
|----------|-------|
| **Port** | 3006 |
| **Type** | Express.js HTTP Server |
| **Language** | JavaScript (ES6) |
| **Entry Point** | `services/admin/index.js` |
| **Database** | PostgreSQL (Neon) - shared |
| **Status** | ⏳ In Development |
| **Access** | Admin/SuperAdmin only |

**API Endpoints**:
- `POST /content` - Create content
- `PUT /content/:id` - Edit content
- `DELETE /content/:id` - Delete content
- `GET /users` - List users
- `PUT /users/:id/role` - Update user role
- `GET /analytics` - Get analytics
- `GET /health` - System health

**Database Tables**:
- All tables (read/write)

**Key Files**:
- `services/admin/index.js` - Service entry
- `services/admin/controllers/contentController.js`
- `services/admin/controllers/userController.js`
- `services/admin/utils/analytics.js`

---

## Shared Resources

### Database Connection Pool

**Location**: `services/shared/db/pool.js`

**Configuration**:
- Max connections: 20
- Idle timeout: 30 seconds
- Query timeout: 30 seconds
- SSL: Required (Neon)

**Usage**:
```javascript
import { query, getClient } from '../shared/db/pool.js';

// Execute query
const result = await query('SELECT * FROM content WHERE id = $1', [id]);

// Get dedicated client
const client = await getClient();
await client.query('...');
client.release();
```

### Logger

**Location**: `services/shared/utils/logger.js`

**Levels**: DEBUG, INFO, WARN, ERROR, FATAL

**Usage**:
```javascript
import { createLogger } from '../shared/utils/logger.js';
const logger = createLogger('service-name');

logger.info('User login', { userId: 123 });
logger.error('Database error', { query: sql });
```

### Circuit Breaker

**Location**: `services/shared/utils/circuitBreaker.js`

**States**: CLOSED (normal), OPEN (failing), HALF_OPEN (recovering)

**Configuration per Service**:
- Auth: 5 failures → open, 30s recovery
- Content: 5 failures → open, 30s recovery
- Payments: 3 failures → open, 60s recovery
- Others: 5 failures → open, 30s recovery

---

## Running Services

### Start All Services

```bash
# Terminal 1: API Gateway
node gateway/index.js

# Terminal 2: Auth Service (when ready)
cd services/auth && node index.js

# Terminal 3: Content Service (when ready)
cd services/content && node index.js

# Terminal 4: Other services...
# Terminal N: Frontend
npm run dev:client
```

### Or with Process Manager (PM2)

```bash
pm2 start gateway/index.js --name "gateway"
pm2 start services/auth/index.js --name "auth" --cwd services/auth
pm2 start services/content/index.js --name "content" --cwd services/content
# ... etc

pm2 monitor
```

---

## Service Communication

### Synchronous (REST)

Services communicate via HTTP:

```
Gateway → Auth Service
GET http://localhost:3001/me
Authorization: Bearer {token}
```

### Asynchronous (Future)

Message queue for background jobs:

```
Payment Service → Message Queue → Email Service
POST /api/payments/checkout → Email notification
```

---

## Authentication Flow

1. **Frontend** sends login credentials to **API Gateway**
2. **Gateway** routes to **Auth Service**
3. **Auth Service** validates and generates JWT
4. **Frontend** receives token and stores in localStorage
5. **Frontend** includes token in Authorization header
6. **Gateway** verifies token for protected routes
7. **Services** trust the authenticated request

---

## Error Handling

### Circuit Breaker Open

```json
{
  "error": {
    "message": "Content service temporarily unavailable",
    "statusCode": 503,
    "retryAfter": 30
  }
}
```

### Authentication Required

```json
{
  "error": {
    "message": "No authentication token provided",
    "statusCode": 401
  }
}
```

### Validation Error

```json
{
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "errors": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

---

## Health Checks

### Gateway Health
```bash
curl http://localhost:3000/health | jq '.'
```

### Service Health (when running)
```bash
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # Content
curl http://localhost:3003/health  # Users
# etc...
```

### Service Metrics
```bash
curl http://localhost:3000/metrics | jq '.services'
```

---

## Development Checklist

- [ ] Service created in `services/[name]/`
- [ ] `index.js` entry point with port
- [ ] `routes.js` with endpoints
- [ ] `controllers/` directory with logic
- [ ] `models/` directory with DB queries
- [ ] Database tables created
- [ ] Error handling implemented
- [ ] Logging added
- [ ] Health check endpoint
- [ ] Tests written
- [ ] Documentation updated
- [ ] Gateway routes configured
- [ ] Environment variables added
- [ ] Deployed and tested

---

**Document Type**: Reference File
**Audience**: Developers, DevOps, Architects
**Last Updated By**: Architecture Refactoring
**Update Frequency**: As services are added/modified
**Related Files**:
- `MICROSERVICES_ARCHITECTURE.md` - Design details
- `docs/MICROSERVICES_SETUP.md` - Setup guide
- `MICROSERVICES_QUICKSTART.md` - Getting started
