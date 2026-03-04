# Skills - Angular Workshop Project

This document describes specific skills, patterns, and techniques used in this Angular 20 project.

## Table of Contents
- [Modern Angular Patterns](#modern-angular-patterns)
- [Component Architecture](#component-architecture)
- [Reactive Programming](#reactive-programming)
- [State Management](#state-management)
- [Styling Patterns](#styling-patterns)
- [Performance Techniques](#performance-techniques)
- [Testing Strategies](#testing-strategies)

---

## Modern Angular Patterns

### Standalone Components (Angular 15+)
Components are self-contained without NgModules.

```typescript
@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BookItemComponent],
  templateUrl: './book-list.component.html'
})
export class BookListComponent {}
```

**Benefits:**
- Better tree-shaking
- Simplified dependency management
- Easier testing

### New Control Flow Syntax (Angular 17+)
Modern template syntax replaces structural directives.

```typescript
// Old way
<div *ngIf="loading">Loading...</div>
<div *ngFor="let item of items; trackBy: trackById">{{ item }}</div>

// New way
@if (loading) {
  <div>Loading...</div>
}

@for (item of items; track item.id) {
  <div>{{ item }}</div>
}
```

### Deferrable Views (Angular 17+)
Lazy load template parts for better performance.

```typescript
@defer (on viewport) {
  <app-heavy-component />
} @placeholder {
  <div>Loading...</div>
} @loading (minimum 2s) {
  <app-spinner />
} @error {
  <div>Failed to load</div>
}
```

---

## Component Architecture

### Smart vs Dumb Components

**Smart Component (Container):**
```typescript
@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [BookItemComponent]
})
export class BookListComponent implements OnInit {
  books: Book[] = [];

  constructor(private api: BookApiClient) {}

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.api.getBooks().subscribe(books => this.books = books);
  }
}
```

**Dumb Component (Presentational):**
```typescript
@Component({
  selector: 'app-book-item',
  standalone: true
})
export class BookItemComponent {
  @Input() book!: Book;
  @Output() bookSelected = new EventEmitter<Book>();
}
```

### Component Communication Patterns

**Parent to Child (Input):**
```typescript
// Parent
<app-book-item [book]="selectedBook" />

// Child
@Input() book!: Book;
```

**Child to Parent (Output):**
```typescript
// Child
@Output() delete = new EventEmitter<string>();

deleteBook() {
  this.delete.emit(this.book.id);
}

// Parent
<app-book-item (delete)="onDelete($event)" />
```

**Service-based Communication:**
```typescript
@Injectable({ providedIn: 'root' })
export class BookService {
  private selectedBook$ = new BehaviorSubject<Book | null>(null);

  selectBook(book: Book) {
    this.selectedBook$.next(book);
  }

  getSelectedBook(): Observable<Book | null> {
    return this.selectedBook$.asObservable();
  }
}
```

---

## Reactive Programming

### RxJS Operators Mastery

**Transformation:**
```typescript
books$ = this.api.getBooks().pipe(
  map(books => books.filter(b => b.price > 10)),
  map(books => books.sort((a, b) => a.title.localeCompare(b.title)))
);
```

**Combining Streams:**
```typescript
combinedData$ = combineLatest([
  this.route.params,
  this.userService.currentUser$
]).pipe(
  map(([params, user]) => ({ bookId: params['id'], user }))
);
```

**Error Handling:**
```typescript
book$ = this.api.getBook(id).pipe(
  catchError(err => {
    console.error('Error:', err);
    return of(null);
  }),
  retry(3)
);
```

**Debouncing User Input:**
```typescript
searchTerm$ = new Subject<string>();

filteredBooks$ = this.searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.api.search(term))
);
```

### Reactive Composition Pattern

**Imperative (❌):**
```typescript
loadBook(id: string) {
  this.loading = true;
  this.api.getBook(id).subscribe({
    next: book => {
      this.book = book;
      this.loading = false;
    },
    error: err => {
      this.error = err;
      this.loading = false;
    }
  });
}
```

**Reactive (✅):**
```typescript
book$ = this.route.paramMap.pipe(
  map(params => params.get('id')),
  filter(id => !!id),
  switchMap(id => this.api.getBook(id!).pipe(
    catchError(err => of(null))
  ))
);

// Use with async pipe in template
<div>{{ book$ | async }}</div>
```

---

## State Management

### Signal-based State (Angular 16+)

```typescript
export class BookComponent {
  // Writable signal
  books = signal<Book[]>([]);
  loading = signal(false);

  // Computed signal
  bookCount = computed(() => this.books().length);

  addBook(book: Book) {
    this.books.update(books => [...books, book]);
  }
}
```

### Signal Store (@ngrx/signals)

```typescript
export const BookStore = signalStore(
  { providedIn: 'root' },
  withState({
    books: [] as Book[],
    loading: false,
    filter: ''
  }),
  withComputed(({ books, filter }) => ({
    filteredBooks: computed(() =>
      books().filter(b => b.title.includes(filter()))
    )
  })),
  withMethods((store) => ({
    loadBooks: async () => {
      patchState(store, { loading: true });
      const books = await fetch('/api/books').then(r => r.json());
      patchState(store, { books, loading: false });
    }
  }))
);
```

---

## Styling Patterns

### Tailwind CSS Utility-First

```html
<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-blue-700 mb-4">Title</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Grid items -->
  </div>
</div>
```

### Responsive Design Breakpoints

```html
<!-- Mobile first approach -->
<div class="
  w-full           <!-- Mobile: full width -->
  sm:w-1/2         <!-- Small: 50% width -->
  md:w-1/3         <!-- Medium: 33% width -->
  lg:w-1/4         <!-- Large: 25% width -->
  xl:w-1/5         <!-- XL: 20% width -->
">
  Content
</div>
```

### Animations with Tailwind

```html
<div class="
  transition-all duration-300
  hover:scale-105 hover:shadow-xl
  transform
">
  Card with hover effect
</div>

<div class="animate-spin">Loading spinner</div>
<div class="animate-pulse">Loading skeleton</div>
```

---

## Performance Techniques

### Track Functions for Lists

```typescript
// Old way
<div *ngFor="let book of books; trackBy: trackById">

// New way
@for (book of books; track book.id) {
  <app-book-item [book]="book" />
}

// TrackBy function (if using old syntax)
trackById(index: number, book: Book): string {
  return book.id;
}
```

### OnPush Change Detection

```typescript
@Component({
  selector: 'app-book-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class BookItemComponent {
  @Input() book!: Book;
}
```

### Lazy Loading Routes

```typescript
export const routes: Routes = [
  {
    path: 'books',
    loadComponent: () => import('./books/book-list.component')
      .then(m => m.BookListComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes')
      .then(m => m.ADMIN_ROUTES)
  }
];
```

### Virtual Scrolling (CDK)

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  imports: [ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="h-screen">
      @for (item of items; track item.id) {
        <div class="h-[50px]">{{ item.name }}</div>
      }
    </cdk-virtual-scroll-viewport>
  `
})
```

---

## Testing Strategies

### Service Testing

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
    const mockBooks = [{ id: '1', title: 'Test' }];

    service.getBooks().subscribe(books => {
      expect(books).toEqual(mockBooks);
    });

    const req = httpMock.expectOne('/api/books');
    expect(req.request.method).toBe('GET');
    req.flush(mockBooks);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

### Component Testing

```typescript
describe('BookItemComponent', () => {
  let component: BookItemComponent;
  let fixture: ComponentFixture<BookItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BookItemComponent]
    });
    fixture = TestBed.createComponent(BookItemComponent);
    component = fixture.componentInstance;
  });

  it('should display book title', () => {
    component.book = { id: '1', title: 'Test Book', author: 'Author' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('h3');
    expect(title.textContent).toContain('Test Book');
  });

  it('should emit delete event', () => {
    spyOn(component.delete, 'emit');
    component.onDelete();
    expect(component.delete.emit).toHaveBeenCalledWith('1');
  });
});
```

### Observable Testing

```typescript
it('should filter books reactively', (done) => {
  const mockBooks = [
    { id: '1', title: 'Angular Guide' },
    { id: '2', title: 'React Guide' }
  ];

  component.books$ = of(mockBooks).pipe(
    map(books => books.filter(b => b.title.includes('Angular')))
  );

  component.books$.subscribe(filtered => {
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Angular Guide');
    done();
  });
});
```

### Testing with Signals

```typescript
it('should update signal value', () => {
  const store = TestBed.inject(BookStore);

  store.addBook({ id: '1', title: 'New Book' });

  expect(store.books().length).toBe(1);
  expect(store.bookCount()).toBe(1);
});
```

---

## Advanced Skills

### Custom Directives

```typescript
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() appHighlight = 'yellow';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = this.appHighlight;
  }
}
```

### Custom Pipes

```typescript
@Pipe({
  name: 'excerpt',
  standalone: true
})
export class ExcerptPipe implements PipeTransform {
  transform(value: string, length: number = 100): string {
    return value.length > length
      ? value.substring(0, length) + '...'
      : value;
  }
}
```

### HTTP Interceptors

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};

// Register in app.config.ts
providers: [
  provideHttpClient(withInterceptors([authInterceptor]))
]
```

### Route Guards (Functional)

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

// Use in routes
{
  path: 'admin',
  canActivate: [authGuard],
  loadComponent: () => import('./admin/admin.component')
}
```

---

## Best Practices Summary

✅ **DO:**
- Use standalone components
- Prefer reactive composition over imperative code
- Use signals for local state (Angular 16+)
- Implement OnPush change detection for presentational components
- Use track functions in @for loops
- Debounce user input
- Use async pipe for automatic subscription management
- Write tests for all business logic

❌ **DON'T:**
- Subscribe in constructors
- Forget to unsubscribe from observables
- Put business logic in presentational components
- Use magic numbers or strings
- Bypass Angular's security features
- Nest subscriptions (use operators instead)
- Ignore TypeScript errors

---

**Last Updated:** March 2025
**Angular Version:** 20.2.1
