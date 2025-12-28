# API Reference Documentation

**Purpose**: Complete API endpoint reference for all services
**Last Updated**: December 28, 2025
**Base URL**: `http://localhost:3000` (API Gateway)

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Auth Service Endpoints

Base Path: `/api/auth`

### 1. User Login

**POST** `/api/auth/login`

**Public**: ✅ Yes (no token required)

**Description**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Error Responses**:
- 400: Invalid email/password format
- 401: Invalid credentials
- 429: Too many login attempts

**Example**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

### 2. User Registration

**POST** `/api/auth/register`

**Public**: ✅ Yes (no token required)

**Description**: Create a new user account

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "name": "Jane Doe"
}
```

**Success Response (201)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "role": "user"
  }
}
```

**Error Responses**:
- 400: Validation failed (invalid email, weak password)
- 409: Email already registered
- 429: Too many registration attempts

**Validation Rules**:
- Email: Valid email format
- Password: Minimum 8 characters, uppercase, number, special char
- Name: 2-50 characters

**Example**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "name": "Jane Doe"
  }'
```

---

### 3. User Logout

**POST** `/api/auth/logout`

**Public**: ❌ No (requires token)

**Description**: Invalidate user session

**Request Headers**:
```http
Authorization: Bearer {token}
```

**Success Response (200)**:
```json
{
  "message": "Logged out successfully"
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. Get Current User

**GET** `/api/auth/me`

**Public**: ❌ No (requires token)

**Description**: Get authenticated user information

**Request Headers**:
```http
Authorization: Bearer {token}
```

**Success Response (200)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "createdAt": "2025-12-01T10:00:00Z"
}
```

**Error Responses**:
- 401: Invalid or expired token

**Example**:
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Content Service Endpoints

Base Path: `/api/content`

### 1. List Content

**GET** `/api/content`

**Public**: ✅ Yes (no token required)

**Description**: Get all films and shows with optional filtering

**Query Parameters**:
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `genre` | string | Filter by genre | `?genre=Drama` |
| `content_type` | string | Filter by type (film/tv) | `?content_type=film` |
| `limit` | number | Results per page (default: 10) | `?limit=20` |
| `offset` | number | Pagination offset (default: 0) | `?offset=10` |
| `sort` | string | Sort field (rating, release_year, title) | `?sort=rating` |
| `order` | string | Sort order (asc, desc) | `?order=desc` |

**Success Response (200)**:
```json
{
  "items": [
    {
      "id": 1,
      "title": "The Kid",
      "director": "Charlie Chaplin",
      "release_year": 1921,
      "rating": 8.3,
      "genre": "Comedy, Drama",
      "poster_url": "https://...",
      "content_type": "film"
    },
    {
      "id": 2,
      "title": "The General",
      "director": "Buster Keaton",
      "release_year": 1926,
      "rating": 8.1,
      "genre": "Comedy, Action",
      "poster_url": "https://...",
      "content_type": "film"
    }
  ],
  "total": 3,
  "limit": 10,
  "offset": 0
}
```

**Example**:
```bash
# List all films
curl "http://localhost:3000/api/content?content_type=film"

# List with filters
curl "http://localhost:3000/api/content?genre=Drama&limit=5&sort=rating&order=desc"

# Save token and use
export TOKEN="eyJhbGc..."
curl "http://localhost:3000/api/content" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 2. Get Content by ID

**GET** `/api/content/:id`

**Public**: ✅ Yes

**Description**: Get detailed information about a specific film/show

**URL Parameters**:
- `id` (required): Content ID

**Success Response (200)**:
```json
{
  "id": 1,
  "title": "The Kid",
  "director": "Charlie Chaplin",
  "release_year": 1921,
  "runtime_minutes": 68,
  "rating": 8.3,
  "genre": "Comedy, Drama",
  "description": "A tramp cares for an abandoned boy...",
  "plot_summary": "A destitute tramp discovers an abandoned child...",
  "poster_url": "https://...",
  "actors": "Charlie Chaplin, Jackie Coogan, Edna Purviance",
  "content_type": "film",
  "available": true,
  "is_featured": false,
  "is_masterpiece": false,
  "is_cult": false,
  "created_at": "2025-12-27T00:00:00Z"
}
```

**Error Responses**:
- 404: Content not found

**Example**:
```bash
curl http://localhost:3000/api/content/1
```

---

### 3. Search Content

**GET** `/api/content/search`

**Public**: ✅ Yes

**Description**: Search films and shows by title, director, actor

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` (required) | string | Search query |
| `type` | string | Filter by type (film/tv) |
| `limit` | number | Results per page |

**Success Response (200)**:
```json
{
  "results": [
    {
      "id": 1,
      "title": "The Kid",
      "director": "Charlie Chaplin",
      "rating": 8.3,
      "match_score": 0.95
    }
  ],
  "total": 1,
  "query": "The Kid"
}
```

**Example**:
```bash
curl "http://localhost:3000/api/content/search?q=The%20Kid"
curl "http://localhost:3000/api/content/search?q=Chaplin&type=film"
```

---

### 4. Create Content (Admin)

**POST** `/api/content`

**Public**: ❌ No (requires admin token)

**Description**: Add new film or show to database

**Request Headers**:
```http
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Sunset Boulevard",
  "director": "Billy Wilder",
  "release_year": 1950,
  "runtime_minutes": 110,
  "rating": 8.8,
  "genre": "Drama, Film Noir",
  "description": "A faded film star...",
  "plot_summary": "...",
  "poster_url": "https://...",
  "actors": "Gloria Swanson, William Holden",
  "content_type": "film"
}
```

**Success Response (201)**:
```json
{
  "id": 4,
  "title": "Sunset Boulevard",
  "created_at": "2025-12-28T12:00:00Z"
}
```

**Error Responses**:
- 400: Validation failed
- 401: Unauthorized
- 403: Insufficient permissions

---

### 5. Update Content (Admin)

**PUT** `/api/content/:id`

**Public**: ❌ No (requires admin token)

**Description**: Update existing film or show

**Request Headers**:
```http
Authorization: Bearer {admin_token}
```

**Request Body**:
```json
{
  "rating": 8.5,
  "description": "Updated description..."
}
```

**Success Response (200)**:
```json
{
  "id": 1,
  "title": "The Kid",
  "updated_at": "2025-12-28T12:00:00Z"
}
```

---

### 6. Delete Content (Admin)

**DELETE** `/api/content/:id`

**Public**: ❌ No (requires admin token)

**Description**: Remove film or show from database

**Request Headers**:
```http
Authorization: Bearer {admin_token}
```

**Success Response (204)**:
```
No content
```

---

## User Service Endpoints

Base Path: `/api/users`

### 1. Get User Profile

**GET** `/api/users/profile`

**Public**: ❌ No (requires token)

**Description**: Get authenticated user's profile

**Success Response (200)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-12-01T10:00:00Z",
  "preferences": {
    "language": "en",
    "notifications": true
  }
}
```

---

### 2. Update User Profile

**PUT** `/api/users/profile`

**Public**: ❌ No (requires token)

**Description**: Update user profile information

**Request Body**:
```json
{
  "name": "John Updated",
  "preferences": {
    "language": "en",
    "notifications": false
  }
}
```

**Success Response (200)**:
```json
{
  "id": 1,
  "updated_at": "2025-12-28T12:00:00Z"
}
```

---

### 3. Get Watchlist

**GET** `/api/users/watchlist`

**Public**: ❌ No (requires token)

**Description**: Get user's saved films and shows

**Success Response (200)**:
```json
{
  "items": [
    {
      "id": 1,
      "title": "The Kid",
      "rating": 8.3,
      "saved_at": "2025-12-20T15:30:00Z"
    },
    {
      "id": 3,
      "title": "Metropolis",
      "rating": 8.3,
      "saved_at": "2025-12-25T10:00:00Z"
    }
  ],
  "total": 2
}
```

---

### 4. Add to Watchlist

**POST** `/api/users/watchlist/:content_id`

**Public**: ❌ No (requires token)

**Description**: Save a film or show to watchlist

**URL Parameters**:
- `content_id` (required): ID of content to save

**Success Response (201)**:
```json
{
  "message": "Added to watchlist",
  "content_id": 2,
  "saved_at": "2025-12-28T12:00:00Z"
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/api/users/watchlist/42 \
  -H "Authorization: Bearer $TOKEN"
```

---

### 5. Remove from Watchlist

**DELETE** `/api/users/watchlist/:content_id`

**Public**: ❌ No (requires token)

**Description**: Remove film or show from watchlist

**Success Response (204)**:
```
No content
```

---

### 6. Rate Content

**POST** `/api/users/ratings`

**Public**: ❌ No (requires token)

**Description**: Submit a rating for content

**Request Body**:
```json
{
  "content_id": 1,
  "rating": 8,
  "review": "Excellent film!"
}
```

**Success Response (201)**:
```json
{
  "id": 1,
  "content_id": 1,
  "rating": 8,
  "created_at": "2025-12-28T12:00:00Z"
}
```

---

## Media Service Endpoints

Base Path: `/api/media`

### 1. Get Streaming URL

**GET** `/api/media/:content_id/stream`

**Public**: ❌ No (requires token)

**Description**: Get video streaming URL from CDN

**Success Response (200)**:
```json
{
  "content_id": 1,
  "stream_url": "https://cdn.oldflick.com/video/1/stream.m3u8",
  "cdn_provider": "bunnynet",
  "quality_options": ["720p", "1080p"],
  "duration_seconds": 4080,
  "available": true
}
```

---

### 2. Track Playback

**POST** `/api/media/:content_id/playback`

**Public**: ❌ No (requires token)

**Description**: Record user playback activity

**Request Body**:
```json
{
  "position_seconds": 1200,
  "status": "playing"
}
```

**Success Response (200)**:
```json
{
  "content_id": 1,
  "position": 1200,
  "recorded_at": "2025-12-28T12:00:00Z"
}
```

---

## Payment Service Endpoints

Base Path: `/api/payments`

### 1. Create Checkout Session

**POST** `/api/payments/checkout`

**Public**: ❌ No (requires token)

**Description**: Initiate subscription checkout

**Request Body**:
```json
{
  "price_id": "price_123abc",
  "cancel_url": "http://localhost:5000/subscription"
}
```

**Success Response (200)**:
```json
{
  "session_id": "cs_test_123",
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_123"
}
```

---

### 2. Get Subscription Status

**GET** `/api/payments/status`

**Public**: ❌ No (requires token)

**Description**: Get user's subscription status

**Success Response (200)**:
```json
{
  "subscription_id": "sub_123abc",
  "status": "active",
  "current_period_end": "2026-01-28T12:00:00Z",
  "cancel_at_period_end": false
}
```

---

## Admin Service Endpoints

Base Path: `/api/admin`

### 1. List Users

**GET** `/api/admin/users`

**Public**: ❌ No (requires admin token)

**Description**: Get all users (admin only)

**Success Response (200)**:
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "created_at": "2025-12-01T10:00:00Z"
    }
  ],
  "total": 1
}
```

---

### 2. Update User Role

**PUT** `/api/admin/users/:user_id/role`

**Public**: ❌ No (requires admin token)

**Description**: Change user role

**Request Body**:
```json
{
  "role": "admin"
}
```

**Success Response (200)**:
```json
{
  "user_id": 1,
  "role": "admin",
  "updated_at": "2025-12-28T12:00:00Z"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "statusCode": 400,
    "timestamp": "2025-12-28T12:00:00Z",
    "path": "/api/auth/login"
  }
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error - Internal error |
| 503 | Service Unavailable - Circuit breaker open |

---

## Rate Limiting

**Limit**: 100 requests per minute per IP address

**Headers**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703769600
```

**When Exceeded (429)**:
```json
{
  "error": {
    "message": "Too many requests",
    "statusCode": 429,
    "retryAfter": 45
  }
}
```

---

## Testing Endpoints

### Using curl

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}' \
  | jq -r '.token')

# Use token in requests
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman

1. Create a new request collection
2. Set `Authorization` header to `Bearer {{token}}`
3. Create pre-request script to login and set token
4. Import endpoints from this documentation

### Using REST Client (VS Code)

Create `.vscode/rest.env`:
```
@baseUrl = http://localhost:3000
@token = [token_from_login]
```

---

**Document Type**: API Reference
**Audience**: Frontend Developers, API Consumers
**Last Updated By**: Architecture Refactoring
**Update Frequency**: As endpoints are added/modified
**Related Files**:
- `SERVICES_REFERENCE.md` - Service overview
- `MESSAGE_PROTOCOL.md` - Communication patterns
- `docs/MICROSERVICES_SETUP.md` - Setup guide
