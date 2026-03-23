import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <header
        class="sticky top-0 z-50 transition-all duration-300 border-b"
        [class]="isScrolled ? 'bg-white/80 backdrop-blur-xl border-gray-200/60 shadow-sm' : 'bg-white border-transparent'"
      >
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div class="flex items-center justify-between">
            <a routerLink="/" class="flex items-center gap-2.5 group">
              <div class="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
              </div>
              <div>
                <h1 class="text-lg font-bold text-gray-900 tracking-tight leading-tight">Unsullied</h1>
                <p class="text-[11px] text-gray-500 leading-tight hidden sm:block">Cleaning & Pest Control</p>
              </div>
            </a>
            <nav class="flex items-center gap-1">
              <a
                routerLink="/quote"
                routerLinkActive="bg-primary-50 text-primary-700 font-semibold"
                [routerLinkActiveOptions]="{ exact: true }"
                class="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150"
              >Quote</a>
              <a
                routerLink="/admin/quotes"
                routerLinkActive="bg-primary-50 text-primary-700 font-semibold"
                class="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150"
              >Admin</a>
              <a
                routerLink="/admin/calendar"
                routerLinkActive="bg-primary-50 text-primary-700 font-semibold"
                class="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150"
              >Calendar</a>
            </nav>
          </div>
        </div>
      </header>
      <main class="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-outlet></router-outlet>
      </main>
      <footer class="bg-white border-t border-gray-100 mt-auto">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-400 text-sm">
          <p>&copy; 2026 Unsullied Cleaning Company. Designed by CODIST.</p>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'Unsullied';
  isScrolled = false;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }
}
