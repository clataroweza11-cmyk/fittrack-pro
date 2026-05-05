import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { WorkoutService, WorkoutFilter } from '../../core/services/workout.service';
import { Workout, WorkoutType } from '../../shared/models';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white">Workout Tracker</h1>
          <p class="text-gray-400 mt-1">Log and manage your workouts</p>
        </div>
        <button (click)="openModal()"
          class="bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold px-4 py-2.5 rounded-xl transition-all text-sm">
          + Log Workout
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          type="text"
          [formControl]="searchCtrl"
          placeholder="Search workouts..."
          class="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
        <select [formControl]="typeCtrl"
          class="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500">
          <option value="">All types</option>
          <option value="cardio">Cardio</option>
          <option value="strength">Strength</option>
          <option value="flexibility">Flexibility</option>
          <option value="sports">Sports</option>
        </select>
        <input type="date" [formControl]="startDateCtrl"
          class="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
        <input type="date" [formControl]="endDateCtrl"
          class="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
      </div>

      <!-- Error -->
      @if (error) {
        <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">{{ error }}</div>
      }

      <!-- Loading -->
      @if (loading) {
        <div class="space-y-3">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="bg-gray-900 rounded-2xl p-5 animate-pulse h-20"></div>
          }
        </div>
      } @else {
        <!-- Workout list -->
        @if (workouts.length === 0) {
          <div class="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800">
            <p class="text-5xl mb-4">💪</p>
            <p class="text-white font-medium text-lg">No workouts found</p>
            <p class="text-gray-400 mt-2">Log your first workout to get started!</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (workout of workouts; track workout.id) {
              <div class="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all">
                <div class="flex items-start gap-4">
                  <!-- Type Icon -->
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                       [class]="getTypeBg(workout.type)">
                    {{ getTypeIcon(workout.type) }}
                  </div>

                  <!-- Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <h3 class="text-white font-semibold text-lg">{{ workout.name }}</h3>
                        <div class="flex flex-wrap gap-3 mt-1 text-sm">
                          <span class="text-gray-400">📅 {{ workout.date }}</span>
                          <span class="text-gray-400">⏱ {{ workout.duration }} min</span>
                          @if (workout.calories_burned) {
                            <span class="text-orange-400">🔥 {{ workout.calories_burned }} kcal</span>
                          }
                          @if (workout.sets && workout.reps) {
                            <span class="text-blue-400">{{ workout.sets }} sets × {{ workout.reps }} reps</span>
                          }
                          @if (workout.weight_used) {
                            <span class="text-purple-400">{{ workout.weight_used }} kg</span>
                          }
                        </div>
                        @if (workout.notes) {
                          <p class="text-gray-500 text-sm mt-2 italic">{{ workout.notes }}</p>
                        }
                      </div>
                      <!-- Type badge + actions -->
                      <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="px-3 py-1 rounded-full text-xs font-medium capitalize"
                              [class]="getTypeBadge(workout.type)">
                          {{ workout.type }}
                        </span>
                        <button (click)="openEdit(workout)" class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all" title="Edit">
                          ✏️
                        </button>
                        <button (click)="confirmDelete(workout.id)" class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Delete">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages > 1) {
            <div class="flex items-center justify-center gap-2 mt-8">
              <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1"
                class="px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-xl text-sm disabled:opacity-40 hover:bg-gray-800 transition-all">
                ← Prev
              </button>
              <span class="text-gray-400 text-sm px-3">Page {{ currentPage }} of {{ totalPages }}</span>
              <button (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages"
                class="px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-xl text-sm disabled:opacity-40 hover:bg-gray-800 transition-all">
                Next →
              </button>
            </div>
          }
        }
      }

      <!-- Modal: Log/Edit Workout -->
      @if (showModal) {
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div class="p-6">
              <h2 class="text-xl font-bold text-white mb-6">
                {{ editingId ? 'Edit Workout' : 'Log New Workout' }}
              </h2>

              <form [formGroup]="workoutForm" (ngSubmit)="saveWorkout()" class="space-y-4">
                <div class="grid sm:grid-cols-2 gap-4">
                  <div class="sm:col-span-2">
                    <label class="block text-sm text-gray-300 mb-1">Workout Name *</label>
                    <input type="text" formControlName="name" placeholder="e.g. Morning Run"
                      class="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      [class]="wIsInvalid('name') ? 'border-red-500' : 'border-gray-600'" />
                  </div>

                  <div>
                    <label class="block text-sm text-gray-300 mb-1">Type *</label>
                    <select formControlName="type"
                      class="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500">
                      <option value="cardio">Cardio</option>
                      <option value="strength">Strength</option>
                      <option value="flexibility">Flexibility</option>
                      <option value="sports">Sports</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm text-gray-300 mb-1">Duration (min) *</label>
                    <input type="number" formControlName="duration" min="1" max="600"
                      class="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      [class]="wIsInvalid('duration') ? 'border-red-500' : 'border-gray-600'" />
                  </div>

                  <div>
                    <label class="block text-sm text-gray-300 mb-1">Calories Burned</label>
                    <input type="number" formControlName="calories_burned" min="0"
                      class="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                  </div>

                  <div>
                    <label class="block text-sm text-gray-300 mb-1">Date</label>
                    <input type="date" formControlName="date"
                      class="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                  </div>

                  <div>
                    <label class="block text-sm text-gray-300 mb-1">Sets</label>
                    <input type="number" formControlName="sets" min="1"
                      class="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                  </div>

                  <div>
                    <label class="block text-sm text-gray-300 mb-1">Reps</label>
                    <input type="number" formControlName="reps" min="1"
                      class="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                  </div>

                  <div>
                    <label class="block text-sm text-gray-300 mb-1">Weight Used (kg)</label>
                    <input type="number" formControlName="weight_used" min="0" step="0.5"
                      class="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block text-sm text-gray-300 mb-1">Notes</label>
                    <textarea formControlName="notes" rows="2" placeholder="Optional notes..."
                      class="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none">
                    </textarea>
                  </div>
                </div>

                <div class="flex gap-3 pt-2">
                  <button type="button" (click)="closeModal()"
                    class="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-xl text-sm transition-all">
                    Cancel
                  </button>
                  <button type="submit" [disabled]="saving || workoutForm.invalid"
                    class="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 font-bold py-2.5 rounded-xl text-sm transition-all">
                    {{ saving ? 'Saving...' : (editingId ? 'Update' : 'Save') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class WorkoutsComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private fb = inject(FormBuilder);

  workouts: Workout[] = [];
  loading = false;
  saving = false;
  error = '';
  showModal = false;
  editingId: string | null = null;

  currentPage = 1;
  totalPages = 1;
  total = 0;

  // Search controls
  searchCtrl = this.fb.control('');
  typeCtrl = this.fb.control('');
  startDateCtrl = this.fb.control('');
  endDateCtrl = this.fb.control('');

  workoutForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['cardio' as WorkoutType, Validators.required],
    duration: [null as number | null, [Validators.required, Validators.min(1)]],
    calories_burned: [null as number | null],
    sets: [null as number | null],
    reps: [null as number | null],
    weight_used: [null as number | null],
    notes: [''],
    date: [new Date().toISOString().split('T')[0]],
  });

  ngOnInit(): void {
    this.loadWorkouts();

    // Reactive search
    this.searchCtrl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => this.applyFilters());

    this.typeCtrl.valueChanges.subscribe(() => this.applyFilters());
    this.startDateCtrl.valueChanges.subscribe(() => this.applyFilters());
    this.endDateCtrl.valueChanges.subscribe(() => this.applyFilters());
  }

  loadWorkouts(): void {
    this.loading = true;
    this.error = '';
    const filters: WorkoutFilter = {
      page: this.currentPage,
      limit: 10,
      search: this.searchCtrl.value || '',
      type: this.typeCtrl.value || '',
      startDate: this.startDateCtrl.value || '',
      endDate: this.endDateCtrl.value || '',
    };

    this.workoutService.getWorkouts(filters).subscribe({
      next: (res) => {
        this.workouts = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to load workouts.';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadWorkouts();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadWorkouts();
  }

  openModal(): void {
    this.editingId = null;
    this.workoutForm.reset({
      type: 'cardio',
      date: new Date().toISOString().split('T')[0],
    });
    this.showModal = true;
  }

  openEdit(workout: Workout): void {
    this.editingId = workout.id;
    this.workoutForm.patchValue(workout);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingId = null;
  }

  saveWorkout(): void {
    if (this.workoutForm.invalid) {
      this.workoutForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const data = this.workoutForm.value as Partial<Workout>;
    const req = this.editingId
      ? this.workoutService.updateWorkout(this.editingId, data)
      : this.workoutService.createWorkout(data);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadWorkouts();
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to save workout.';
        this.saving = false;
      },
    });
  }

  confirmDelete(id: string): void {
    if (!confirm('Delete this workout?')) return;
    this.workoutService.deleteWorkout(id).subscribe({
      next: () => this.loadWorkouts(),
      error: (err) => { this.error = err.error?.error || 'Failed to delete.'; },
    });
  }

  wIsInvalid(field: string): boolean {
    const ctrl = this.workoutForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      cardio: '🏃', strength: '💪', flexibility: '🧘', sports: '⚽',
    };
    return icons[type] ?? '🏋️';
  }

  getTypeBg(type: string): string {
    const colors: Record<string, string> = {
      cardio: 'bg-blue-500/20', strength: 'bg-orange-500/20',
      flexibility: 'bg-purple-500/20', sports: 'bg-green-500/20',
    };
    return colors[type] ?? 'bg-gray-700';
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
