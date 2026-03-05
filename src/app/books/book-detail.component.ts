import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Book } from './book';
import { BookApiClient } from './book-api-client.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div class="container mx-auto px-4 max-w-7xl">
        <!-- Back Button -->
        <button
          (click)="goBack()"
          class="mb-8 flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 group"
        >
          <svg
            class="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Books
        </button>

        <!-- Loading State -->
        @if (loading) {
          <div class="flex justify-center items-center py-32">
            <div class="animate-pulse flex flex-col items-center">
              <div
                class="h-16 w-16 rounded-full border-4 border-t-blue-700 border-r-blue-700 border-b-gray-200 border-l-gray-200 animate-spin"
              ></div>
              <p class="mt-4 text-gray-600">Loading book details...</p>
            </div>
          </div>
        }

        <!-- Error State -->
        @if (error && !loading) {
          <div
            class="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-2xl mx-auto"
          >
            <svg
              class="h-16 w-16 text-red-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h2 class="text-2xl font-bold text-red-800 mb-2">Book Not Found</h2>
            <p class="text-red-600 mb-6">{{ error }}</p>
            <button
              (click)="goBack()"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
            >
              Return to Book List
            </button>
          </div>
        }

        <!-- Book Detail Content -->
        @if (book && !loading) {
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="md:flex">
            <!-- Book Cover Section -->
            <div class="md:w-2/5 lg:w-1/3 bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center">
              <div class="max-w-sm w-full">
                @if (book.cover) {
                  <img
                    [src]="book.cover"
                    [alt]="book.title"
                    class="w-full rounded-lg shadow-2xl"
                  />
                } @else {
                  <div
                    class="w-full aspect-[3/4] bg-gray-300 rounded-lg shadow-2xl flex items-center justify-center"
                  >
                    <div class="text-center">
                      <svg
                        class="h-24 w-24 text-gray-500 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <p class="text-gray-600 font-medium">No cover available</p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Book Information Section -->
            <div class="md:w-3/5 lg:w-2/3 p-8 lg:p-12">
              <!-- Title and Subtitle -->
              <div class="mb-6 border-b border-gray-200 pb-6">
                <h1 class="text-4xl font-bold text-gray-900 mb-3 leading-tight">{{ book.title }}</h1>
                @if (book.subtitle) {
                  <p class="text-xl text-gray-600 italic">{{ book.subtitle }}</p>
                }
              </div>

              <!-- Primary Details Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <!-- Author -->
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Author</span>
                  <span class="text-lg text-gray-900">{{ book.author }}</span>
                </div>

                <!-- Publisher -->
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Publisher</span>
                  <span class="text-lg text-gray-900">{{ book.publisher }}</span>
                </div>

                <!-- ISBN -->
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">ISBN</span>
                  <span class="text-lg text-gray-900 font-mono">{{ book.isbn }}</span>
                </div>

                <!-- Pages -->
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Pages</span>
                  <span class="text-lg text-gray-900">{{ book.numPages }} pages</span>
                </div>

                <!-- Price -->
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Price</span>
                  <span class="text-2xl font-bold text-blue-700">{{ book.price }}</span>
                </div>
              </div>

              <!-- Abstract Section -->
              <div class="mt-8 pt-8 border-t border-gray-200">
                <h2 class="text-xl font-bold text-gray-900 mb-4">About This Book</h2>
                <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ book.abstract }}</p>
              </div>

              <!-- Action Button -->
              <div class="mt-8 pt-8 border-t border-gray-200">
                <button
                  (click)="goBack()"
                  class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md transition duration-200 shadow-md hover:shadow-lg"
                >
                  Back to Collection
                </button>
              </div>
            </div>
          </div>
        </div>
        }
      </div>
    </div>
  `
})
export class BookDetailComponent implements OnInit {
  book: Book | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookApiClient: BookApiClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBook(id);
    } else {
      this.error = 'No book ID provided';
      this.loading = false;
    }
  }

  private loadBook(id: string): void {
    this.loading = true;
    this.bookApiClient.getBookById(id).subscribe({
      next: book => {
        this.book = book;
        this.loading = false;
      },
      error: error => {
        console.error('Error fetching book:', error);
        this.error = error.status === 404
          ? 'The book you are looking for could not be found.'
          : 'An error occurred while loading the book details. Please try again later.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
