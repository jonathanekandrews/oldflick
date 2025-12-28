# OldFlick - Classic Film Streaming Platform

A modern streaming platform dedicated to classic films and timeless cinema from Hollywood's golden age.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (Neon)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd oldflick
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and service credentials
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend (Vite): http://localhost:5000
   - Backend API: http://localhost:3001

## Project Structure

```
oldflick/
├── docs/                 # Comprehensive documentation
├── config/              # Configuration files (vite, tailwind, etc)
├── scripts/             # Utility scripts (database, deployment)
├── public/              # Static assets
├── src/                 # Frontend (React)
├── server/              # Backend (Node.js/Express)
└── tests/               # Test suites
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed structure information.

## Documentation

- **[SETUP.md](docs/SETUP.md)** - Installation and initial setup
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development workflow and guidelines
- **[API.md](docs/API.md)** - API endpoints and usage
- **[DATABASE.md](docs/DATABASE.md)** - Database schema and migrations
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and patterns

## Tech Stack

### Frontend
- React 18
- Vite (build tool)
- TailwindCSS (styling)
- React Router (navigation)
- React Query (data fetching)
- Shadcn UI (component library)

### Backend
- Node.js with Express
- PostgreSQL (Neon)
- pg (database driver)

### Services
- Stripe (payment processing)
- Bunny.NET (CDN/streaming)

## Available Scripts

```bash
# Development
npm run dev                # Start dev servers (frontend + backend)
npm run dev:server        # Backend only
npm run dev:client        # Frontend only

# Production
npm run build             # Build frontend for production
npm run start             # Start production server

# Database
npm run db:migrate        # Run pending migrations
npm run db:seed          # Seed sample data

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode
```

## Development Workflow

1. Create a new branch for your feature/fix
2. Make changes to frontend/backend code
3. Test locally with `npm run dev`
4. Commit changes with descriptive messages
5. Push to remote and create a pull request

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed guidelines.

## Key Features

- 🎬 Browse classic films by genre and era
- ⭐ Personalized watchlists and ratings
- 📱 Responsive design for all devices
- 🔐 Secure user authentication
- 💳 Stripe payment integration
- 📊 Admin dashboard for content management
- 🎯 Advanced search and filtering

## Architecture Highlights

- **Separation of Concerns**: Frontend (React), Backend (Express), Database (PostgreSQL)
- **Modular Design**: Feature-based organization for scalability
- **API-First**: RESTful API with clear endpoints
- **Type Safety**: JavaScript/React (extensible to TypeScript)
- **Testing Ready**: Test directory structure prepared

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Last Updated**: December 28, 2025
**Version**: 2.0.0 (Architecture Refactor)
