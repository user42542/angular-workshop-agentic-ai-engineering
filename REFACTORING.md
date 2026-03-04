# Refactoring

## One Component per file

- You are not allow to keep multiple components in one file

## Single level of abstraction

- Keep the same level of abstraction in the components

### Don't

```ts
constructor() {

afterNextRender(() => {
  this.route.paramMap
    .pipe(
      map(paramMap => paramMap.get('id')), 
      switchMap(id => {
        if (!id) {
          this.navigateToNotFound();
          return EMPTY;
        }

        this.loading.set(true);
        this.book.set(null);

        return this.api.getBook(id);
      }),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: data => {
        this.book.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        if (err?.status === 404) {
          this.navigateToNotFound();
          return;
        }
        this.errorHandler.handleError(err);
      }
    });
});
}
```

### Do
```ts
constructor() {

afterNextRender(() => this.loadBookDetails())
}

private loadBookDetails() {
/ ... implementation details .../
}
```

## Error Handling

- Errors should be handled by a global error handler (`ErrorHandler`)
- When an error occurs a `Snackbar` should be displayed for 5 seconds

## Extract Inline SVGs

- Inline SVGs should live in own Components to have the possibility to lazy load them

## Back to Start

- The linkt to the Start should live in its own component to be reused

## Constructor

- Do not `subscribe` in `constructor` use `afterNextRender` hook for it

## Reactive composition

- Use reactive composition instead of manual loadBook
  Refactor to a single reactive pipeline:
  this.route.paramMap.pipe(map(id), switchMap(id => this.api.getBook(id))) and then subscribe once, updating book, loading, and error.
  This can reduce imperative state resets (book.set(null), error.set(null)) spread across methods.

## Encapsulate navigation logic

Wrap navigation calls in private methods like navigateToNotFound() and navigateToList() to:
Improve readability.
Make navigation changes easier (e.g. query params, fragments) in one place.
