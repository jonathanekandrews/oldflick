# Inter-Service Messaging Protocol

**Purpose**: Define how microservices communicate with each other
**Last Updated**: December 28, 2025
**Version**: 1.0

## Communication Patterns

OldFlick uses two main communication patterns:

### 1. Synchronous (REST/HTTP) ✅ Currently Implemented

Direct HTTP requests from one service to another, mediated by the API Gateway.

### 2. Asynchronous (Message Queue) ⏳ Future Implementation

Event-based messaging for background jobs and notifications.

---

## Synchronous Communication (HTTP)

### Gateway-to-Service Pattern

```
Client Request
    ↓
API Gateway
    ↓
Verify Token
    ↓
Route to Service
    ↓
Service Process
    ↓
Return Response
    ↓
Gateway Response to Client
```

### Example: Login Flow

**Request**:
```http
POST /api/auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Gateway Routes To**:
```http
POST http://localhost:3001/login HTTP/1.1
Host: localhost:3001
Content-Type: application/json
X-Forwarded-For: client-ip

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

---

## Service-to-Service Communication (Future)

When services need to call each other directly:

```javascript
import fetch from 'node-fetch';

// Content Service calling Auth Service to verify token
const response = await fetch('http://localhost:3001/verify-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ token })
});

const verified = await response.json();
```

---

## Asynchronous Messaging (Event-Driven)

### When to Use

- **Sending emails** (payment confirmation)
- **Generating reports** (analytics)
- **Processing uploads** (video transcoding)
- **Notifications** (new content alerts)
- **Logging** (audit trail)

### Proposed Architecture

```
Payment Service
    ↓
Publishes Event:
{
  "type": "payment.completed",
  "userId": 123,
  "amount": 9.99,
  "timestamp": "2025-12-28T12:00:00Z"
}
    ↓
Message Queue (Redis/RabbitMQ)
    ↓
Email Service (subscriber)
Email Notification Service (subscriber)
Analytics Service (subscriber)
```

### Event Types

#### Purchase Events
```json
{
  "type": "purchase.completed",
  "event_id": "evt_123abc",
  "service": "payments",
  "data": {
    "userId": 1,
    "amount": 9.99,
    "currency": "USD",
    "subscriptionId": "sub_123",
    "transactionId": "txn_abc123"
  },
  "timestamp": "2025-12-28T12:00:00Z"
}
```

#### Content Events
```json
{
  "type": "content.added",
  "event_id": "evt_456def",
  "service": "content",
  "data": {
    "contentId": 4,
    "title": "New Film",
    "genre": "Drama",
    "director": "Director Name"
  },
  "timestamp": "2025-12-28T12:00:00Z"
}
```

#### User Events
```json
{
  "type": "user.registered",
  "event_id": "evt_789ghi",
  "service": "auth",
  "data": {
    "userId": 42,
    "email": "newuser@example.com",
    "name": "New User"
  },
  "timestamp": "2025-12-28T12:00:00Z"
}
```

---

## API Communication Standards

### Request Headers

```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-Forwarded-For: {client_ip}
X-Request-ID: {unique_request_id}
User-Agent: oldflick-gateway/1.0
```

### Response Headers

```http
Content-Type: application/json
X-Response-Time: {duration_ms}
X-Service: {service_name}
Cache-Control: {caching_policy}
```

### Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Content retrieved |
| 201 | Created | User registered |
| 204 | No Content | Item deleted |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Database error |
| 503 | Service Unavailable | Circuit breaker open |

---

## Service Discovery

### Static Configuration (Current)

Gateway has hardcoded service URLs:

```javascript
// gateway/index.js
export const serviceRegistry = {
  auth: 'http://localhost:3001',
  content: 'http://localhost:3002',
  users: 'http://localhost:3003',
  payments: 'http://localhost:3004',
  media: 'http://localhost:3005',
  admin: 'http://localhost:3006'
};
```

### Dynamic Configuration (Future)

Services register themselves:

```javascript
// services/auth/index.js
import { registerService } from '../shared/discovery.js';

await registerService({
  name: 'auth',
  url: 'http://localhost:3001',
  health: 'http://localhost:3001/health',
  version: '1.0.0'
});
```

---

## Error Propagation

### Example: Content Service Error

**Content Service** returns error:
```json
{
  "error": {
    "message": "Film not found",
    "statusCode": 404
  }
}
```

**Gateway** forwards to client:
```json
{
  "error": {
    "message": "Film not found",
    "statusCode": 404,
    "service": "content",
    "timestamp": "2025-12-28T12:00:00Z"
  }
}
```

---

## Timeout & Retry Strategy

### Timeout Settings

| Service | Timeout | Retry |
|---------|---------|-------|
| Auth | 5s | 1 |
| Content | 10s | 2 |
| Users | 5s | 1 |
| Payments | 30s | 3 |
| Media | 30s | 1 |
| Admin | 10s | 1 |

### Retry Logic

```javascript
async function callServiceWithRetry(serviceName, fn, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## Circuit Breaker Pattern

### States & Transitions

```
CLOSED (normal)
  │
  ├─ 5 failures in 60s
  │
  ▼
OPEN (failing)
  │
  ├─ 30s timeout
  │
  ▼
HALF_OPEN (testing)
  │
  ├─ Success → CLOSED
  │
  └─ Failure → OPEN
```

### Current Configuration

```javascript
{
  auth: { failureThreshold: 5, resetTimeout: 30000 },
  content: { failureThreshold: 5, resetTimeout: 30000 },
  users: { failureThreshold: 5, resetTimeout: 30000 },
  payments: { failureThreshold: 3, resetTimeout: 60000 },
  media: { failureThreshold: 5, resetTimeout: 30000 },
  admin: { failureThreshold: 5, resetTimeout: 30000 }
}
```

---

## Logging & Tracing

### Request ID Tracking

Each request gets a unique ID for tracing:

```
Frontend Request ID: req_abc123
    ↓
API Gateway logs: req_abc123 → /api/auth/login
    ↓
Auth Service logs: req_abc123 → Processing login
    ↓
Auth Service logs: req_abc123 → Query user DB
    ↓
Auth Service logs: req_abc123 → Login successful
    ↓
Gateway logs: req_abc123 → 200 OK (125ms)
```

### Log Format

```json
{
  "timestamp": "2025-12-28T12:00:00.000Z",
  "level": "INFO",
  "service": "auth",
  "requestId": "req_abc123",
  "message": "User login successful",
  "userId": 1,
  "duration": 125,
  "statusCode": 200
}
```

---

## Monitoring & Metrics

### Service Health Dashboard

```bash
curl http://localhost:3000/health | jq '.services'
```

Output:
```json
{
  "auth": {
    "state": "CLOSED",
    "failureCount": 0,
    "uptime": 3600,
    "lastCheck": "2025-12-28T12:00:00Z"
  },
  "content": {
    "state": "CLOSED",
    "failureCount": 0,
    "uptime": 3600,
    "lastCheck": "2025-12-28T12:00:00Z"
  }
}
```

### Performance Metrics

- **Response Time**: Average time per service
- **Error Rate**: Percentage of failures
- **Throughput**: Requests per second
- **Circuit Breaker State**: Open/Closed/Half-Open

---

## Testing Inter-Service Communication

### Test Auth Service

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq '.'
```

### Test Content Service (when available)

```bash
curl http://localhost:3000/api/content \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### Test Watchlist Service (when available)

```bash
curl http://localhost:3000/api/users/watchlist \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

---

## Future Messaging Implementation

### When to Add Message Queue

Once services need to handle:
- High-volume event processing
- Asynchronous notifications
- Long-running operations
- Event sourcing
- Distributed transactions

### Recommended Solutions

1. **Redis Pub/Sub** - Simple, fast
2. **RabbitMQ** - Enterprise-grade
3. **Apache Kafka** - High-throughput
4. **AWS SQS** - Managed service

---

## Glossary

| Term | Definition |
|------|-----------|
| **Synchronous** | Wait for response before continuing |
| **Asynchronous** | Fire-and-forget, don't wait for response |
| **Circuit Breaker** | Pattern to prevent cascading failures |
| **Event** | Something that happened in the system |
| **Message Queue** | Temporary storage for asynchronous messages |
| **Request ID** | Unique identifier for tracing requests |
| **Timeout** | Maximum time to wait for response |
| **Retry** | Attempt operation again if it fails |

---

**Document Type**: Reference File
**Audience**: Backend Developers, DevOps, Architects
**Last Updated By**: Architecture Refactoring
**Update Frequency**: As messaging system evolves
**Related Files**:
- `SERVICES_REFERENCE.md` - Service details
- `docs/MICROSERVICES_SETUP.md` - Setup guide
