import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    @if (auth.isAuthenticated()) {
      <nav class="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <a routerLink="/dashboard" class="flex items-center gap-2 group">
              <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-gray-900 text-sm group-hover:bg-emerald-400 transition-colors">
                FT
              </div>
              <span class="font-bold text-white text-lg tracking-tight">FitTrack <span class="text-emerald-400">Pro</span></span>
            </a>

            <!-- Nav links -->
            <div class="hidden md:flex items-center gap-1">
              <a routerLink="/dashboard" routerLinkActive="bg-gray-800 text-emerald-400"
                 class="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm font-medium">
                Dashboard
              </a>
              <a routerLink="/workouts" routerLinkActive="bg-gray-800 text-emerald-400"
                 class="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm font-medium">
                Workouts
              </a>
              <a routerLink="/profile" routerLinkActive="bg-gray-800 text-emerald-400"
                 class="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm font-medium">
                Profile
              </a>
              @if (auth.isAdmin()) {
                <a routerLink="/admin" routerLinkActive="bg-gray-800 text-amber-400"
                   class="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm font-medium">
                  ⚙ Admin
                </a>
              }
            </div>

            <!-- User info + logout -->
            <div class="flex items-center gap-3">
              <div class="hidden sm:flex flex-col items-end">
                <span class="text-white text-sm font-medium">{{ auth.user()?.name }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full"
                      [class]="auth.isAdmin() ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'">
                  {{ auth.user()?.role }}
                </span>
              </div>
              <button (click)="auth.logout()"
                      class="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 rounded-lg text-sm transition-all border border-gray-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    }
  `,
})
export class NavbarComponent {
  auth = inject(AuthService);
}
