# Oldflick - Self-Hosted Streaming Platform

## Overview
Oldflick is a self-hosted classic films and TV streaming platform. The app features a React + Vite frontend with Express.js + PostgreSQL backend, using Supabase for video/image file storage, and Notion integration for content marketing articles.

**Current Status:** ✅ Development server running + Articles feature complete
**Created:** November 7, 2025
**Migrated to Self-Hosted:** November 8, 2025
**Framework:** React 18.2 + Vite 6.4.1 (Frontend) + Express.js (Backend)
**Package Manager:** npm
**Production URL:** https://oldflick.com

## Project Architecture

### Frontend Stack
- **React 18.2**: UI library
- **Vite 6.4.1**: Build tool and dev server (Port 5000)
- **React Router**: Client-side routing
- **TanStack Query**: Server state management with caching (30s TTL)
- **Tailwind CSS**: Styling framework
- **Radix UI**: Component library
- **Lucide React**: Icon library
- **Framer Motion**: Animation library

### Backend Stack
- **Express.js**: API server (Port 3001)
- **PostgreSQL**: Database (Neon-hosted via Replit)
- **JWT Authentication**: Secure token-based auth (7-day expiry)
- **Stripe Integration**: Subscription payments (PRODUCTION mode)
- **Notion Client**: Content marketing via Notion database
- **ES Modules**: All server code uses ES module syntax

### Storage Architecture
- **PostgreSQL**: All content metadata (titles, descriptions, URLs, user data)
- **Supabase**: Video files (.mp4) and images (.jpg, .png) via public URLs
- **Buckets**: 
  - `oldflick-videos` (films)
  - `oldflick-television` (TV shows)
- **Notion Database**: Articles for content marketing (via `@notionhq/client`)

## Configuration for Replit

### Development Server
- **Frontend Host:** 0.0.0.0:5000 (required for Replit webview)
- **Backend Host:** 0.0.0.0:3001 (API server)
- **Allowed Hosts:** true (required for Replit proxy)

### Module System
Both root and server directories have `"type": "module"` in their package.json files to enable ES modules.

### Vite Configuration (`vite.config.js`)
```javascript
server: {
  host: '0.0.0.0',
  port: 5000,
  allowedHosts: true,
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

### Workflow
- **Name:** dev
- **Command:** `node server/index.js & vite --host 0.0.0.0 --port 5000`
- **Type:** webview (frontend application)
- **Port:** 5000

### Deployment
- **Type:** autoscale
- **Build:** npm run build
- **Run:** node server/index.js (serves static files from dist/)
- **Custom Domain:** oldflick.com (verified and active)
- **SSL:** Automatically provisioned by Replit

## Project Structure

```
/
├── server/
│   ├── index.js               # Express server entry (ES modules)
│   ├── package.json           # Server module config (type: module)
│   ├── db/
│   │   └── connection.js      # PostgreSQL pool connection
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   └── routes/
│       ├── auth.js            # Login/register/me endpoints
│       ├── content.js         # Content CRUD endpoints
│       ├── stripe.js          # Stripe checkout/webhook
│       ├── user.js            # User list/watch history
│       └── articles.js        # Notion articles endpoints
├── src/
│   ├── api/
│   │   └── client.js          # API client for frontend
│   ├── components/
│   │   ├── admin/             # Admin panel components
│   │   ├── browse/            # Browse page components
│   │   ├── search/            # Search components
│   │   └── ui/                # Reusable UI components (Radix)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── pages/                 # Page components/routes
│   │   ├── Account.jsx
│   │   ├── Admin.jsx
│   │   ├── Articles.jsx       # NEW: Notion articles page
│   │   ├── Browse.jsx
│   │   ├── ClassicFilms.jsx
│   │   ├── ClassicTV.jsx
│   │   ├── Layout.jsx
│   │   ├── MyList.jsx
│   │   ├── Pricing.jsx
│   │   ├── Search.jsx
│   │   ├── SubTest.jsx
│   │   └── Watch.jsx
│   ├── App.jsx                # Root app component
│   └── main.jsx               # Entry point
├── package.json               # Root dependencies (type: module)
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
└── index.html                 # HTML entry point
```

## Database Schema

### Tables
- **users**: id, email, password_hash, full_name, role, subscription_status, stripe_customer_id, etc.
- **content**: id, title, description, type (movie/tv_show), year, duration, video_url, thumbnail_url, genre[], etc.
- **user_lists**: user_id, content_id, added_date

### Content Types
- `movie`: Classic films
- `tv_show`: Classic TV episodes

## Key Features

### User Features
- Browse content (films and TV shows)
- Search functionality
- Personal content lists ("My List")
- Content filtering and categorization
- Video playback
- User accounts with JWT authentication
- Subscription management (Stripe integration)
- Read articles from Notion database

### Admin Features
- Content management
- User management
- Bulk content upload
- URL updates

### API Endpoints
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user
- `GET /api/content` - List all content (with filters)
- `GET /api/content/:id` - Get single content item
- `POST /api/stripe/create-checkout-session` - Start subscription
- `POST /api/stripe/webhook` - Handle Stripe events
- `GET /api/user/my-list` - Get user's saved list
- `POST /api/user/my-list/:contentId` - Add to list
- `GET /api/articles` - List all published articles from Notion
- `GET /api/articles/:id` - Get single article details

## Running the Application

### Development
```bash
npm run dev
```
Starts both Express server (port 3001) and Vite dev server (port 5000)

### Build
```bash
npm run build
```

### Production
```bash
node server/index.js
```
Serves static files from dist/ and API endpoints

## Recent Changes

### Articles Feature Added (December 9, 2025)
1. ✅ Notion database integration (`@notionhq/client` installed)
2. ✅ Backend API endpoints: GET /api/articles and GET /api/articles/:id
3. ✅ Frontend Articles page with grid UI (src/pages/Articles.jsx)
4. ✅ Navigation links added (Articles button in header)
5. ✅ Environment variables: NOTION_TOKEN, NOTION_DATABASE_ID
6. ✅ Article fields: Title, Excerpt, Author, Published Date, Cover Image, Status

### Import Error Fix (December 9, 2025)
1. ✅ Fixed missing getTimeLeft export in AnonymousTimer.jsx
2. ✅ Restored Notion client imports
3. ✅ Frontend import resolution verified

### ES Modules Migration (December 8, 2025)
1. ✅ Converted all server files from CommonJS to ES modules
2. ✅ Fixed server/package.json to use "type": "module"
3. ✅ Updated workflow to run both servers in parallel
4. ✅ Development server now running successfully

### Custom Domain Deployment (November 8, 2025)
1. ✅ Added custom domain oldflick.com to Replit deployment
2. ✅ Updated Namecheap DNS records
3. ✅ SSL certificate automatically provisioned
4. ✅ Site live at https://oldflick.com

## Stripe Integration
- **Status:** ✅ Configured for PRODUCTION (live mode)
- **Price ID:** price_1SQaIJFBv1tO0CA82u7bl2EM ($2.99/month)
- **Webhook URL:** https://oldflick.com/api/stripe/webhook
- **Required Webhook Events:**
  - checkout.session.completed
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.paid
  - invoice.payment_failed

## Notion Integration
- **Status:** ✅ Configured
- **Environment Variables:**
  - `NOTION_TOKEN`: Integration token (requires Notion workspace permission)
  - `NOTION_DATABASE_ID`: Database containing articles
- **Database Schema (Notion):**
  - Title (rich_text field)
  - Excerpt (rich_text field)
  - Author (rich_text field)
  - Published Date (date field)
  - Cover Image (files field)
  - Status (select field with "Published" option)

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `NOTION_TOKEN`: Notion integration token (for Articles)
- `NOTION_DATABASE_ID`: Notion database ID for articles (for Articles)

## Performance Optimizations
- **API Caching:** TanStack Query with 30-second TTL
- **Retry Logic:** Reduced from 3 to 1 attempt for faster failures
- **State Management:** Efficient React Context + Query integration
- **Static File Serving:** Express serves optimized Vite build in production

## Notes for Developers
- Always restart the workflow after making configuration changes
- The server uses ES modules - use `import/export` syntax
- JWT tokens expire after 7 days
- The build output goes to the `dist/` directory
- In production, Express serves static files from dist/
- Anonymous users get 30 minutes of free preview time
- To re-enable the preview timer: Change `DISABLE_PREVIEW_TIMER = false` in src/components/browse/AnonymousTimer.jsx

