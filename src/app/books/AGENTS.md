# Books Feature

## Feature Structure

```
src/app/books/
├── book-list.component.ts      # Smart Component - Container
├── book-item.component.ts      # Dumb Component - Presentation
├── book-api-client.service.ts  # API Service
├── book.ts                      # Domain Model (Interface)
└── AGENTS.md                    # This file
```

## Components

### BookListComponent (Smart Component)
**Location:** `book-list.component.ts`
**Type:** Smart/Container Component
**Selector:** `app-book-list`

**Responsibilities:**
- Fetches book data from BookApiClient service
- Manages loading state
- Handles search functionality with debouncing (300ms)
- Orchestrates BookItemComponent instances

**Key Properties:**
- `pageSize: number` - Number of books to fetch (default: 10, configurable via @Input)
- `books: Book[]` - Array of books loaded from API
- `loading: boolean` - Loading state flag
- `searchTerm: string` - Current search query

**Key Methods:**
- `loadBooks(search?: string)` - Fetches books from API, optionally filtered by search term
- `onSearchChange()` - Debounced search handler (300ms delay to avoid excessive API calls)
- `clearSearch()` - Resets search and reloads all books
- `trackById(index, book)` - TrackBy function for *ngFor optimization

**Template Features:**
- Search input with clear button
- Loading spinner with animation
- Responsive grid layout (1/2/4/5 columns based on screen size)
- Empty state messaging (different for search vs. no data)

**Styling:**
- Tailwind CSS utility classes
- Responsive breakpoints: sm, lg, xl
- Loading animation with spinning border

---

### BookItemComponent (Dumb Component)
**Location:** `book-item.component.ts`
**Type:** Dumb/Presentational Component
**Selector:** `app-book-item`

**Responsibilities:**
- Pure presentation of a single book
- No business logic or service dependencies
- Displays book cover, title, subtitle, author, ISBN
- Navigation link to book detail page

**Inputs:**
- `book: Book` - Required book object to display

**Template Features:**
- Book cover image with fallback for missing covers
- Responsive card layout with hover effects
- Router link to `/book/:id` (detail route)
- Line clamping for long titles/subtitles
- Aspect ratio container for consistent cover display (3:4)

**Styling:**
- Card design with shadow and hover effects
- Tailwind CSS utilities
- Flex layout for content positioning

---

## Services

### BookApiClient
**Location:** `book-api-client.service.ts`
**Type:** Injectable Service (`providedIn: 'root'`)

**Responsibilities:**
- HTTP communication with Books API
- Query parameter construction
- Returns Observable streams

**Configuration:**
- API Base URL: `http://localhost:4730/books`

**Methods:**

#### `getBooks(pageSize: number = 10, searchTerm?: string): Observable<Book[]>`
Fetches a list of books with optional filtering.

**Parameters:**
- `pageSize` (optional, default: 10) - Maximum number of books to return
- `searchTerm` (optional) - Search query for title and author fields

**Query Parameters:**
- `_limit` - Page size limit
- `q` - Full-text search across title and author (when searchTerm provided)

**Returns:** Observable of Book array

#### `getBookById(id: string): Observable<Book>`
Fetches a single book by ID.

**Parameters:**
- `id` - Book identifier

**Returns:** Observable of single Book object

---

## Models

### Book Interface
**Location:** `book.ts`

```typescript
interface Book {
  id: string;           // Unique identifier
  isbn: string;         // ISBN number
  title: string;        // Book title
  subtitle?: string;    // Optional subtitle
  author: string;       // Author name (single author)
  publisher: string;    // Publisher name
  numPages: number;     // Number of pages
  price: string;        // Price (string format)
  cover: string;        // URL to cover image
  abstract: string;     // Book description/summary
  userId: number;       // Associated user ID
}
```

**Note:** The `author` field is a single string, not an array.

---

## API Integration

### Backend API
- **Base URL:** `http://localhost:4730/books`
- **Type:** JSON REST API
- **Search:** Full-text search using `q` parameter (searches title and author)
- **Pagination:** Uses `_limit` parameter

### Endpoints Used:
- `GET /books?_limit=10&q=searchterm` - List books with optional search
- `GET /books/:id` - Get single book by ID

---

## State Management
- **Pattern:** Local component state (no global state)
- **Loading State:** Boolean flag in BookListComponent
- **Data Flow:** Service → Smart Component → Dumb Component
- **Search State:** Local to BookListComponent with debouncing

---

## Performance Optimizations
- **TrackBy Function:** Uses `book.id` for efficient list rendering
- **Debouncing:** 300ms delay on search input to reduce API calls
- **Lazy Loading:** Images load on-demand
- **Responsive Images:** Aspect ratio containers prevent layout shift

---

## Testing Considerations

### BookListComponent (Smart)
- Mock BookApiClient service
- Test loading state transitions
- Test search debouncing behavior
- Test error handling
- Test empty state rendering

### BookItemComponent (Dumb)
- No mocking needed (no dependencies)
- Test input binding
- Test cover image fallback
- Test routing link generation
- Snapshot testing for template

### BookApiClient
- Mock HttpClient with HttpTestingController
- Test query parameter construction
- Test both endpoints (list and single)
- Test with/without search term

---

## Future Enhancements
- Pagination support (currently only uses _limit)
- Book detail component (route exists but component missing)
- Edit/Delete functionality
- Add new book form
- Filtering by publisher, price range, etc.
- Sorting options
- Virtual scrolling for large lists
