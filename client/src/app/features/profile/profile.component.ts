import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { ProfileService, ProgressService } from '../../core/services/fitness.service';
import { AuthService } from '../../core/services/auth.service';
import { FitnessProfile, Progress } from '../../shared/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-white mb-8">My Profile</h1>

      <!-- User Info Card -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 flex items-center gap-4">
        <div class="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-gray-900">
          {{ auth.user()?.name?.charAt(0)?.toUpperCase() }}
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">{{ auth.user()?.name }}</h2>
          <p class="text-gray-400">{{ auth.user()?.email }}</p>
          <span class="px-2 py-0.5 text-xs rounded-full mt-1 inline-block"
                [class]="auth.isAdmin() ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'">
            {{ auth.user()?.role }}
          </span>
        </div>
      </div>

      <!-- Success/Error messages -->
      @if (successMsg) {
        <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 text-emerald-400 text-sm">{{ successMsg }}</div>
      }
      @if (errorMsg) {
        <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">{{ errorMsg }}</div>
      }

      <!-- Fitness Profile Form -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h3 class="text-lg font-bold text-white mb-5">Fitness Profile</h3>

        @if (profileLoading) {
          <div class="animate-pulse space-y-4">
            @for (i of [1,2,3]; track i) {
              <div class="h-12 bg-gray-800 rounded-xl"></div>
            }
          </div>
        } @else {
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">Weight (kg)</label>
              <input type="number" formControlName="weight" step="0.1" min="20" max="500"
                class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Height (cm)</label>
              <input type="number" formControlName="height" step="0.1" min="50" max="300"
                class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Age</label>
              <input type="number" formControlName="age" min="10" max="120"
                class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Gender</label>
              <select formControlName="gender"
                class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500">
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm text-gray-300 mb-1">Fitness Goal</label>
              <input type="text" formControlName="goal" placeholder="e.g. Lose weight, Build muscle"
                class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Activity Level</label>
              <select formControlName="activity_level"
                class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500">
                <option value="">Select...</option>
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Target Weight (kg)</label>
              <input type="number" formControlName="target_weight" step="0.1"
                class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>

            <!-- BMI Display -->
            @if (bmi) {
              <div class="sm:col-span-2 p-4 bg-gray-800 rounded-xl border border-gray-700">
                <p class="text-gray-400 text-sm">Estimated BMI</p>
                <p class="text-2xl font-bold mt-1" [class]="bmiColor">{{ bmi }}</p>
                <p class="text-gray-500 text-xs mt-1">{{ bmiLabel }}</p>
              </div>
            }

            <div class="sm:col-span-2">
              <button type="submit" [disabled]="savingProfile"
                class="bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 font-bold px-6 py-2.5 rounded-xl text-sm transition-all">
                {{ savingProfile ? 'Saving...' : 'Save Profile' }}
              </button>
            </div>
          </form>
        }
      </div>

      <!-- Progress Photos -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold text-white">Progress Photos</h3>
          <label class="cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold px-4 py-2 rounded-xl text-sm transition-all">
            + Add Photo
            <input type="file" accept="image/*" (change)="onImageSelect($event)" class="hidden" />
          </label>
        </div>

        <!-- Upload form (shown when image selected) -->
        @if (selectedFile) {
          <div class="mb-6 p-4 bg-gray-800 rounded-xl border border-emerald-500/30">
            <div class="flex items-center gap-3 mb-3">
              <img [src]="previewUrl" class="w-16 h-16 rounded-xl object-cover" alt="Preview" />
              <div>
                <p class="text-white text-sm font-medium">{{ selectedFile.name }}</p>
                <p class="text-gray-400 text-xs">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
              </div>
            </div>
            <div class="grid sm:grid-cols-2 gap-3">
              <input type="number" [(ngModel)]="uploadWeight" placeholder="Weight (kg)" step="0.1"
                class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
              <textarea [(ngModel)]="uploadNotes" placeholder="Notes (optional)" rows="1"
                class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none resize-none">
              </textarea>
            </div>
            <div class="flex gap-2 mt-3">
              <button (click)="uploadProgress()" [disabled]="uploading"
                class="bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 text-gray-900 font-bold px-4 py-2 rounded-lg text-sm">
                {{ uploading ? 'Uploading...' : 'Upload' }}
              </button>
              <button (click)="cancelUpload()" class="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </div>
        }

        <!-- Progress Grid -->
        @if (progressLoading) {
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            @for (i of [1,2,3]; track i) {
              <div class="aspect-square bg-gray-800 rounded-xl animate-pulse"></div>
            }
          </div>
        } @else if (progressItems.length === 0) {
          <p class="text-gray-400 text-sm text-center py-8">No progress photos yet. Upload your first one!</p>
        } @else {
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            @for (item of progressItems; track item.id) {
              <div class="relative group">
                @if (item.image_url) {
                  <img [src]="item.image_url" [alt]="item.date"
                    class="w-full aspect-square object-cover rounded-xl" />
                } @else {
                  <div class="w-full aspect-square bg-gray-800 rounded-xl flex items-center justify-center">
                    <span class="text-gray-500 text-sm">No Image</span>
                  </div>
                }
                <div class="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-3">
                  <div>
                    <p class="text-white text-xs font-medium">{{ item.date }}</p>
                    @if (item.weight) {
                      <p class="text-emerald-400 text-xs">{{ item.weight }} kg</p>
                    }
                    @if (item.notes) {
                      <p class="text-gray-300 text-xs mt-1">{{ item.notes }}</p>
                    }
                  </div>
                  <button (click)="deleteProgress(item.id)"
                    class="self-end text-red-400 hover:text-red-300 text-xs bg-red-500/20 px-2 py-1 rounded-lg">
                    Delete
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private progressService = inject(ProgressService);
  private fb = inject(FormBuilder);

  profileLoading = true;
  progressLoading = true;
  savingProfile = false;
  uploading = false;
  successMsg = '';
  errorMsg = '';

  progressItems: Progress[] = [];
  selectedFile: File | null = null;
  previewUrl = '';
  uploadWeight: number | null = null;
  uploadNotes = '';

  profileForm = this.fb.group({
    weight: [null as number | null],
    height: [null as number | null],
    age: [null as number | null],
    gender: [''],
    goal: [''],
    activity_level: [''],
    target_weight: [null as number | null],
    daily_calorie_goal: [null as number | null],
  });

  get bmi(): string | null {
    const { weight, height } = this.profileForm.value;
    if (!weight || !height) return null;
    const bmiVal = weight / Math.pow(height / 100, 2);
    return bmiVal.toFixed(1);
  }

  get bmiColor(): string {
    const val = parseFloat(this.bmi || '0');
    if (val < 18.5) return 'text-blue-400';
    if (val < 25) return 'text-emerald-400';
    if (val < 30) return 'text-amber-400';
    return 'text-red-400';
  }

  get bmiLabel(): string {
    const val = parseFloat(this.bmi || '0');
    if (val < 18.5) return 'Underweight';
    if (val < 25) return 'Normal weight';
    if (val < 30) return 'Overweight';
    return 'Obese';
  }

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: ({ profile }) => {
        if (profile) this.profileForm.patchValue(profile as any);
        this.profileLoading = false;
      },
      error: () => { this.profileLoading = false; },
    });

    this.progressService.getProgress().subscribe({
      next: (res) => {
        this.progressItems = res.data;
        this.progressLoading = false;
      },
      error: () => { this.progressLoading = false; },
    });
  }

  saveProfile(): void {
    this.savingProfile = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.profileService.upsertProfile(this.profileForm.value as FitnessProfile).subscribe({
      next: () => {
        this.successMsg = 'Profile saved successfully!';
        this.savingProfile = false;
        setTimeout(() => (this.successMsg = ''), 3000);
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Failed to save profile.';
        this.savingProfile = false;
      },
    });
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => { this.previewUrl = e.target?.result as string; };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadProgress(): void {
    if (!this.selectedFile) return;
    this.uploading = true;

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    if (this.uploadWeight) formData.append('weight', String(this.uploadWeight));
    if (this.uploadNotes) formData.append('notes', this.uploadNotes);

    this.progressService.createProgress(formData).subscribe({
      next: ({ progress }) => {
        this.progressItems.unshift(progress);
        this.cancelUpload();
        this.uploading = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Upload failed.';
        this.uploading = false;
      },
    });
  }

  cancelUpload(): void {
    this.selectedFile = null;
    this.previewUrl = '';
    this.uploadWeight = null;
    this.uploadNotes = '';
  }

  deleteProgress(id: string): void {
    if (!confirm('Delete this progress entry?')) return;
    this.progressService.deleteProgress(id).subscribe({
      next: () => {
        this.progressItems = this.progressItems.filter((p) => p.id !== id);
      },
      error: (err) => { this.errorMsg = err.error?.error || 'Delete failed.'; },
    });
  }
}
