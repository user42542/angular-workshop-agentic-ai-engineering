# Angular Workshop - Frontend Architektur

## Überblick

Diese Anwendung ist eine moderne Angular 20 Applikation, die aktuelle Best Practices und Architekturprinzipien für Enterprise-Anwendungen umsetzt. Das Projekt demonstriert den Einsatz von Standalone Components, modernem State Management und einer klaren Feature-basierten Struktur.

## Technologie-Stack

### Core Framework
- **Angular 20.2.1** - Latest stable version mit vollständiger Standalone Component Support
- **TypeScript 5.9.2** - Type-safe development
- **RxJS 7.8.0** - Reaktive Programmierung und asynchrone Datenströme
- **Zone.js 0.15.0** - Change Detection

### State Management & Data Fetching
- **@ngrx/signals 20.0.1** - Signal-basiertes State Management
- **@tanstack/angular-query-experimental 5.85.5** - Server State Management
- **@angular-architects/ngrx-toolkit 20.1.0** - Vereinfachte NgRx Patterns

### UI & Styling
- **Angular Material 20.2.0** - Component Library
- **Tailwind CSS 4.1.12** - Utility-first CSS Framework
- **@tailwindcss/postcss 4.1.12** - PostCSS Integration

### Build & Development
- **@angular/build 20.2.0** - ESBuild-basiertes Build-System (schneller als Webpack)
- **Vite/ESBuild** - Moderne Build-Tools für optimierte Performance
- **Playwright 1.55.0** - End-to-End Testing

### Server-Side Rendering
- **@angular/ssr 20.2.1** - Server-Side Rendering Support
- **Express 5.1.0** - Node.js Server für SSR

## Architekturprinzipien

### 1. Standalone Components First

**Prinzip:** Seit Angular 15+ sind Standalone Components der empfohlene Standard. Angular 20 hat NgModules vollständig optional gemacht.

**Implementierung im Projekt:**
```typescript
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],  // Direkte Imports statt NgModule
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
```

**Vorteile:**
- ✅ Besseres Tree-Shaking → kleinere Bundle-Größen
- ✅ Schnelleres Bootstrapping
- ✅ Einfachere Testbarkeit
- ✅ Klarere Abhängigkeiten
- ✅ Weniger Boilerplate-Code

**Referenz:** `src/app/app.ts`, `src/app/books/book-list.component.ts:10`

### 2. Feature-basierte Projektstruktur

**Prinzip:** Organisation nach Business-Features statt nach technischen Typen.

**Aktuelle Struktur:**
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

**Empfohlene Skalierung für größere Projekte:**
```
src/app/
├── core/                           # Singleton Services, Guards, Interceptors
│   ├── auth/
│   ├── guards/
│   └── interceptors/
├── shared/                         # Wiederverwendbare UI-Komponenten
│   ├── components/
│   ├── directives/
│   └── pipes/
├── features/                       # Business Features
│   ├── books/
│   │   ├── components/            # Feature-spezifische Komponenten
│   │   ├── services/              # Feature Services
│   │   ├── models/                # Feature Models
│   │   └── books.routes.ts        # Feature Routes (Lazy Loading)
│   ├── authors/
│   └── dashboard/
└── layout/                         # Layout Components (Header, Footer, etc.)
```

**Best Practices:**
- Jedes Feature erhält einen eigenen Ordner mit eigenem Routing
- Core-Modul für Singleton-Services (nur einmal im App geladen)
- Shared-Modul für wiederverwendbare, zustandslose UI-Komponenten
- Lazy Loading für Feature-Module zur Performance-Optimierung

### 3. Smart & Dumb Components Pattern

**Prinzip:** Trennung von Logik und Präsentation für bessere Wartbarkeit und Testbarkeit.

**Smart Components (Container):**
- Verwalten State und Business-Logik
- Kommunizieren mit Services und APIs
- Orchestrieren Datenfluss
- Kennen die Geschäftslogik

**Beispiel im Projekt:** `BookListComponent` (src/app/books/book-list.component.ts:81)
```typescript
export class BookListComponent implements OnInit {
  books: Book[] = [];
  loading: boolean = true;

  constructor(private bookApiClient: BookApiClient) {}  // Service Injection

  ngOnInit(): void {
    this.loadBooks();  // Business Logic
  }
}
```

**Dumb Components (Presentational):**
- Reine UI-Komponenten ohne Business-Logik
- Erhalten Daten über `@Input()`
- Geben Events über `@Output()` weiter
- Wiederverwendbar und isoliert testbar

**Beispiel im Projekt:** `BookItemComponent` (src/app/books/book-item.component.ts:38)
```typescript
export class BookItemComponent {
  @Input() book!: Book;  // Nur Input, keine Logik
  // Reine Präsentationskomponente
}
```

**Vorteile:**
- ✅ Bessere Testbarkeit (Dumb Components benötigen keine Mocks)
- ✅ Höhere Wiederverwendbarkeit
- ✅ Klare Verantwortlichkeiten
- ✅ Einfachere Wartung

### 4. Dependency Injection Best Practices

**Prinzip:** Tree-shakeable Providers mit `providedIn: 'root'` für optimale Bundle-Größe.

**Implementierung:**
```typescript
@Injectable({ providedIn: 'root' })
export class BookApiClient {
  // Service-Logik
}
```
*Referenz:* `src/app/books/book-api-client.service.ts:6`

**Vorteile:**
- ✅ Automatisches Tree-Shaking: Service wird nur gebundelt, wenn verwendet
- ✅ Singleton Pattern: Eine Instanz für die gesamte App
- ✅ Keine manuelle Provider-Registrierung nötig
- ✅ Kleinere Bundle-Größen

**Application Config Pattern:**
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations()
  ]
};
```
*Referenz:* `src/app/app.config.ts:7`

**Best Practices:**
- Verwende `providedIn: 'root'` für globale Services
- Verwende `providedIn` in einem Feature für Feature-spezifische Services
- Nutze `ApplicationConfig` statt `NgModule.providers`
- InjectionTokens für Konfigurationswerte

### 5. Reactive Programming mit RxJS

**Prinzip:** Asynchrone Datenströme mit RxJS Observables.

**Implementierung im Projekt:**
```typescript
getBooks(pageSize: number = 10, searchTerm?: string): Observable<Book[]> {
  let params = new HttpParams().set('_limit', pageSize.toString());
  if (searchTerm) {
    params = params.set('q', searchTerm);
  }
  return this.http.get<Book[]>(this.apiUrl, { params });
}
```
*Referenz:* `src/app/books/book-api-client.service.ts:12`

**Best Practices:**
- ✅ Verwende `async` Pipe in Templates (automatische Subscription/Unsubscription)
- ✅ Debouncing für Search-Inputs (implementiert in `book-list.component.ts:108`)
- ✅ Error Handling mit RxJS Operators
- ✅ Verwende `takeUntil` für manuelle Unsubscriptions

**Debouncing-Beispiel:**
```typescript
onSearchChange(): void {
  clearTimeout(this.searchTimeout);
  this.searchTimeout = setTimeout(() => {
    this.loadBooks(this.searchTerm);
  }, 300);
}
```
*Referenz:* `src/app/books/book-list.component.ts:108`

### 6. Signals für Reaktivität (Angular 16+)

**Status im Projekt:** Das Projekt ist vorbereitet für Signals mit `@ngrx/signals` (v20.0.1), nutzt aktuell aber noch traditionelle RxJS-Patterns.

**Empfohlene Migration zu Signals:**

**Vorher (aktuell):**
```typescript
books: Book[] = [];
loading: boolean = true;
```

**Nachher (mit Signals):**
```typescript
books = signal<Book[]>([]);
loading = signal<boolean>(true);
```

**Vorteile von Signals:**
- ⚡ Feinere Change Detection (nur betroffene Komponenten)
- 📊 Einfacheres State Management
- 🔄 Bessere Performance
- 📖 Lesbarerer Code

**Signal-basiertes State Management:**
```typescript
import { signalStore, withState } from '@ngrx/signals';

export const BookStore = signalStore(
  { providedIn: 'root' },
  withState({ books: [], loading: false })
);
```

### 7. Routing & Lazy Loading

**Aktuelle Implementierung:**
```typescript
export const routes: Routes = [
  { path: '', component: BookListComponent },
  { path: '**', redirectTo: '' }
];
```
*Referenz:* `src/app/app.routes.ts:4`

**Empfohlene Skalierung mit Lazy Loading:**
```typescript
export const routes: Routes = [
  {
    path: 'books',
    loadComponent: () => import('./features/books/book-list.component')
      .then(m => m.BookListComponent)
  },
  {
    path: 'authors',
    loadChildren: () => import('./features/authors/authors.routes')
      .then(m => m.AUTHOR_ROUTES)
  }
];
```

**Vorteile:**
- 📦 Kleinere Initial Bundle Size
- ⚡ Schnellere Ladezeiten
- 🎯 On-Demand Loading

### 8. Performance Optimierungen

**1. Build-Performance:**
- ✅ ESBuild statt Webpack (3-5x schneller)
- ✅ Incremental Builds
- ✅ Tree-Shaking für optimale Bundle-Größen

**2. Runtime-Performance:**
```typescript
trackById(index: number, book: Book): string {
  return book.id;
}
```
*Referenz:* `src/app/books/book-list.component.ts:121`

**3. Bundle Budget Configuration:**
```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kB",
    "maximumError": "1MB"
  }
]
```
*Referenz:* `angular.json:29`

**Weitere Optimierungen:**
- Lazy Loading für Routes
- OnPush Change Detection Strategy (empfohlen für Dumb Components)
- Virtual Scrolling für große Listen
- Deferrable Views (Angular 17+) für verzögertes Laden

### 9. Testing-Strategie

**E2E Testing mit Playwright:**
```typescript
// playwright.config.ts vorhanden
```
*Referenz:* `playwright.config.ts`

**Empfohlene Testing-Pyramide:**
```
         /\
        /E2E\        ← Wenige (Playwright)
       /------\
      /Integration\  ← Einige (Component Tests)
     /------------\
    /  Unit Tests  \ ← Viele (Service Tests)
   /----------------\
```

**Best Practices:**
- Unit Tests für Services und Utils (hohe Coverage)
- Component Tests für komplexe UI-Logik
- E2E Tests für kritische User Journeys
- Dumb Components einfach testbar (keine Mocks nötig)

### 10. Code-Qualität & Standards

**Prettier Configuration:**
```json
{
  "format.write": "prettier --write \"src/**/*.{ts,html,md,css,json}\""
}
```
*Referenz:* `package.json:10`

**Editor Configuration:**
- VS Code Extensions empfohlen:
  - Angular Language Service
  - Prettier
- `.editorconfig` für konsistente Code-Formatierung

**TypeScript Configuration:**
- Strikte Type-Checks aktiviert
- `tsconfig.app.json` für Application-Code
- `tsconfig.spec.json` für Test-Code

## State Management Strategie

### Aktueller Ansatz
- Lokaler Component State für UI-State
- Service-basiertes State Sharing
- RxJS für asynchrone Datenströme

### Empfohlene Erweiterung für komplexe Apps

**Für kleine bis mittlere Apps:**
```typescript
// Signal Store mit @ngrx/signals
export const BookStore = signalStore(
  { providedIn: 'root' },
  withState({ books: [], loading: false }),
  withMethods((store) => ({
    loadBooks: () => {
      patchState(store, { loading: true });
      // Load logic
    }
  }))
);
```

**Für große Enterprise Apps:**
- NgRx Store für globalen Application State
- @ngrx/effects für Side Effects
- @ngrx/entity für Entity Management
- @ngrx/router-store für Router State

## API Integration Pattern

**Aktuelles Pattern: Service-basierte API Clients**
```typescript
@Injectable({ providedIn: 'root' })
export class BookApiClient {
  private readonly apiUrl = 'http://localhost:4730/books';

  constructor(private http: HttpClient) {}

  getBooks(pageSize: number, searchTerm?: string): Observable<Book[]> {
    let params = new HttpParams().set('_limit', pageSize.toString());
    if (searchTerm) {
      params = params.set('q', searchTerm);
    }
    return this.http.get<Book[]>(this.apiUrl, { params });
  }
}
```
*Referenz:* `src/app/books/book-api-client.service.ts`

**Best Practices:**
- ✅ Zentrale API Service pro Feature/Domain
- ✅ Typed Responses mit TypeScript Interfaces
- ✅ HttpParams für Query Parameters
- ✅ Error Handling auf Service-Ebene
- ✅ Interceptors für globale Concerns (Auth, Logging, etc.)

**Empfohlene Erweiterung mit TanStack Query:**
```typescript
// Server State Caching mit @tanstack/angular-query
export const booksQuery = injectQuery(() => ({
  queryKey: ['books'],
  queryFn: () => bookApiClient.getBooks()
}));
```

**Vorteile:**
- Automatisches Caching
- Background Updates
- Optimistic Updates
- Request Deduplication

## UI/UX Patterns

### Tailwind CSS Utility-First Approach
```html
<div class="container mx-auto px-4 py-12 max-w-7xl">
  <h1 class="text-3xl font-bold mb-10 text-blue-700">Book Collection</h1>
</div>
```
*Referenz:* `src/app/books/book-list.component.ts:13`

**Vorteile:**
- ⚡ Schnelles Prototyping
- 📦 Kleine CSS Bundle-Größen (Tree-Shaking)
- 🎨 Konsistentes Design System
- 🔧 Einfache Wartung

### Responsive Design
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
```
*Referenz:* `src/app/books/book-list.component.ts:42`

**Breakpoints:**
- `sm:` - Small devices (640px+)
- `md:` - Medium devices (768px+)
- `lg:` - Large devices (1024px+)
- `xl:` - Extra large devices (1280px+)

### Loading States & UX Feedback
```typescript
loading: boolean = true;  // Loading State
```
```html
<div *ngIf="loading" class="flex justify-center items-center py-20">
  <div class="animate-pulse">
    <div class="h-16 w-16 rounded-full border-4 animate-spin"></div>
  </div>
</div>
```
*Referenz:* `src/app/books/book-list.component.ts:33`

## Deployment & Build

### Build Konfigurationen

**Development Build:**
```bash
npm start  # Startet dev-server mit Hot Module Replacement
```

**Production Build:**
```bash
npm run build  # Erstellt optimierte Production Builds
```

**Build-Optimierungen:**
- ✅ ESBuild für schnelle Builds (3-5x schneller als Webpack)
- ✅ Tree-Shaking für minimal Bundle Sizes
- ✅ Output Hashing für Browser Caching
- ✅ Bundle Budgets zur Größenkontrolle

### Server-Side Rendering (SSR)

**Setup verfügbar:**
- `@angular/ssr` v20.2.1
- Express Server v5.1.0

**Vorteile:**
- 🚀 Bessere SEO
- ⚡ Schnellere First Contentful Paint
- 📱 Bessere Performance auf mobilen Geräten

## Migration & Modernisierung

### Von NgModules zu Standalone Components

**Status:** ✅ Projekt verwendet bereits Standalone Components

**Vorteile der aktuellen Architektur:**
- Keine NgModules nötig
- Einfachere Abhängigkeitsverwaltung
- Bessere Tree-Shaking Resultate
- Schnelleres Bootstrapping

### Von RxJS zu Signals (empfohlen)

**Nächste Schritte:**
1. Component State zu Signals migrieren
2. Signal-basierte Stores einführen
3. RxJS nur für asynchrone Streams behalten

**Beispiel-Migration:**
```typescript
// Alt (RxJS-basiert)
books: Book[] = [];

// Neu (Signal-basiert)
books = signal<Book[]>([]);
computed(() => this.books().length);
```

## Best Practices Zusammenfassung

### Do's ✅
- ✅ Verwende Standalone Components
- ✅ Organisiere nach Features, nicht nach Typen
- ✅ Trenne Smart und Dumb Components
- ✅ Nutze `providedIn: 'root'` für Services
- ✅ Implementiere Lazy Loading
- ✅ Verwende TrackBy in *ngFor
- ✅ Debounce User-Input
- ✅ Type-safe API Responses
- ✅ Signal-basiertes State Management (Angular 16+)
- ✅ Responsive Design mit Tailwind

### Don'ts ❌
- ❌ Vermeide NgModules (veraltet)
- ❌ Keine Business-Logik in Dumb Components
- ❌ Keine direkten DOM-Manipulationen
- ❌ Vermeide Memory Leaks (Unsubscribe!)
- ❌ Keine Magic Numbers/Strings
- ❌ Vermeide zu große Komponenten (> 400 LOC)
- ❌ Keine Services in Dumb Components injecten

## Weiterführende Ressourcen

### Offizielle Dokumentation
- [Angular.dev](https://angular.dev) - Offizielle Angular Dokumentation
- [Angular Architecture Guide](https://angular.dev/guide/architecture)
- [Angular Style Guide](https://angular.dev/style-guide)

### State Management
- [NgRx Signals Documentation](https://ngrx.io/guide/signals)
- [TanStack Query Angular](https://tanstack.com/query/latest/docs/framework/angular/overview)

### Best Practices & Patterns
- [Angular Architecture Best Practices](https://dev-academy.com/angular-architecture-best-practices/)
- [Smart-Dumb Component Architecture](https://medium.com/@joshuaibbotson8/smart-dumb-component-architecture-in-angular)

### Performance
- [Angular Performance Checklist](https://angular.dev/best-practices/performance)
- [Web Vitals](https://web.dev/vitals/)

## Kontakt & Support

Für Fragen zur Architektur oder Best Practices:
- Workshop: [workshops.de](https://workshops.de/seminare-schulungen-kurse/angular-ai-agent-driven-development)

---

**Letzte Aktualisierung:** März 2025
**Angular Version:** 20.2.1
**Status:** ✅ Production Ready
