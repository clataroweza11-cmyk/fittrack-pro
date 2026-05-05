import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { WorkoutService } from '../../core/services/workout.service';
import { User, Workout } from '../../shared/models';

type AdminTab = 'users' | 'workouts';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white">⚙️ Admin Panel</h1>
        <p class="text-gray-400 mt-1">Manage users and fitness records</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid sm:grid-cols-3 gap-4 mb-8">
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p class="text-gray-400 text-sm mb-1">Total Users</p>
          <p class="text-3xl font-bold text-white">{{ totalUsers }}</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p class="text-gray-400 text-sm mb-1">Total Workouts</p>
          <p class="text-3xl font-bold text-white">{{ totalWorkouts }}</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p class="text-gray-400 text-sm mb-1">Active Tab</p>
          <p class="text-3xl font-bold text-emerald-400 capitalize">{{ activeTab }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        <button (click)="setTab('users')"
          class="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          [class]="activeTab === 'users' ? 'bg-emerald-500 text-gray-900' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'">
          Users
        </button>
        <button (click)="setTab('workouts')"
          class="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          [class]="activeTab === 'workouts' ? 'bg-emerald-500 text-gray-900' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'">
          All Workouts
        </button>
      </div>

      <!-- Error/Success -->
      @if (errorMsg) {
        <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-red-400 text-sm">{{ errorMsg }}</div>
      }
      @if (successMsg) {
        <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4 text-emerald-400 text-sm">{{ successMsg }}</div>
      }

      <!-- ── USERS TAB ─────────────────────────────────────────────── -->
      @if (activeTab === 'users') {
        <!-- Search -->
        <div class="mb-4">
          <input type="text" [(ngModel)]="userSearch" (input)="searchUsers()"
            placeholder="Search by name or email..."
            class="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
        </div>

        @if (usersLoading) {
          <div class="space-y-3">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="bg-gray-900 rounded-2xl p-5 animate-pulse h-20"></div>
            }
          </div>
        } @else {
          <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-800">
                  <th class="text-left text-gray-400 text-xs font-medium px-6 py-4 uppercase tracking-wider">User</th>
                  <th class="text-left text-gray-400 text-xs font-medium px-6 py-4 uppercase tracking-wider hidden sm:table-cell">Role</th>
                  <th class="text-left text-gray-400 text-xs font-medium px-6 py-4 uppercase tracking-wider hidden md:table-cell">Joined</th>
                  <th class="text-left text-gray-400 text-xs font-medium px-6 py-4 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th class="text-right text-gray-400 text-xs font-medium px-6 py-4 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (user of users; track user.id) {
                  <tr class="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
                          {{ user.name.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="text-white font-medium text-sm">{{ user.name }}</p>
                          <p class="text-gray-400 text-xs">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 hidden sm:table-cell">
                      <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                            [class]="user.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 hidden md:table-cell">
                      <span class="text-gray-400 text-sm">{{ user.created_at | date:'MMM d, y' }}</span>
                    </td>
                    <td class="px-6 py-4 hidden md:table-cell">
                      <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                            [class]="user.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'">
                        {{ user.is_active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-end gap-2">
                        <!-- Toggle role -->
                        <button (click)="toggleRole(user)"
                          class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs transition-all border border-gray-700">
                          {{ user.role === 'admin' ? 'Make User' : 'Make Admin' }}
                        </button>
                        <!-- Toggle active -->
                        <button (click)="toggleActive(user)"
                          class="px-3 py-1.5 rounded-lg text-xs transition-all border"
                          [class]="user.is_active ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'">
                          {{ user.is_active ? 'Deactivate' : 'Activate' }}
                        </button>
                        <!-- Delete -->
                        <button (click)="deleteUser(user.id)"
                          class="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            @if (users.length === 0) {
              <div class="text-center py-10">
                <p class="text-gray-400">No users found.</p>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (userTotalPages > 1) {
            <div class="flex items-center justify-center gap-2 mt-6">
              <button (click)="changeUserPage(userPage - 1)" [disabled]="userPage === 1"
                class="px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-xl text-sm disabled:opacity-40 hover:bg-gray-800">
                ← Prev
              </button>
              <span class="text-gray-400 text-sm px-3">Page {{ userPage }} of {{ userTotalPages }}</span>
              <button (click)="changeUserPage(userPage + 1)" [disabled]="userPage === userTotalPages"
                class="px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-xl text-sm disabled:opacity-40 hover:bg-gray-800">
                Next →
              </button>
            </div>
          }
        }
      }

      <!-- ── WORKOUTS TAB ───────────────────────────────────────────── -->
      @if (activeTab === 'workouts') {
        @if (workoutsLoading) {
          <div class="space-y-3">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="bg-gray-900 rounded-2xl p-5 animate-pulse h-20"></div>
            }
          </div>
        } @else {
          <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-800">
                  <th class="text-left text-gray-400 text-xs font-medium px-6 py-4 uppercase tracking-wider">Workout</th>
                  <th class="text-left text-gray-400 text-xs font-medium px-6 py-4 uppercase tracking-wider hidden sm:table-cell">User</th>
                  <th class="text-left text-gray-400 text-xs font-medium px-6 py-4 uppercase tracking-wider hidden md:table-cell">Duration</th>
                  <th class="text-left text-gray-400 text-xs font-medium px-6 py-4 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th class="text-right text-gray-400 text-xs font-medium px-6 py-4 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (workout of allWorkouts; track workout.id) {
                  <tr class="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <span class="text-lg">{{ getTypeIcon(workout.type) }}</span>
                        <div>
                          <p class="text-white font-medium text-sm">{{ workout.name }}</p>
                          <span class="px-2 py-0.5 rounded-full text-xs capitalize"
                                [class]="getTypeBadge(workout.type)">{{ workout.type }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 hidden sm:table-cell">
                      <p class="text-gray-300 text-sm">{{ workout['users']?.['name'] ?? '—' }}</p>
                      <p class="text-gray-500 text-xs">{{ workout['users']?.['email'] ?? '' }}</p>
                    </td>
                    <td class="px-6 py-4 hidden md:table-cell">
                      <span class="text-gray-300 text-sm">{{ workout.duration }} min</span>
                      @if (workout.calories_burned) {
                        <p class="text-orange-400 text-xs">🔥 {{ workout.calories_burned }} kcal</p>
                      }
                    </td>
                    <td class="px-6 py-4 hidden md:table-cell">
                      <span class="text-gray-400 text-sm">{{ workout.date }}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button (click)="deleteWorkout(workout.id)"
                        class="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        🗑️
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            @if (allWorkouts.length === 0) {
              <div class="text-center py-10">
                <p class="text-gray-400">No workouts found.</p>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (workoutTotalPages > 1) {
            <div class="flex items-center justify-center gap-2 mt-6">
              <button (click)="changeWorkoutPage(workoutPage - 1)" [disabled]="workoutPage === 1"
                class="px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-xl text-sm disabled:opacity-40 hover:bg-gray-800">
                ← Prev
              </button>
              <span class="text-gray-400 text-sm px-3">Page {{ workoutPage }} of {{ workoutTotalPages }}</span>
              <button (click)="changeWorkoutPage(workoutPage + 1)" [disabled]="workoutPage === workoutTotalPages"
                class="px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-xl text-sm disabled:opacity-40 hover:bg-gray-800">
                Next →
              </button>
            </div>
          }
        }
      }
    </div>
  `,
})
export class AdminComponent implements OnInit {
  private userService = inject(UserService);
  private workoutService = inject(WorkoutService);

  activeTab: AdminTab = 'users';
  errorMsg = '';
  successMsg = '';

  // Users state
  users: User[] = [];
  usersLoading = false;
  userSearch = '';
  userPage = 1;
  userTotalPages = 1;
  totalUsers = 0;

  // Workouts state
  allWorkouts: Workout[] = [];
  workoutsLoading = false;
  workoutPage = 1;
  workoutTotalPages = 1;
  totalWorkouts = 0;

  ngOnInit(): void {
    this.loadUsers();
    this.loadAllWorkouts();
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  loadUsers(): void {
    this.usersLoading = true;
    this.userService.getAllUsers(this.userPage, 15, this.userSearch).subscribe({
      next: (res) => {
        this.users = res.data;
        this.totalUsers = res.total;
        this.userTotalPages = res.totalPages;
        this.usersLoading = false;
      },
      error: () => { this.usersLoading = false; },
    });
  }

  searchUsers(): void {
    this.userPage = 1;
    this.loadUsers();
  }

  changeUserPage(page: number): void {
    if (page < 1 || page > this.userTotalPages) return;
    this.userPage = page;
    this.loadUsers();
  }

  toggleRole(user: User): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${user.name}'s role to ${newRole}?`)) return;

    this.userService.updateUser(user.id, { role: newRole as 'admin' | 'user' }).subscribe({
      next: () => {
        user.role = newRole as 'admin' | 'user';
        this.showSuccess(`${user.name}'s role updated to ${newRole}.`);
      },
      error: (err) => { this.errorMsg = err.error?.error || 'Failed to update role.'; },
    });
  }

  toggleActive(user: User): void {
    const newStatus = !user.is_active;
    this.userService.updateUser(user.id, { is_active: newStatus } as any).subscribe({
      next: () => {
        user.is_active = newStatus;
        this.showSuccess(`${user.name} has been ${newStatus ? 'activated' : 'deactivated'}.`);
      },
      error: (err) => { this.errorMsg = err.error?.error || 'Failed to update status.'; },
    });
  }

  deleteUser(id: string): void {
    if (!confirm('Permanently delete this user and all their data?')) return;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== id);
        this.totalUsers--;
        this.showSuccess('User deleted.');
      },
      error: (err) => { this.errorMsg = err.error?.error || 'Failed to delete user.'; },
    });
  }

  // ── Workouts ──────────────────────────────────────────────────────────────

  loadAllWorkouts(): void {
    this.workoutsLoading = true;
    this.workoutService.getAllWorkouts(this.workoutPage, 15).subscribe({
      next: (res) => {
        this.allWorkouts = res.data;
        this.totalWorkouts = res.total;
        this.workoutTotalPages = res.totalPages;
        this.workoutsLoading = false;
      },
      error: () => { this.workoutsLoading = false; },
    });
  }

  changeWorkoutPage(page: number): void {
    if (page < 1 || page > this.workoutTotalPages) return;
    this.workoutPage = page;
    this.loadAllWorkouts();
  }

  deleteWorkout(id: string): void {
    if (!confirm('Delete this workout record?')) return;
    this.workoutService.deleteWorkout(id).subscribe({
      next: () => {
        this.allWorkouts = this.allWorkouts.filter((w) => w.id !== id);
        this.totalWorkouts--;
        this.showSuccess('Workout deleted.');
      },
      error: (err) => { this.errorMsg = err.error?.error || 'Failed to delete.'; },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  showSuccess(msg: string): void {
    this.successMsg = msg;
    this.errorMsg = '';
    setTimeout(() => (this.successMsg = ''), 3000);
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      cardio: '🏃', strength: '💪', flexibility: '🧘', sports: '⚽',
    };
    return icons[type] ?? '🏋️';
  }

  getTypeBadge(type: string): string {
    const colors: Record<string, string> = {
      cardio: 'bg-blue-500/20 text-blue-400',
      strength: 'bg-orange-500/20 text-orange-400',
      flexibility: 'bg-purple-500/20 text-purple-400',
      sports: 'bg-green-500/20 text-green-400',
    };
    return colors[type] ?? 'bg-gray-700 text-gray-400';
  }
}
