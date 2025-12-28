# Microservices Quick Start Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL connection (Neon) - configured in `.env`

## Installation

```bash
# Install root dependencies
npm install

# Copy environment file if not done already
cp .env.example .env
# Edit .env with your actual values
```

## Running the System (Current Status)

> **Note**: Auth, Content, and other services are being extracted. Until complete, the monolithic server handles requests.

### Option 1: Traditional Monolith (Current)

```bash
# Runs backend on port 3001 + frontend on port 5000
npm run dev
```

### Option 2: API Gateway Only (Gateway Infrastructure Ready)

```bash
# Terminal 1: Start API Gateway (Port 3000)
node gateway/index.js

# Terminal 2: Start Legacy Backend (Port 3001)
npm run dev:server

# Terminal 3: Start Frontend (Port 5000)
npm run dev:client

# Access: http://localhost:5000
# API Gateway: http://localhost:3000
```

### Option 3: Full Microservices (Future - When All Services Extracted)

```bash
# Terminal 1: API Gateway (Port 3000)
node gateway/index.js

# Terminal 2: Auth Service (Port 3001)
cd services/auth && npm install && node index.js

# Terminal 3: Content Service (Port 3002)
cd services/content && npm install && node index.js

# Terminal 4: User Service (Port 3003)
cd services/users && npm install && node index.js

# Terminal 5: Payments Service (Port 3004)
cd services/payments && npm install && node index.js

# Terminal 6: Media Service (Port 3005)
cd services/media && npm install && node index.js

# Terminal 7: Admin Service (Port 3006)
cd services/admin && npm install && node index.js

# Terminal 8: Frontend (Port 5000)
npm run dev:client
```

**Or use a process manager:**

```bash
# Install pm2 globally
npm install -g pm2

# Start all processes
pm2 start gateway/index.js --name "gateway"
pm2 start services/auth/index.js --name "auth" --cwd services/auth
pm2 start services/content/index.js --name "content" --cwd services/content
# ... etc for other services
npm run dev:client

# Monitor
pm2 monitor
```

## Health Checks

### Check Gateway Status

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "gateway",
  "uptime": 123.45,
  "services": {
    "auth": { "state": "CLOSED", "failureCount": 0 },
    "content": { "state": "CLOSED", "failureCount": 0 },
    "users": { "state": "CLOSED", "failureCount": 0 },
    "payments": { "state": "CLOSED", "failureCount": 0 },
    "media": { "state": "CLOSED", "failureCount": 0 },
    "admin": { "state": "CLOSED", "failureCount": 0 }
  }
}
```

### Check Individual Services

```bash
# Auth Service
curl http://localhost:3001/health

# Content Service (when extracted)
curl http://localhost:3002/health

# Gateway Metrics
curl http://localhost:3000/metrics
```

## API Usage Examples

### Authentication

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response (with token)
# Save token: export TOKEN="eyJhbGc..."
```

### List Content

```bash
# List all films
curl http://localhost:3000/api/content?content_type=film

# Search
curl "http://localhost:3000/api/content/search?q=The%20Kid"

# With authentication
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Manage Watchlist

```bash
# Add to watchlist (requires auth)
curl -X POST http://localhost:3000/api/users/watchlist/42 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Get watchlist
curl http://localhost:3000/api/users/watchlist \
  -H "Authorization: Bearer $TOKEN"

# Remove from watchlist
curl -X DELETE http://localhost:3000/api/users/watchlist/42 \
  -H "Authorization: Bearer $TOKEN"
```

## Debugging

### View Logs

```bash
# Gateway logs (development = colored output)
# Watch for INFO, WARN, ERROR messages
# Shows service status, requests, circuit breaker state

# Production logs (JSON format)
# Parse with: jq '.service' < logfile.json
```

### Check Rate Limiting

```bash
# Make 101 requests rapidly (will get 429 on 101st)
for i in {1..105}; do
  curl http://localhost:3000/health
done

# 429 Too Many Requests response:
# {
#   "error": {
#     "message": "Too many requests",
#     "statusCode": 429,
#     "retryAfter": 42
#   }
# }
```

### Circuit Breaker Breakdown

```bash
# View circuit breaker status
curl http://localhost:3000/metrics | jq '.services.content'

# Output:
# {
#   "serviceName": "content",
#   "state": "OPEN",        # CLOSED, OPEN, or HALF_OPEN
#   "failureCount": 5,
#   "successCount": 0,
#   "lastFailureTime": 1703769345123
# }
```

### Database Connection Test

```bash
# Test database pool
node -e "
import { healthCheck } from './services/shared/db/pool.js';
const result = await healthCheck();
console.log(result);
"

# Should show: { status: 'healthy', timestamp: '...' }
```

## Ports Reference

| Service | Port | Purpose |
|---------|------|---------|
| API Gateway | 3000 | Single entry point |
| Auth Service | 3001 | User authentication |
| Content Service | 3002 | Films/shows (when extracted) |
| Users Service | 3003 | Profiles & watchlists (when extracted) |
| Payments Service | 3004 | Stripe integration (when extracted) |
| Media Service | 3005 | Video streaming (when extracted) |
| Admin Service | 3006 | Admin dashboard (when extracted) |
| Frontend | 5000 | React application |
| Database | 5432 | PostgreSQL (Neon) |

## Environment Variables

Required in `.env`:

```
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Services URLs (for gateway routing)
GATEWAY_PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
CONTENT_SERVICE_URL=http://localhost:3002
USERS_SERVICE_URL=http://localhost:3003
PAYMENTS_SERVICE_URL=http://localhost:3004
MEDIA_SERVICE_URL=http://localhost:3005
ADMIN_SERVICE_URL=http://localhost:3006

# Authentication
JWT_SECRET=your-secret-key

# Frontend
FRONTEND_URL=http://localhost:5000

# Node
NODE_ENV=development
API_PORT=3001

# Optional: Logging
LOG_LEVEL=INFO      # DEBUG, INFO, WARN, ERROR, FATAL
```

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Failed

```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql "$DATABASE_URL"

# Check Neon is running (in Neon console)
```

### Circuit Breaker Open

Service is failing. Check logs and restart:

```bash
# Kill service
kill -SIGTERM <pid>

# Fix issue (database, dependencies, code)
# Then restart
node services/auth/index.js
```

### Services Not Communicating

```bash
# Check gateway can reach service
curl http://localhost:3001/health

# Check if service is actually running
ps aux | grep node

# Check firewall/network
netstat -tlnp | grep 300
```

## Development Tips

### Watch Logs in Real-time

```bash
# Terminal multiplexer (tmux)
tmux new-session -d -s dev
tmux send-keys -t dev 'node gateway/index.js' C-m
tmux send-keys -t dev:new-window 'npm run dev:server' C-m
tmux send-keys -t dev:new-window 'npm run dev:client' C-m
tmux attach -t dev
```

### Monitor Service Health

```bash
# Continuous health check
watch -n 5 'curl -s http://localhost:3000/health | jq ".services"'
```

### Test Service Resilience

```bash
# Kill a service and watch recovery
kill -SIGTERM <service-pid>

# Gateway will detect failure (circuit breaker opens)
# Check metrics
curl http://localhost:3000/metrics | jq '.services'
```

## Next Steps

1. **Local Development**: Use Option 1 (npm run dev) for simplicity
2. **Test Gateway**: With Option 2 to verify routing
3. **When Services Ready**: Use Option 3 for full microservices
4. **Production**: Use Docker and orchestration tool (Kubernetes)

## Documentation

- **Full Architecture**: See `MICROSERVICES_ARCHITECTURE.md`
- **Setup Guide**: See `docs/MICROSERVICES_SETUP.md`
- **Progress**: See `REFACTORING_PROGRESS.md`
- **Troubleshooting**: See `docs/TROUBLESHOOTING.md`

---

**Status**: Gateway infrastructure ready, monolith still serving requests
**Next**: Extract Auth Service as first microservice
