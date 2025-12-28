# OldFlick Directory Architecture Refactor Proposal

## Executive Summary

Current structure is functional but can be optimized for:
- **Scalability**: Better organization for future growth
- **Maintainability**: Clear separation of concerns
- **Discoverability**: Easier for new developers to find files
- **CI/CD**: Better suited for automated testing and deployment
- **Documentation**: Centralized and organized

## Current State Analysis

### Strengths ✅
- Clear frontend/backend separation (src/ vs server/)
- Components organized by feature area
- Modular route structure
- Comprehensive documentation

### Issues ❌
- Root directory cluttered with 50+ files
- Database scripts scattered and duplicated
- Documentation mixed with task tracking
- No clear test directory structure
- No consistent naming conventions
- Types/constants not organized
- Config files at different levels

---

## PROPOSED NEW STRUCTURE

```
oldflick/
│
├── 📂 docs/                              # Consolidated documentation
│   ├── ARCHITECTURE.md                   # System design and patterns
│   ├── API.md                            # API documentation
│   ├── SETUP.md                          # Installation & setup guide
│   ├── DEPLOYMENT.md                     # Production deployment
│   ├── DEVELOPMENT.md                    # Developer guide
│   ├── DATABASE.md                       # Database schema & migration
│   ├── INTEGRATIONS.md                   # Third-party service docs
│   ├── TROUBLESHOOTING.md                # Common issues & solutions
│   ├── CHANGELOG.md                      # Version history
│   └── guides/
│       ├── bunnycdn-setup.md            # CDN setup guide
│       ├── stripe-integration.md        # Payment setup
│       ├── neon-migration.md            # Database migration
│       └── production-checklist.md      # Go-live checklist
│
├── 📂 .github/
│   ├── workflows/
│   │   ├── deploy-production.yml
│   │   ├── deploy-staging.yml           # NEW: staging deployment
│   │   ├── test.yml                     # NEW: run tests on PR
│   │   └── lint.yml                     # NEW: lint on PR
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md               # NEW: bug template
│       └── feature_request.md          # NEW: feature template
│
├── 📂 .husky/                            # Git hooks (unchanged)
│
├── 📂 config/                            # ALL config files centralized
│   ├── vite.config.js                   # (moved from root)
│   ├── postcss.config.js                # (moved from root)
│   ├── tailwind.config.js               # (moved from root)
│   ├── eslint.config.js                 # (moved from root)
│   └── components.json                  # (moved from root)
│
├── 📂 public/                            # Static assets
│   ├── favicon.svg
│   ├── logo.svg
│   └── images/
│       ├── posters/                     # Film poster storage (new)
│       ├── backgrounds/
│       └── icons/
│
├── 📂 scripts/                           # Utility scripts
│   ├── db/                               # Database utilities
│   │   ├── create-schema.js             # (from root)
│   │   ├── seed-data.js                 # (from root - renamed)
│   │   ├── migrate-neon.js              # (from root)
│   │   ├── test-connection.js
│   │   └── validate-schema.js           # (from root - renamed)
│   ├── setup/
│   │   ├── install-deps.sh              # Setup script
│   │   └── init-env.sh                  # NEW: environment setup
│   └── deploy/
│       ├── deploy-prod.sh               # (from root - renamed)
│       ├── deploy-staging.sh            # NEW: staging deployment
│       └── backup-db.sh                 # NEW: database backup
│
├── 📂 src/                               # Frontend code
│   ├── 📂 api/
│   │   ├── client.js
│   │   ├── endpoints.js                 # NEW: API endpoint constants
│   │   ├── hooks/                       # NEW: React Query hooks
│   │   │   ├── useContent.js
│   │   │   ├── useAuth.js
│   │   │   ├── useUser.js
│   │   │   └── useSearch.js
│   │   └── __tests__/                   # NEW: API tests
│   │       └── client.test.js
│   │
│   ├── 📂 components/
│   │   ├── admin/
│   │   │   ├── BulkImport.jsx
│   │   │   ├── ContentForm.jsx
│   │   │   ├── ContentTable.jsx
│   │   │   └── __tests__/               # NEW: Component tests
│   │   │       └── ContentForm.test.jsx
│   │   ├── browse/
│   │   │   ├── ActionBar.jsx
│   │   │   ├── AnonymousTimer.jsx
│   │   │   ├── ContentRow.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   └── __tests__/
│   │   ├── search/
│   │   ├── superadmin/
│   │   ├── layout/                      # NEW: Layout components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── common/                      # NEW: Shared components
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── Modal.jsx
│   │   ├── ui/                          # Shadcn/UI components
│   │   └── __tests__/                   # NEW: Shared component tests
│   │
│   ├── 📂 pages/
│   │   ├── auth/                        # NEW: Group auth pages
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── content/                     # NEW: Content pages
│   │   │   ├── BrowsePage.jsx
│   │   │   ├── ClassicFilmsPage.jsx
│   │   │   ├── ClassicTVPage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   └── WatchPage.jsx
│   │   ├── account/                     # NEW: User pages
│   │   │   ├── AccountPage.jsx
│   │   │   ├── MyListPage.jsx
│   │   │   └── SubscriptionPage.jsx
│   │   ├── admin/                       # NEW: Admin pages
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ContentManagement.jsx
│   │   │   └── SuperAdminPanel.jsx
│   │   ├── legal/                       # NEW: Static pages
│   │   │   ├── PricingPage.jsx
│   │   │   └── ArticlesPage.jsx
│   │   ├── _layout/                     # NEW: Layout wrapper
│   │   │   └── BaseLayout.jsx
│   │   └── HomePage.jsx                 # Root home page
│   │
│   ├── 📂 hooks/                        # Custom React hooks
│   │   ├── use-mobile.jsx
│   │   ├── use-auth.js                  # NEW: Auth logic
│   │   ├── use-user.js                  # NEW: User data
│   │   └── use-theme.js                 # NEW: Theme switching
│   │
│   ├── 📂 utils/
│   │   ├── index.ts
│   │   ├── format.js                    # NEW: Format utilities
│   │   ├── validation.js                # NEW: Form validation
│   │   ├── helpers.js                   # NEW: General helpers
│   │   └── constants.ts                 # NEW: App constants
│   │
│   ├── 📂 types/                        # NEW: TypeScript types
│   │   ├── content.ts
│   │   ├── user.ts
│   │   ├── api.ts
│   │   └── index.ts
│   │
│   ├── 📂 context/                      # NEW: React context
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── UserContext.jsx
│   │
│   ├── 📂 lib/
│   │   └── utils.js
│   │
│   ├── 📂 styles/                       # NEW: Centralized styles
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   ├── variables.css                # NEW: CSS variables
│   │   └── animations.css               # NEW: Animation definitions
│   │
│   ├── 📂 __tests__/                    # NEW: Integration tests
│   │   └── integration.test.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── routes.jsx                       # NEW: Centralized routing
│
├── 📂 server/                            # Backend code
│   ├── 📂 db/
│   │   ├── connection.js
│   │   ├── schema.sql
│   │   ├── migrations/                  # NEW: DB migrations
│   │   │   ├── 001_initial_schema.sql
│   │   │   └── 002_add_fields.sql
│   │   └── seeds/                       # NEW: Seed data
│   │       └── sample-films.sql
│   │
│   ├── 📂 routes/
│   │   ├── auth.js
│   │   ├── content.js
│   │   ├── user.js
│   │   ├── stripe.js
│   │   ├── articles.js
│   │   └── __tests__/                   # NEW: Route tests
│   │       └── content.test.js
│   │
│   ├── 📂 middleware/
│   │   ├── auth.js
│   │   ├── error.js                     # NEW: Error handling
│   │   ├── validation.js                # NEW: Request validation
│   │   ├── cors.js                      # NEW: CORS config
│   │   └── logger.js                    # NEW: Request logging
│   │
│   ├── 📂 controllers/                  # NEW: Business logic
│   │   ├── auth.controller.js
│   │   ├── content.controller.js
│   │   ├── user.controller.js
│   │   └── stripe.controller.js
│   │
│   ├── 📂 services/                     # NEW: Data access layer
│   │   ├── content.service.js
│   │   ├── user.service.js
│   │   ├── auth.service.js
│   │   ├── stripe.service.js
│   │   └── email.service.js             # NEW: Email service
│   │
│   ├── 📂 utils/
│   │   ├── logger.js                    # NEW: Logging utility
│   │   ├── validators.js                # NEW: Validation helpers
│   │   ├── errorHandler.js              # NEW: Error handling
│   │   └── constants.js                 # NEW: Constants
│   │
│   ├── 📂 config/                       # NEW: Server config
│   │   ├── database.js
│   │   ├── stripe.js
│   │   ├── email.js
│   │   └── constants.js
│   │
│   ├── 📂 __tests__/                    # NEW: Server tests
│   │   ├── setup.js
│   │   └── auth.test.js
│   │
│   ├── index.js                         # Express app setup
│   └── package.json
│
├── 📂 tests/                             # NEW: E2E tests
│   ├── setup.js
│   ├── auth.e2e.js
│   ├── content.e2e.js
│   └── fixtures/                        # NEW: Test data
│       └── sample-content.json
│
├── 📂 .env.example                       # NEW: Environment template
│
├── 📂 node_modules/
├── 📂 dist/
│
├── 🔧 Root Configuration Files
│   ├── package.json                     # Updated with scripts
│   ├── package-lock.json
│   ├── index.html
│   ├── .gitignore
│   ├── .gitattributes                   # NEW: Git line endings
│   ├── .env.example                     # NEW: Env template
│   └── .prettierrc                      # NEW: Code formatting
│
└── 📄 Documentation Files (Root)
    ├── README.md                        # Main project README
    ├── CONTRIBUTING.md                  # NEW: Contribution guidelines
    ├── LICENSE                          # NEW: License file
    ├── CODE_OF_CONDUCT.md              # NEW: Code of conduct
    └── SECURITY.md                      # NEW: Security policy
```

---

## Migration Strategy

### Phase 1: Preparation (Low Risk)
1. Create new directory structure
2. Create `.env.example` template
3. Add root-level documentation files (README, CONTRIBUTING, LICENSE)
4. Create empty test directories with `.gitkeep` files

### Phase 2: Config Consolidation (Low Risk)
1. Move all config files to `config/` directory
2. Update import paths in package.json scripts
3. Update build tools to reference new paths
4. Test build and dev server

### Phase 3: Backend Reorganization (Medium Risk)
1. Create `services/` layer for business logic
2. Create `controllers/` for route handlers
3. Move validation and error handling to middleware
4. Create `db/migrations/` for version control
5. Run tests after each move

### Phase 4: Frontend Reorganization (Medium Risk)
1. Create feature-based page groupings
2. Create common components folder
3. Create layout components folder
4. Move context and hooks to dedicated folders
5. Add `types/` folder for TypeScript types
6. Create centralized styles folder

### Phase 5: Documentation (Low Risk)
1. Move existing docs to `docs/` folder
2. Create migration guides
3. Update README with new structure
4. Archive old task files to `docs/archive/`

### Phase 6: Scripts & Utilities (Low Risk)
1. Create `scripts/` folder structure
2. Move database scripts
3. Create deployment scripts
4. Add setup automation scripts

---

## Benefits by Aspect

### 🎯 Scalability
- **Feature-based organization** makes it easy to add new features
- **Services layer** enables business logic reuse
- **Controllers** separate route handling from business logic
- **Hooks folder** centralizes React state management

### 🧹 Maintainability
- **Clear separation of concerns** (routes → controllers → services → DB)
- **Centralized configuration** reduces configuration sprawl
- **Consistent naming** makes code discoverable
- **Tests colocated** with components/features

### 📚 Discoverability
- **Feature folders** group related code together
- **Page grouping** reflects application routes
- **Common components** clearly separated from feature components
- **Types folder** for type definitions

### 🚀 CI/CD Ready
- **Tests folder** enables automated testing
- **Scripts folder** supports build automation
- **Migrations folder** enables database versioning
- **GitHub workflows** directory for automation

### 📖 Documentation
- **Centralized docs** folder with organized guides
- **Architecture documentation** for new developers
- **Contributing guidelines** for open source
- **Deployment procedures** codified

---

## File Migration Checklist

### Root Directory Cleanup
- [ ] Create `config/` directory
- [ ] Move `vite.config.js` → `config/`
- [ ] Move `tailwind.config.js` → `config/`
- [ ] Move `postcss.config.js` → `config/`
- [ ] Move `eslint.config.js` → `config/`
- [ ] Move `components.json` → `config/`
- [ ] Archive `old-flick-*.zip` → `docs/archive/`
- [ ] Archive task files → `docs/archive/tasks/`
- [ ] Move `tv-shows-data.csv` → `docs/reference-data/`
- [ ] Delete `attached_assets/` (if no longer needed)

### Documentation Consolidation
- [ ] Create `docs/` folder structure
- [ ] Move `FINAL_REVIEW.md` → `docs/`
- [ ] Move `MIGRATION_COMPLETE.md` → `docs/`
- [ ] Move `BUNNYCDN_UPLOAD_GUIDE.md` → `docs/guides/`
- [ ] Move `DEPLOYMENT-SOP.md` → `docs/guides/`
- [ ] Create new consolidated documentation

### Backend Reorganization
- [ ] Create `server/services/` folder
- [ ] Create `server/controllers/` folder
- [ ] Create `server/db/migrations/` folder
- [ ] Create `server/db/seeds/` folder
- [ ] Create `server/config/` folder
- [ ] Create `server/__tests__/` folder
- [ ] Move scripts to `scripts/db/`

### Frontend Reorganization
- [ ] Reorganize `src/pages/` by feature
- [ ] Create `src/components/common/`
- [ ] Create `src/components/layout/`
- [ ] Create `src/context/` folder
- [ ] Create `src/types/` folder
- [ ] Create `src/styles/` folder
- [ ] Create `src/__tests__/` folder

### Testing Infrastructure
- [ ] Create `tests/` folder for E2E tests
- [ ] Create `tests/fixtures/` for test data
- [ ] Add test setup files

---

## Update package.json Scripts

```json
{
  "scripts": {
    "dev": "concurrently -k \"npm run server\" \"npm run client\"",
    "server": "node server/index.js",
    "client": "vite --config config/vite.config.js",
    "build": "vite build --config config/vite.config.js",
    "preview": "vite preview --config config/vite.config.js",
    "lint": "eslint --config config/eslint.config.js src server",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:migrate": "node scripts/db/migrate-neon.js",
    "db:seed": "node scripts/db/seed-data.js",
    "db:test": "node scripts/db/test-connection.js",
    "db:backup": "bash scripts/deploy/backup-db.sh",
    "setup": "bash scripts/setup/install-deps.sh",
    "deploy:staging": "bash scripts/deploy/deploy-staging.sh",
    "deploy:prod": "bash scripts/deploy/deploy-prod.sh"
  }
}
```

---

## File Naming Conventions

### Frontend Components
- Use PascalCase: `ComponentName.jsx`
- Hooks: `useHookName.js`
- Tests: `ComponentName.test.jsx`

### Backend
- Controllers: `feature.controller.js`
- Services: `feature.service.js`
- Routes: `feature.js`
- Utilities: `utility-name.js`

### Configuration
- Config files: `lowercase-name.config.js`
- Constants: `constants.js` or `CONSTANTS.js`

### Database
- Migrations: `001_description.sql` (numbered sequences)
- Seeds: `seed-feature-name.sql`

---

## Implementation Notes

1. **Use git mv** for file moves to preserve history
2. **Update all imports** after moving files
3. **Test at each phase** before moving to the next
4. **Keep git commits small** during refactoring
5. **Update CI/CD paths** in `.github/workflows/`
6. **Update deployment scripts** with new paths

---

## Rollback Plan

If issues occur:
1. Git history preserved for all moves
2. Easy to revert using `git revert`
3. Create feature branch before major changes
4. Test all scripts before committing

---

## Summary of Benefits

| Aspect | Current | Proposed |
|--------|---------|----------|
| **Root files** | 50+ scattered | 5-10 organized |
| **Config files** | Root level | Centralized in `config/` |
| **Documentation** | Mixed with tasks | Organized in `docs/` |
| **Tests** | None structured | Organized in `tests/` and `__tests__/` |
| **Backend organization** | Routes only | Routes → Controllers → Services |
| **Frontend pages** | Flat list | Feature-grouped folders |
| **Type definitions** | None | Centralized in `types/` |
| **Database migrations** | Scripts in root | Versioned in `db/migrations/` |
| **Scalability** | Limited | Highly scalable |

This refactoring supports growth from current 3 films to thousands, from single developer to team, and from MVP to production-ready application.
