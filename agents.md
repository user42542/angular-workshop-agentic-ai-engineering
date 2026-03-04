# AGENTS.md - Angular Workshop Project

## Project overview
This is a modern Angular 20 application demonstrating enterprise-level best practices and architectural patterns. The project uses:
- **Angular 20.2.1** with Standalone Components (no NgModules)
- **TypeScript 5.9.2** for type-safe development
- **RxJS 7.8.0** for reactive programming
- **@ngrx/signals 20.0.1** for signal-based state management
- **@tanstack/angular-query-experimental** for server state management
- **Angular Material 20.2.0** and **Tailwind CSS 4.1.12** for UI/styling
- **Playwright 1.55.0** for E2E testing
- **ESBuild-based build system** (3-5x faster than Webpack)

### Architecture Principles
- **Standalone Components First**: All components use the standalone pattern (no NgModules)
- **Feature-based structure**: Organized by business features (e.g., `src/app/books/`)
- **Smart & Dumb Components**: Clear separation between container (smart) and presentational (dumb) components
- **Tree-shakeable Providers**: Services use `providedIn: 'root'` for optimal bundle size
- **Reactive Programming**: RxJS Observables with async pipes and proper unsubscription

### Project Structure
```
src/app/
├── app.ts                          # Root Component (Standalone)
├── app.config.ts                   # Application Configuration
├── app.routes.ts                   # Routing Configuration
├── books/                          # Feature: Books
│   ├── book-list.component.ts     # Smart Component
│   ├── book-item.component.ts     # Dumb Component
│   ├── book-api-client.service.ts # Data Service
│   └── book.ts                     # Domain Model
└── shared/                         # Shared Utilities
    └── toast.service.ts           # Shared Service
```

## Build and test commands

### Development
```bash
npm start                # Start dev server with HMR on http://localhost:4200
npm run build           # Production build with optimizations
npm run watch           # Build in watch mode
```

### Testing
```bash
npm run test           # Run Jest unit tests
npm run test:watch     # Run Jest in watch mode
npm run test:coverage  # Run tests with coverage report
```

### Code Quality
```bash
npm run format.check   # Check code formatting (Prettier)
npm run format.write   # Auto-format code with Prettier
```

### Server-Side Rendering
```bash
npm run serve:ssr:angular-workshop-agentic-ai-engineering  # Run with SSR
```

## Code style guidelines

### Component Guidelines
1. **Use Standalone Components only** - No NgModules
2. **Use Modern Template Syntax (Angular 17+)**:
   - Use `@for` instead of `*ngFor`
   - Use `@if` instead of `*ngIf`
   - Use `@switch` instead of `*ngSwitch`
   - Use `@defer` for lazy loading template blocks
3. **Smart vs Dumb Components**:
   - **Smart Components**: Manage state, inject services, handle business logic
   - **Dumb Components**: Pure presentation, only @Input/@Output, no service injection
4. **Naming Convention**:
   - Components: `*.component.ts` (e.g., `book-list.component.ts`)
   - Services: `*.service.ts` (e.g., `book-api-client.service.ts`)
   - Models: `*.ts` (e.g., `book.ts`)

### TypeScript Best Practices
- Use strict type checking (enabled in tsconfig)
- Always type API responses with interfaces
- Avoid `any` type
- Use readonly for immutable properties

### RxJS Patterns
- Use `async` pipe in templates (automatic subscription management)
- Implement debouncing for search inputs (300ms delay)
- Use `takeUntil` pattern for manual unsubscriptions
- Return `Observable` from services, not Promises

### Styling with Tailwind CSS
- Use utility classes directly in templates
- Follow responsive design patterns: `sm:`, `md:`, `lg:`, `xl:` breakpoints
- Maintain consistent spacing with Tailwind's spacing scale
- Use Tailwind's color system for consistency

### Service Guidelines
- Use `@Injectable({ providedIn: 'root' })` for global services
- Create feature-specific API client services
- Use HttpParams for query parameters
- Implement proper error handling

### Performance Best Practices
- Use `track` functions in `@for` loops (new control flow syntax in Angular 17+)
- Implement lazy loading for routes (when scaling)
- Use OnPush change detection for dumb components
- Debounce user input (e.g., search with 300ms delay)

### Code Formatting
- Use Prettier for consistent formatting
- Run `npm run format.write` before committing
- Follow Angular Style Guide conventions

## Testing instructions

### Unit Testing with Jest
- Unit tests are configured with Jest
- Test files should follow the naming convention: `*.spec.ts`
- Place test files next to the code they test (co-located)
- Run tests with `npm run test`
- Use watch mode during development: `npm run test:watch`
- Generate coverage reports: `npm run test:coverage`

### Testing Best Practices
- **Unit Tests**: Focus on services, utilities, and component logic (high coverage)
- **Component Tests**: Test component behavior, inputs/outputs, and rendering
- **Service Tests**: Mock HttpClient and test business logic
- **Dumb Components**: Easy to test (no mocks needed, just test inputs/outputs)
- Always add/update tests when changing code
- Aim for at least 80% code coverage

### What to Test
- **Service methods**: Business logic, data transformations, API calls (mocked)
- **Component logic**: Event handlers, computed properties, state changes
- **Component rendering**: Correct DOM output based on inputs
- **Pipes and utilities**: Pure functions and transformations
- **Error handling**: Edge cases and error states

### Jest Testing Patterns for Angular

**Testing a Service:**
```typescript
describe('BookApiClient', () => {
  let service: BookApiClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookApiClient]
    });
    service = TestBed.inject(BookApiClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch books', () => {
    const mockBooks = [{ id: '1', title: 'Test Book' }];
    service.getBooks().subscribe(books => {
      expect(books).toEqual(mockBooks);
    });
    const req = httpMock.expectOne('http://localhost:4730/books');
    req.flush(mockBooks);
  });
});
```

**Testing a Component:**
```typescript
describe('BookItemComponent', () => {
  let component: BookItemComponent;
  let fixture: ComponentFixture<BookItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BookItemComponent]  // Standalone component
    });
    fixture = TestBed.createComponent(BookItemComponent);
    component = fixture.componentInstance;
  });

  it('should display book title', () => {
    component.book = { id: '1', title: 'Test Book', author: 'Author' };
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h3').textContent).toContain('Test Book');
  });
});
```

### Test Coverage Goals
- Overall coverage: 80%+
- Services: 90%+ (business logic should be well-tested)
- Components: 70%+ (focus on logic, not trivial rendering)
- Utilities/Pipes: 100% (pure functions are easy to test)

## Security considerations

### General Security Practices
- **No hardcoded secrets**: Never commit API keys, passwords, or tokens
- **Environment variables**: Use environment files for configuration (not committed)
- **HTTP Security**: Always use HTTPS in production
- **CORS**: Configure proper CORS policies on backend

### Angular-Specific Security
- **Built-in XSS Protection**: Angular sanitizes values automatically
- **Avoid `bypassSecurityTrust*`**: Only use when absolutely necessary and with validated input
- **HttpClient**: Automatically handles CSRF protection with HttpClient
- **Router Guards**: Implement authentication guards for protected routes
- **Dependency Security**: Regularly update dependencies (`npm audit`)

### Authentication & Authorization
- Store tokens securely (HttpOnly cookies preferred over localStorage)
- Implement proper session management
- Use Angular Guards for route protection
- Validate permissions on both frontend and backend

### API Security
- Validate all user inputs
- Use typed interfaces for API responses
- Implement proper error handling (don't expose sensitive info)
- Rate limiting on backend APIs

### Best Practices
- Keep Angular and dependencies up to date
- Use Angular's security features (don't bypass them)
- Implement Content Security Policy (CSP) headers
- Regular security audits with `npm audit`
- Never trust client-side validation alone
