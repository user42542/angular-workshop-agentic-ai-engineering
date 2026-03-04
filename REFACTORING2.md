# Refactoring Guidelines

## Error Handling

### Global Error Handler
- Errors should be handled by a global error handler (`ErrorHandler`)
- When an error occurs a `Snackbar` should be displayed for 5 seconds
- Do not use console.error in components - let the global handler manage it
- Provide user-friendly error messages

**Implementation:**
```typescript
// Global error handler in app.config.ts
providers: [
  { provide: ErrorHandler, useClass: GlobalErrorHandler }
]

// GlobalErrorHandler implementation
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private snackbar: MatSnackBar) {}

  handleError(error: Error): void {
    this.snackbar.open(error.message, 'Close', { duration: 5000 });
  }
}
```

**Benefits:**
- Centralized error handling
- Consistent UX for error messages
- Easier to test and maintain
- No error handling boilerplate in components

---

## Extract Inline SVGs

### SVG Component Pattern
- Inline SVGs should live in own Components to have the possibility to lazy load them
- Create reusable SVG components in `shared/icons/` directory
- Use `@defer` for lazy loading SVG components when appropriate
- Reduces component template complexity

**Before:**
```typescript
template: `
  <button>
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
    Search
  </button>
`
```

**After:**
```typescript
// shared/icons/search-icon.component.ts
@Component({
  selector: 'app-search-icon',
  standalone: true,
  template: `
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
  `
})
export class SearchIconComponent {}

// Usage in component
template: `
  <button>
    @defer (on viewport) {
      <app-search-icon />
    }
    Search
  </button>
`
```

**Benefits:**
- Reusable across multiple components
- Lazy loading with `@defer`
- Easier to maintain and update icons
- Cleaner component templates
- Better testability

---

## Back to Start Link

### Reusable Navigation Component
- The link to the Start should live in its own component to be reused
- Place in `shared/components/back-to-home.component.ts`
- Makes it easy to maintain and reuse across multiple pages
- Consistent navigation UX

**Implementation:**
```typescript
// shared/components/back-to-home.component.ts
@Component({
  selector: 'app-back-to-home',
  standalone: true,
  imports: [RouterModule],
  template: `
    <a routerLink="/" class="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
      Back to Home
    </a>
  `
})
export class BackToHomeComponent {}

// Usage in any component
template: `
  <div class="container">
    <app-back-to-home />
    <!-- rest of content -->
  </div>
`
```

**Benefits:**
- Single source of truth for navigation
- Consistent styling and behavior
- Easy to update across entire app
- Improves maintainability

---

## Constructor Best Practices

### Avoid Side Effects in Constructor
- **Do NOT subscribe in `constructor`**
- Use `afterNextRender` hook for subscriptions that need DOM access
- Use `ngOnInit` for standard initialization logic
- Constructor should only be used for dependency injection

**Anti-Pattern (❌ DON'T):**
```typescript
constructor(private api: BookApiClient) {
  // ❌ Side effects in constructor
  this.api.getBooks().subscribe(books => this.books = books);
}
```

**Correct Pattern (✅ DO):**
```typescript
constructor(private api: BookApiClient) {
  // ✅ Only dependency injection
}

ngOnInit(): void {
  // ✅ Initialize in lifecycle hook
  this.loadBooks();
}

// For DOM-related subscriptions
constructor() {
  afterNextRender(() => {
    // ✅ DOM operations after render
    this.focusSearchInput();
  });
}
```

**Why?**
- Constructor runs before component initialization
- DOM is not yet available in constructor
- Lifecycle hooks provide better control
- Easier to test and reason about
- Follows Angular best practices

---

## Reactive Composition

### Declarative Reactive Pipelines
- Use reactive composition instead of manual imperative methods
- Refactor to a single reactive pipeline using RxJS operators
- Avoid imperative state resets spread across multiple methods
- Single source of truth with declarative streams

**Before (Imperative ❌):**
```typescript
export class BookDetailComponent {
  book = signal<Book | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private api: BookApiClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadBook(id);
      }
    });
  }

  loadBook(id: string): void {
    this.book.set(null);
    this.error.set(null);
    this.loading.set(true);

    this.api.getBook(id).subscribe({
      next: book => {
        this.book.set(book);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}
```

**After (Reactive ✅):**
```typescript
export class BookDetailComponent {
  private destroy$ = new Subject<void>();

  // Single reactive pipeline
  book$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    filter(id => !!id),
    tap(() => this.loading.set(true)),
    switchMap(id =>
      this.api.getBook(id!).pipe(
        tap(book => {
          this.book.set(book);
          this.loading.set(false);
          this.error.set(null);
        }),
        catchError(err => {
          this.error.set(err.message);
          this.loading.set(false);
          return of(null);
        })
      )
    ),
    takeUntil(this.destroy$)
  );

  book = signal<Book | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private api: BookApiClient
  ) {
    // Subscribe once
    this.book$.subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Even Better (Template with Async Pipe):**
```typescript
export class BookDetailComponent {
  // Pure reactive stream - no manual subscriptions
  bookState$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    filter(id => !!id),
    switchMap(id =>
      this.api.getBook(id!).pipe(
        map(book => ({ book, loading: false, error: null })),
        startWith({ book: null, loading: true, error: null }),
        catchError(err =>
          of({ book: null, loading: false, error: err.message })
        )
      )
    )
  );

  constructor(
    private route: ActivatedRoute,
    private api: BookApiClient
  ) {}
}

// Template
template: `
  @if (bookState$ | async; as state) {
    @if (state.loading) {
      <div>Loading...</div>
    } @else if (state.error) {
      <div>Error: {{ state.error }}</div>
    } @else if (state.book) {
      <div>{{ state.book.title }}</div>
    }
  }
`
```

**Benefits:**
- ✅ Declarative and easier to reason about
- ✅ Automatic cleanup with proper operators
- ✅ Reduced imperative state management
- ✅ Better testability
- ✅ Single source of truth
- ✅ No manual unsubscribe needed (with async pipe)
- ✅ Prevents memory leaks
- ✅ Handles race conditions automatically (switchMap)

**Key RxJS Operators:**
- `map()` - Transform values
- `filter()` - Filter out unwanted values
- `switchMap()` - Cancel previous requests, handle only latest
- `catchError()` - Error handling
- `tap()` - Side effects without changing stream
- `startWith()` - Initial value
- `takeUntil()` - Cleanup subscription

---

## Migration Checklist

When refactoring existing code, follow this checklist:

### ✅ Error Handling
- [ ] Remove try/catch blocks from components
- [ ] Implement GlobalErrorHandler
- [ ] Replace console.error with global handler
- [ ] Add Snackbar service for user feedback

### ✅ SVG Extraction
- [ ] Identify inline SVGs in templates
- [ ] Create icon components in `shared/icons/`
- [ ] Replace inline SVGs with components
- [ ] Add `@defer` for lazy loading where appropriate

### ✅ Navigation Components
- [ ] Extract repeated navigation elements
- [ ] Create reusable components in `shared/components/`
- [ ] Replace duplicated code with component

### ✅ Constructor Cleanup
- [ ] Move subscriptions from constructor to lifecycle hooks
- [ ] Use `ngOnInit` for standard initialization
- [ ] Use `afterNextRender` for DOM operations
- [ ] Keep constructor for DI only

### ✅ Reactive Composition
- [ ] Identify imperative state management
- [ ] Create reactive pipelines with RxJS operators
- [ ] Replace manual subscriptions with async pipe
- [ ] Add proper cleanup (takeUntil or async pipe)
- [ ] Remove manual state resets

---

## Testing Refactored Code

### Global Error Handler
```typescript
describe('GlobalErrorHandler', () => {
  it('should display error in snackbar', () => {
    const snackbar = jasmine.createSpyObj('MatSnackBar', ['open']);
    const handler = new GlobalErrorHandler(snackbar);

    handler.handleError(new Error('Test error'));

    expect(snackbar.open).toHaveBeenCalledWith('Test error', 'Close', { duration: 5000 });
  });
});
```

### Reactive Composition
```typescript
describe('BookDetailComponent', () => {
  it('should load book from route params', (done) => {
    const mockBook = { id: '1', title: 'Test' };
    const route = { paramMap: of(new Map([['id', '1']])) };
    const api = { getBook: () => of(mockBook) };

    component.bookState$.subscribe(state => {
      expect(state.book).toEqual(mockBook);
      done();
    });
  });
});
```
