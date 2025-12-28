# Microservices Architecture Setup - Implementation Guide

## Overview

OldFlick has been restructured to use a microservices architecture with an API Gateway pattern. This provides:

- **Better Fault Isolation**: Services fail independently
- **Easy Debugging**: Know exactly which module is broken
- **Independent Scaling**: Scale services separately based on load
- **Clear Responsibilities**: Each service has single purpose

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│                    (http://localhost:5000)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP Requests
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway                                   │
│                  (http://localhost:3000)                        │
│  - Routing                                                      │
│  - Rate Limiting (100 req/min per IP)                          │
│  - Authentication (JWT verification)                            │
│  - Logging & Monitoring                                         │
│  - Circuit Breakers                                            │
└──────────────────────────┬──────────────────────────────────────┘
           │               │               │               │
           ▼               ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │   Auth   │    │ Content  │   │  Users   │   │  Media   │
    │ Service  │    │ Service  │   │ Service  │   │ Service  │
    │ :3001    │    │ :3002    │   │ :3003    │   │ :3005    │
    └──────────┘    └──────────┘   └──────────┘   └──────────┘
    ┌──────────┐    ┌──────────┐
    │ Payments │    │  Admin   │
    │ Service  │    │ Service  │
    │ :3004    │    │ :3006    │
    └──────────┘    └──────────┘
           │               │
           └───────┬───────┘
                   ▼
    ┌──────────────────────────┐
    │  PostgreSQL (Neon)       │
    │  Shared Database         │
    │  Connection Pool (20 max)│
    └──────────────────────────┘
```

## File Structure

```
oldflick/
├── gateway/                              # API Gateway (port 3000)
│   ├── index.js                         # Gateway entry point
│   ├── routes.js                        # Service routing
│   ├── config/
│   │   └── services.json               # Service registry
│   └── middleware/
│       ├── index.js                    # Middleware setup
│       ├── logging.js                  # Request logging
│       ├── rateLimit.js               # Rate limiting
│       └── authentication.js            # JWT verification
│
├── services/
│   ├── auth/                            # Authentication Service
│   │   ├── index.js
│   │   ├── routes.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── models/
│   │
│   ├── content/                         # Content Service
│   │   ├── index.js
│   │   ├── routes.js
│   │   ├── controllers/
│   │   └── models/
│   │
│   ├── users/                           # User Profile Service
│   ├── payments/                        # Payment Service
│   ├── media/                           # Media Streaming Service
│   ├── admin/                           # Admin Service
│   │
│   └── shared/                          # Shared Resources
│       ├── db/
│       │   └── pool.js                 # Database connection pool
│       ├── middleware/
│       │   └── errorHandler.js         # Shared error handling
│       └── utils/
│           ├── logger.js               # Structured logging
│           ├── circuitBreaker.js       # Fault tolerance
│           └── validators.js           # Input validation
│
├── tests/
│   ├── integration/                    # Integration tests
│   ├── e2e/                           # End-to-end tests
│   └── load/                          # Load tests
│
├── frontend/                            # React frontend (formerly src/)
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── context/
│   ├── types/
│   └── styles/
│
├── scripts/
│   ├── start-services.sh              # Start all services
│   └── healthcheck.js                 # Service health monitoring
│
└── docs/
    ├── MICROSERVICES.md               # Architecture overview
    ├── MICROSERVICES_SETUP.md         # This file
    ├── API.md                         # API documentation
    └── TROUBLESHOOTING.md             # Common issues
```

## Services Overview

### 1. API Gateway (Port 3000)

**Purpose**: Single entry point for all requests

**Responsibilities**:
- Route requests to appropriate service
- Verify authentication tokens
- Rate limiting
- Logging and monitoring
- Health checks

**Key Files**:
- `gateway/index.js` - Entry point
- `gateway/routes.js` - Route definitions
- `gateway/middleware/` - Middleware pipeline

**Health Check**:
```bash
curl http://localhost:3000/health
```

### 2. Auth Service (Port 3001)

**Purpose**: User authentication and identity management

**Endpoints**:
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `GET /me` - Get current user

**Database Tables**:
- `users` - User accounts and credentials

### 3. Content Service (Port 3002)

**Purpose**: Film and TV show catalog management

**Endpoints**:
- `GET /list` - List all content with filters
- `GET /:id` - Get single item
- `GET /search?q=term` - Search content
- `POST /` - Create content (admin)
- `PUT /:id` - Update content (admin)
- `DELETE /:id` - Delete content (admin)

**Database Tables**:
- `content` - Film/show metadata

### 4. User Service (Port 3003)

**Purpose**: User preferences, watchlists, ratings

**Endpoints**:
- `GET /profile` - User profile
- `PUT /profile` - Update profile
- `GET /watchlist` - User's watchlist
- `POST /watchlist/:id` - Add to watchlist
- `DELETE /watchlist/:id` - Remove from watchlist
- `POST /ratings` - Rate content

**Database Tables**:
- `user_watchlist` - Saved films
- `user_ratings` - Content ratings

### 5. Payment Service (Port 3004)

**Purpose**: Stripe integration and subscriptions

**Endpoints**:
- `POST /checkout` - Create checkout session
- `GET /status` - Get subscription status
- `POST /webhooks/stripe` - Stripe webhooks
- `POST /cancel-subscription` - Cancel subscription

**Database Tables**:
- `subscriptions` - User subscriptions
- `payments` - Payment history

### 6. Media Service (Port 3005)

**Purpose**: Video streaming and playback

**Endpoints**:
- `GET /:id/stream` - Get streaming URL
- `POST /:id/playback` - Track playback
- `GET /:id/availability` - Check video availability

**Integrations**:
- Bunny.NET CDN for video delivery

### 7. Admin Service (Port 3006)

**Purpose**: Admin dashboard and system management

**Endpoints**:
- `POST /content` - Create content
- `GET /users` - List users
- `PUT /users/:id/role` - Update user role
- `GET /analytics` - System analytics
- `GET /health` - System health

## Shared Resources

### Database Connection Pool

Located in `services/shared/db/pool.js`

```javascript
import { getClient, query, healthCheck } from './services/shared/db/pool.js';

// Execute query
const result = await query('SELECT * FROM content WHERE id = $1', [contentId]);

// Get dedicated client
const client = await getClient();
await client.query('...');
client.release();

// Check health
const health = await healthCheck();
```

**Configuration**:
- Max connections: 20
- Idle timeout: 30 seconds
- Query timeout: 30 seconds
- SSL: Required (Neon)

### Structured Logging

Located in `services/shared/utils/logger.js`

```javascript
import { createLogger } from './services/shared/utils/logger.js';

const logger = createLogger('service-name');

logger.info('User logged in', { userId: user.id });
logger.error('Database error', { query: sql });
logger.warn('High response time', { duration: 5000 });
```

**Log Levels**:
- DEBUG - Detailed debugging info
- INFO - General information
- WARN - Warning messages
- ERROR - Error messages
- FATAL - Critical errors

**Output**:
- Development: Pretty-printed with colors
- Production: JSON format for aggregation

### Circuit Breakers

Located in `services/shared/utils/circuitBreaker.js`

Prevents cascading failures by stopping requests to failing services.

```javascript
import { circuitBreakers } from '../gateway/index.js';

const status = circuitBreakers.content.getStatus();
// {
//   state: 'CLOSED',        // CLOSED, OPEN, or HALF_OPEN
//   failureCount: 0,
//   serviceName: 'content'
// }
```

**States**:
- **CLOSED** (Normal): Pass requests through normally
- **OPEN** (Failing): Stop sending requests, return 503
- **HALF_OPEN** (Recovering): Allow limited requests to test recovery

**Configuration per Service**:
- Auth: 5 failures → open, 30s reset
- Content: 5 failures → open, 30s reset
- Payments: 3 failures → open, 60s reset
- Others: 5 failures → open, 30s reset

## Running Services

### Start All Services

```bash
# Start all services and gateway
npm run dev:services

# Or manually:
cd gateway && node index.js &
cd services/auth && node index.js &
cd services/content && node index.js &
cd services/users && node index.js &
cd services/payments && node index.js &
cd services/media && node index.js &
cd services/admin && node index.js &
```

### Start Individual Service

```bash
cd services/auth
npm install
npm run dev
```

### Check Service Health

```bash
# Gateway health
curl http://localhost:3000/health

# All service statuses
curl http://localhost:3000/health | jq '.services'

# Metrics
curl http://localhost:3000/metrics
```

## API Examples

### Login User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": { "id": 1, "email": "user@example.com" }
# }
```

### Get Content List

```bash
curl http://localhost:3000/api/content?genre=Drama&limit=10

# With auth:
curl http://localhost:3000/api/content \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Add to Watchlist

```bash
curl -X POST http://localhost:3000/api/users/watchlist/42 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

## Error Handling

### Graceful Degradation

If a service fails:

| Service | Impact | User Experience |
|---------|--------|-----------------|
| Auth | Users can't login | "Service temporarily unavailable" |
| Content | Can't browse/search | "Content unavailable, try later" |
| Users | Can't manage lists | "Watchlist unavailable, retry later" |
| Payments | Can't process payments | "Payment service down, try later" |
| Media | Can't watch videos | "Video unavailable" |
| Admin | Admin features unavailable | "Admin panel offline" |

### Circuit Breaker Response

When a service circuit breaker is OPEN:

```json
{
  "error": {
    "message": "Content service temporarily unavailable",
    "statusCode": 503,
    "retryAfter": 30
  }
}
```

## Monitoring & Debugging

### View Service Status

```bash
# All services
curl http://localhost:3000/health | jq '.'

# Specific service
curl http://localhost:3001/health  # Auth service
curl http://localhost:3002/health  # Content service
```

### View Logs

```bash
# Gateway logs (development)
# Colors indicate severity: Green=INFO, Yellow=WARN, Red=ERROR

# Production logs (JSON)
# Parse with: jq '.service' or send to log aggregation service
```

### Monitor Metrics

```bash
curl http://localhost:3000/metrics | jq '.services'

# Shows for each service:
# - state (CLOSED, OPEN, HALF_OPEN)
# - failureCount
# - successCount
# - lastFailureTime
```

## Troubleshooting

### Service Not Responding

```bash
# Check if service is running
ps aux | grep node

# Check service port is listening
netstat -tulpn | grep 3001

# Check gateway routes service
curl http://localhost:3000/health -v

# Check service directly
curl http://localhost:3001/health
```

### Circuit Breaker Open

Service is failing repeatedly. Check logs and restart:

```bash
# Graceful shutdown
kill -SIGTERM <pid>

# Fix issue (database, dependencies, etc)

# Restart service
cd services/auth && node index.js
```

### Database Connection Errors

```bash
# Test database connection
node -e "
  import { healthCheck } from './services/shared/db/pool.js';
  const health = await healthCheck();
  console.log(health);
"

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Verify Neon is accessible
psql <DATABASE_URL>
```

### Rate Limit Exceeded

Your IP is rate limited (100 requests per minute).

```bash
# Clear rate limiting (gateway restart)
kill -SIGTERM <gateway-pid>
node gateway/index.js
```

## Next Steps

1. **Extract Auth Service**: Move auth logic from monolith to `services/auth/`
2. **Extract Content Service**: Move content logic to `services/content/`
3. **Setup Monitoring**: Integrate with external monitoring (DataDog, New Relic, etc)
4. **Add Tests**: Create integration tests for service communication
5. **Deploy**: Use Docker/Kubernetes for containerized deployment

## Migration Timeline

- **Week 1**: API Gateway setup ✅
- **Week 2-3**: Extract Auth Service (POC)
- **Week 4-6**: Extract remaining services
- **Week 7-8**: Optimize and monitor
- **Week 9**: Decommission monolith

## Architecture Benefits

✅ **Fault Isolation**: Services fail independently
✅ **Easy Debugging**: Know exactly which service failed
✅ **Independent Scaling**: Scale services separately
✅ **Technology Flexibility**: Each service can use different tech
✅ **Team Organization**: Teams can own specific services
✅ **Deployment Flexibility**: Deploy services independently
✅ **Better Testing**: Test services in isolation

---

**Document Version**: 1.0
**Last Updated**: December 28, 2025
**Architecture Status**: ⚠️ In Implementation (Phase 3)
