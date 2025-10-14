import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CandidateStore } from '../../core';

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './candidate-form.component.html',
  styleUrl: './candidate-form.component.scss'
})
export class CandidateFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(CandidateStore);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = this.store.loading;
  readonly selectedFileName = signal<string | null>(null);

  readonly candidateForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    surname: ['', [Validators.required, Validators.minLength(2)]],
    file: [null as File | null, Validators.required]
  });

  constructor() {
    // Control form disabled state reactively
    effect(() => {
      if (this.loading()) {
        this.candidateForm.disable({ emitEvent: false });
      } else {
        this.candidateForm.enable({ emitEvent: false });
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!this.isValidExcelFile(file)) {
        this.snackBar.open('Please select a valid Excel file (.xlsx, .xls)', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.candidateForm.patchValue({ file: null });
        this.selectedFileName.set(null);
        return;
      }

      this.candidateForm.patchValue({ file });
      this.selectedFileName.set(file.name);
    } else {
      this.candidateForm.patchValue({ file: null });
      this.selectedFileName.set(null);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.candidateForm.invalid) {
      this.candidateForm.markAllAsTouched();
      return;
    }

    const { name, surname, file } = this.candidateForm.getRawValue();

    if (!file) {
      this.snackBar.open('Please select an Excel file', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const result = await this.store.createCandidate({ name, surname, file });

    if (result) {
      this.snackBar.open(
        `Candidate ${result.name} ${result.surname} created successfully!`,
        'Close',
        { duration: 3000, panelClass: ['success-snackbar'] }
      );
      this.resetForm();
    } else if (this.store.error()) {
      this.snackBar.open(
        this.store.error() || 'Error creating candidate',
        'Close',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    }
  }

  private resetForm(): void {
    this.candidateForm.reset();
    this.selectedFileName.set(null);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private isValidExcelFile(file: File): boolean {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    const validExtensions = ['.xlsx', '.xls'];
    
    return validTypes.includes(file.type) || 
           validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  }

  getErrorMessage(fieldName: 'name' | 'surname'): string {
    const field = this.candidateForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    
    if (field?.hasError('minlength')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 2 characters`;
    }
    
    return '';
  }
}

