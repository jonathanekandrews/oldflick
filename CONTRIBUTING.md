# Contributing to OldFlick

We love your contributions! Please follow this guide to make the process smooth.

## Code of Conduct

- Be respectful to all contributors
- Focus on the code, not the person
- Provide constructive feedback
- Help others learn and grow

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes** following the code standards below
5. **Test thoroughly** before committing
6. **Commit with clear messages**: `git commit -m "Add feature: description"`
7. **Push to your fork**: `git push origin feature/your-feature-name`
8. **Create a Pull Request** on GitHub

## Code Standards

### Frontend (React/JavaScript)

- Use functional components with hooks
- Keep components focused and single-responsibility
- Use descriptive variable and function names
- Follow the existing file structure
- Add comments for complex logic
- Use React Query for data fetching
- Handle errors gracefully with user feedback

### Backend (Node.js/Express)

- Use async/await for asynchronous operations
- Implement proper error handling middleware
- Validate all user inputs
- Use environment variables for configuration
- Keep routes focused (use services for business logic)
- Write meaningful error messages
- Log important operations

### CSS/Styling

- Use TailwindCSS utility classes
- Organize styles by component
- Follow BEM naming for custom CSS
- Ensure responsive design (mobile-first)
- Test on multiple screen sizes

### Database

- Write migrations for schema changes
- Use meaningful column names
- Add indexes for frequently queried columns
- Document complex queries
- Test migrations before committing

## Commit Message Guidelines

- Use present tense: "Add feature" not "Added feature"
- Capitalize the first letter
- Limit subject to 50 characters
- Separate subject from body with a blank line
- Wrap body at 72 characters
- Reference issues when applicable: "Fix #123"

**Examples:**
```
Add user watchlist functionality

Allows users to save films they want to watch later.
Persists list in database and syncs across devices.

Fix #456
```

## Testing

Before submitting a PR:

- [ ] Code runs locally without errors
- [ ] All existing functionality still works
- [ ] No console warnings or errors
- [ ] Tested on mobile and desktop
- [ ] API responses are correct (if backend changes)
- [ ] Database operations are safe (if DB changes)

## Pull Request Process

1. Update documentation if needed
2. Add a clear PR title and description
3. Link related issues
4. Expect feedback and be open to suggestions
5. Make requested changes in new commits
6. Once approved, your PR will be merged

## Code Review Checklist

For reviewers:

- [ ] Code follows project standards
- [ ] Changes solve the stated problem
- [ ] No unnecessary complexity added
- [ ] Tests pass
- [ ] No obvious bugs or security issues
- [ ] Comments are clear and helpful
- [ ] Documentation is updated if needed

## Development Workflow

### Running the Application

```bash
# Start both frontend and backend
npm run dev

# Or separately:
npm run dev:server    # Backend only
npm run dev:client    # Frontend only
```

### Database Changes

```bash
# Create a new migration
npm run db:create-migration "add_new_table"

# Run migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback
```

### Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Common Issues

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3001   # Windows
```

### Database Connection Error
- Check DATABASE_URL in .env
- Verify database is running
- Test connection: `npm run db:test-connection`

### Vite Hot Reload Not Working
- Clear `.vite` cache
- Restart dev server
- Check file permissions

## Questions?

- Check existing issues and PRs
- Review project documentation in `/docs`
- Ask in GitHub discussions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping improve OldFlick! 🎬
