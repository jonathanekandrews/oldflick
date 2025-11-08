# Oldflick - Self-Hosted Streaming Platform

## Overview
Oldflick is a self-hosted classic films and TV streaming platform. The app features a React + Vite frontend with Express.js + PostgreSQL backend, using Supabase for video/image file storage.

**Current Status:** Live at https://oldflick.com with custom domain
**Created:** November 7, 2025
**Migrated to Self-Hosted:** November 8, 2025
**Framework:** React 18.2 + Vite 6.4.1 (Frontend) + Express.js (Backend)
**Package Manager:** npm
**Production URL:** https://oldflick.com

## Project Architecture

### Frontend Stack
- **React 18.2**: UI library
- **Vite 6.4.1**: Build tool and dev server
- **React Router**: Client-side routing
- **TanStack Query**: Server state management
- **Tailwind CSS**: Styling framework
- **Radix UI**: Component library
- **Lucide React**: Icon library
- **Framer Motion**: Animation library

### Backend Stack
- **Express.js**: API server (Port 3000)
- **PostgreSQL**: Database (Neon-hosted)
- **JWT Authentication**: Secure token-based auth
- **Stripe Integration**: Subscription payments
- **Supabase Storage**: Video and image file hosting

### Storage Architecture
- **PostgreSQL**: All content metadata (titles, descriptions, URLs, user data)
- **Supabase**: Video files (.mp4) and images (.jpg, .png) via public URLs
- **Buckets**: 
  - `oldflick-videos` (films)
  - `oldflick-television` (TV shows)

## Configuration for Replit

### Development Server
- **Host:** 0.0.0.0 (required for Replit)
- **Port:** 5000 (required for Replit webview)
- **Allowed Hosts:** true (required for Replit proxy)

### Vite Configuration (`vite.config.js`)
```javascript
server: {
  host: '0.0.0.0',
  port: 5000,
  allowedHosts: true
}
```

### Workflow
- **Name:** dev
- **Command:** npm run dev
- **Type:** webview (frontend application)

### Deployment
- **Type:** autoscale
- **Build:** npm run build
- **Run:** npx vite preview --host 0.0.0.0 --port 5000
- **Custom Domain:** oldflick.com (verified and active)
- **SSL:** Automatically provisioned by Replit

## Project Structure

```
/
├── src/
│   ├── api/                    # Base44 SDK integration
│   │   ├── base44Client.js    # Base44 client configuration
│   │   ├── entities.js        # Content and User entities
│   │   ├── functions.js       # Backend functions (Stripe, etc.)
│   │   └── integrations.js    # Core integrations (LLM, email, files)
│   ├── components/
│   │   ├── admin/             # Admin panel components
│   │   ├── browse/            # Browse page components
│   │   ├── search/            # Search components
│   │   ├── superadmin/        # Super admin components
│   │   └── ui/                # Reusable UI components (Radix)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── pages/                 # Page components/routes
│   │   ├── Account.jsx
│   │   ├── Admin.jsx
│   │   ├── Browse.jsx
│   │   ├── ClassicFilms.jsx
│   │   ├── ClassicTV.jsx
│   │   ├── Layout.jsx
│   │   ├── MyList.jsx
│   │   ├── Pricing.jsx
│   │   ├── Search.jsx
│   │   ├── StripeSetup.jsx
│   │   ├── SuperAdmin.jsx
│   │   ├── VideoTest.jsx
│   │   └── Watch.jsx
│   ├── utils/                 # Utility functions
│   ├── App.jsx                # Root app component
│   └── main.jsx               # Entry point
├── package.json               # Dependencies
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
└── index.html                 # HTML entry point
```

## Key Features

### User Features
- Browse content (films and TV shows)
- Search functionality
- Personal content lists ("My List")
- Content filtering and categorization
- Video playback
- User accounts
- Subscription management (Stripe integration)

### Admin Features
- Content management
- User management
- Bulk content upload
- URL updates
- AI enrichment for content metadata

### Authentication
The app requires Base44 authentication. Users are automatically redirected to the Base44 login page when accessing protected routes.

## Running the Application

### Development
```bash
npm run dev
```
The dev server will start on http://0.0.0.0:5000

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Dependencies

### Core Dependencies
- `@base44/sdk`: Base44 API client
- `react` & `react-dom`: React framework
- `react-router-dom`: Routing
- `@tanstack/react-query`: Data fetching/caching
- `tailwindcss`: Styling
- Multiple `@radix-ui/*` packages: UI components
- `lucide-react`: Icons
- `framer-motion`: Animations
- `zod`: Schema validation
- `react-hook-form`: Form management

## Recent Changes

### Custom Domain Deployment (November 8, 2025)
1. ✅ Added custom domain oldflick.com to Replit deployment
2. ✅ Updated Namecheap DNS records:
   - A Record: @ → 34.111.179.208 (Replit IP)
   - TXT Record: replit-verify=7d4583ad-7b0e-4749-b3ce-4d97247d8d47
3. ✅ Verified oldflick.com in Base44 custom domains (for authentication)
4. ✅ DNS propagation completed successfully
5. ✅ Domain verified in Replit Deployments
6. ✅ SSL certificate automatically provisioned
7. ✅ Site now live at https://oldflick.com

### Replit Environment Setup (November 7, 2025)
1. ✅ Installed Node.js 20 and npm dependencies
2. ✅ Updated `vite.config.js` to bind to 0.0.0.0:5000
3. ✅ Created `.gitignore` for Node.js projects
4. ✅ Fixed missing `@tanstack/react-query` dependency
5. ✅ Added `QueryClientProvider` to `App.jsx`
6. ✅ Fixed import path in `Layout.jsx` for FilterBar component
7. ✅ Configured workflow for Vite dev server
8. ✅ Configured deployment settings

### Code Fixes
- **App.jsx**: Added QueryClientProvider wrapper for React Query
- **Layout.jsx**: Fixed FilterBar import path from relative to absolute (@/components/browse/FilterBar)
- **vite.config.js**: Added host and port configuration for Replit

## Known Considerations

### Base44 Service Integration
The app connects to the Base44 service using app ID `6904bf7c50abb3485eec161d`. If the app shows authentication or 404 errors, this is expected behavior when:
- The Base44 app has been deleted, moved, or reconfigured
- The app subdomain has changed on Base44's side
- Authentication credentials are not available

This is not a Replit environment issue - the Vite dev server is running correctly.

### Stripe Integration
The app includes Stripe payment integration for subscriptions:
- **Status:** ✅ Configured for PRODUCTION (live mode)
- **Live Secret Key:** Configured in Base44 (November 8, 2025)
- **Price ID:** price_1SQaIJFBv1tO0CA82u7bl2EM ($2.99/month)
- **Webhook URL:** https://oldflick.com/api/functions/stripeWebhook
- **Webhook Configuration:** Available at `/StripeSetup` page
- **Required Webhook Events:**
  - checkout.session.completed
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.paid
  - invoice.payment_failed

## User Preferences
None specified yet.

## Notes for Developers
- Always restart the workflow after making configuration changes
- The app uses Base44 SDK for all backend operations
- Authentication is handled by Base44's auth system
- All API calls require authentication
- The build output goes to the `dist/` directory
