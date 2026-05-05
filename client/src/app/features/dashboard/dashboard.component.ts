import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { WorkoutService } from '../../core/services/workout.service';
import { ProfileService } from '../../core/services/fitness.service';
import { WorkoutStats, FitnessProfile, Workout } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Greeting -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white">
          Good {{ greeting }}, <span class="text-emerald-400">{{ auth.user()?.name?.split(' ')[0] }}!</span> 👋
        </h1>
        <p class="text-gray-400 mt-1">Here's your fitness overview</p>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-gray-900 rounded-2xl p-6 animate-pulse">
              <div class="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
              <div class="h-8 bg-gray-800 rounded w-3/4"></div>
            </div>
          }
        </div>
      } @else {
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-xl">🏋️</div>
              <span class="text-gray-400 text-sm">Total Workouts</span>
            </div>
            <p class="text-4xl font-bold text-white">{{ stats?.totalWorkouts ?? 0 }}</p>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-xl">⏱️</div>
              <span class="text-gray-400 text-sm">Total Minutes</span>
            </div>
            <p class="text-4xl font-bold text-white">{{ stats?.totalMinutes ?? 0 }}</p>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/30 transition-all">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-xl">🔥</div>
              <span class="text-gray-400 text-sm">Calories Burned</span>
            </div>
            <p class="text-4xl font-bold text-white">{{ stats?.totalCalories ?? 0 }}</p>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-xl">🔥</div>
              <span class="text-gray-400 text-sm">Day Streak</span>
            </div>
            <p class="text-4xl font-bold text-white">{{ stats?.streakDays ?? 0 }}</p>
          </div>
        </div>

        <!-- Profile Setup Banner (if no profile) -->
        @if (!profile) {
          <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-8 flex items-center justify-between">
            <div>
              <p class="text-emerald-400 font-semibold">Complete your fitness profile</p>
              <p class="text-gray-400 text-sm mt-1">Add your weight, height, and goals to get personalized insights.</p>
            </div>
            <a routerLink="/profile" class="bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold px-4 py-2 rounded-xl text-sm transition-all whitespace-nowrap ml-4">
              Set Up Profile
            </a>
          </div>
        }

        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Recent Workouts -->
          <div class="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-white">Recent Workouts</h2>
              <a routerLink="/workouts" class="text-emerald-400 hover:text-emerald-300 text-sm">View all →</a>
            </div>
            @if (recentWorkouts.length === 0) {
              <div class="text-center py-10">
                <p class="text-4xl mb-3">🏃</p>
                <p class="text-gray-400">No workouts yet.</p>
                <a routerLink="/workouts" class="text-emerald-400 text-sm hover:underline mt-2 inline-block">Log your first workout</a>
              </div>
            } @else {
              <div class="space-y-3">
                @for (workout of recentWorkouts; track workout.id) {
                  <div class="flex items-center gap-4 p-3 bg-gray-800 rounded-xl">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                         [class]="getTypeColor(workout.type)">
                      {{ getTypeIcon(workout.type) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-white font-medium truncate">{{ workout.name }}</p>
                      <p class="text-gray-400 text-sm">{{ workout.date }} · {{ workout.duration }} min</p>
                    </div>
                    @if (workout.calories_burned) {
                      <span class="text-orange-400 text-sm font-medium whitespace-nowrap">🔥 {{ workout.calories_burned }} kcal</span>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Workout Types Breakdown -->
          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 class="text-lg font-bold text-white mb-4">Workout Types</h2>
            @if (!stats || stats.totalWorkouts === 0) {
              <p class="text-gray-400 text-sm">No data yet.</p>
            } @else {
              <div class="space-y-4">
                @for (entry of getTypeEntries(); track entry[0]) {
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-300 capitalize">{{ entry[0] }}</span>
                      <span class="text-gray-400">{{ entry[1] }}</span>
                    </div>
                    <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div class="h-full bg-emerald-500 rounded-full transition-all"
                           [style.width.%]="(entry[1] / stats!.totalWorkouts) * 100">
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Quick stats -->
              <div class="mt-6 pt-4 border-t border-gray-800 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-400">Avg. Duration</span>
                  <span class="text-white font-medium">{{ stats?.averageDuration ?? 0 }} min</span>
                </div>
              </div>
            }

            <!-- Quick links -->
            <div class="mt-6 space-y-2">
              <a routerLink="/workouts" class="flex items-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold py-2.5 px-4 rounded-xl text-sm transition-all justify-center">
                + Log Workout
              </a>
              <a routerLink="/profile" class="flex items-center gap-2 w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 px-4 rounded-xl text-sm transition-all justify-center">
                Edit Profile
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private workoutService = inject(WorkoutService);
  private profileService = inject(ProfileService);

  loading = true;
  stats: WorkoutStats | null = null;
  profile: FitnessProfile | null = null;
  recentWorkouts: Workout[] = [];

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  ngOnInit(): void {
    forkJoin({
      stats: this.workoutService.getStats(),
      profile: this.profileService.getProfile(),
      workouts: this.workoutService.getWorkouts({ page: 1, limit: 5 }),
    }).subscribe({
      next: ({ stats, profile, workouts }) => {
        this.stats = stats;
        this.profile = profile.profile;
        this.recentWorkouts = workouts.data;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  getTypeEntries(): [string, number][] {
    return Object.entries(this.stats?.workoutsByType ?? {});
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      cardio: '🏃', strength: '💪', flexibility: '🧘', sports: '⚽',
    };
    return icons[type] ?? '🏋️';
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      cardio: 'bg-blue-500/20',
      strength: 'bg-orange-500/20',
      flexibility: 'bg-purple-500/20',
      sports: 'bg-green-500/20',
    };
    return colors[type] ?? 'bg-gray-700';
  }
}
