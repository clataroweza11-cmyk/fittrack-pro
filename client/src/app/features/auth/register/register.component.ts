import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

// Custom validator: password must have uppercase, lowercase, number
function strongPassword(control: AbstractControl) {
  const val = control.value || '';
  const valid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(val);
  return valid ? null : { weakPassword: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center font-black text-gray-900 text-2xl mx-auto mb-4">
            FT
          </div>
          <h1 class="text-3xl font-bold text-white">Start your journey</h1>
          <p class="text-gray-400 mt-2">Create your FitTrack Pro account</p>
        </div>

        <!-- Error Alert -->
        @if (errorMsg) {
          <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
            {{ errorMsg }}
          </div>
        }

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input type="text" formControlName="name" placeholder="John Doe"
              class="w-full bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
              [class]="getFieldClass('name')" />
            @if (isInvalid('name')) {
              <p class="text-red-400 text-xs mt-1">Name must be at least 2 characters.</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input type="email" formControlName="email" placeholder="you@example.com"
              class="w-full bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
              [class]="getFieldClass('email')" />
            @if (isInvalid('email')) {
              <p class="text-red-400 text-xs mt-1">Please enter a valid email.</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input type="password" formControlName="password" placeholder="Min 8 chars, upper + lower + number"
              class="w-full bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
              [class]="getFieldClass('password')" />
            @if (isInvalid('password')) {
              <p class="text-red-400 text-xs mt-1">Password must be 8+ characters with uppercase, lowercase, and a number.</p>
            }
          </div>

          <!-- Password strength indicator -->
          @if (form.get('password')?.value) {
            <div class="flex gap-1">
              @for (i of [1,2,3,4]; track i) {
                <div class="h-1 flex-1 rounded-full transition-colors"
                     [class]="getStrengthColor(i)">
                </div>
              }
            </div>
          }

          <button type="submit" [disabled]="loading || form.invalid"
            class="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 font-bold py-3 rounded-xl transition-all mt-2">
            @if (loading) {
              <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Creating account...
              </span>
            } @else {
              Create Account
            }
          </button>
        </form>

        <p class="text-center text-gray-500 text-sm mt-6">
          Already have an account?
          <a routerLink="/login" class="text-emerald-400 hover:text-emerald-300 font-medium ml-1">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = false;
  errorMsg = '';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, strongPassword]],
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  getFieldClass(field: string): string {
    return this.isInvalid(field)
      ? 'border-red-500 focus:ring-red-500/50'
      : 'border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20';
  }

  getStrengthColor(level: number): string {
    const password = this.form.get('password')?.value || '';
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (level <= strength) {
      if (strength <= 1) return 'bg-red-500';
      if (strength === 2) return 'bg-amber-500';
      if (strength === 3) return 'bg-yellow-400';
      return 'bg-emerald-500';
    }
    return 'bg-gray-800';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    const { name, email, password } = this.form.value;

    this.auth.register(name!, email!, password!).subscribe({
      next: () => {},
      error: (err) => {
        this.errorMsg = err.error?.error || 'Registration failed. Please try again.';
        this.loading = false;
      },
      complete: () => { this.loading = false; },
    });
  }
}
