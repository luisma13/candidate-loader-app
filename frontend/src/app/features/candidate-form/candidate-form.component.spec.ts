import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CandidateFormComponent } from './candidate-form.component';
import { CandidateStore } from '../../core';
import { Candidate } from '../../core/models';

class MatSnackBarStub {
  open() {
    return {
      onAction: () => of({})
    };
  }
}

describe('CandidateFormComponent', () => {
  let component: CandidateFormComponent;
  let fixture: ComponentFixture<CandidateFormComponent>;
  let mockCandidateStore: jasmine.SpyObj<CandidateStore>;

  const mockCandidate: Candidate = {
    id: '123',
    name: 'Carlos',
    surname: 'García',
    seniority: 'junior',
    years: 2,
    availability: true,
    createdAt: new Date()
  };

  beforeEach(async () => {
    mockCandidateStore = jasmine.createSpyObj('CandidateStore', 
      ['createCandidate', 'clearError'],
      { loading: () => false, error: () => null }
    );

    await TestBed.configureTestingModule({
      imports: [
        CandidateFormComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: CandidateStore, useValue: mockCandidateStore },
        { provide: MatSnackBar, useClass: MatSnackBarStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      expect(component.candidateForm.value).toEqual({
        name: '',
        surname: '',
        file: null
      });
    });

    it('should have invalid form initially', () => {
      expect(component.candidateForm.valid).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should require name field', () => {
      const nameControl = component.candidateForm.get('name');
      
      expect(nameControl?.valid).toBe(false);
      expect(nameControl?.hasError('required')).toBe(true);

      nameControl?.setValue('Carlos');
      expect(nameControl?.valid).toBe(true);
    });

    it('should require name to be at least 2 characters', () => {
      const nameControl = component.candidateForm.get('name');
      
      nameControl?.setValue('A');
      expect(nameControl?.hasError('minlength')).toBe(true);

      nameControl?.setValue('AB');
      expect(nameControl?.hasError('minlength')).toBe(false);
    });

    it('should require surname field', () => {
      const surnameControl = component.candidateForm.get('surname');
      
      expect(surnameControl?.valid).toBe(false);
      expect(surnameControl?.hasError('required')).toBe(true);

      surnameControl?.setValue('García');
      expect(surnameControl?.valid).toBe(true);
    });

    it('should require surname to be at least 2 characters', () => {
      const surnameControl = component.candidateForm.get('surname');
      
      surnameControl?.setValue('G');
      expect(surnameControl?.hasError('minlength')).toBe(true);

      surnameControl?.setValue('Ga');
      expect(surnameControl?.hasError('minlength')).toBe(false);
    });

    it('should require file field', () => {
      const fileControl = component.candidateForm.get('file');
      
      expect(fileControl?.valid).toBe(false);
      expect(fileControl?.hasError('required')).toBe(true);
    });

    it('should be valid when all fields are filled', () => {
      const mockFile = new File(['test'], 'candidate.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      component.candidateForm.patchValue({
        name: 'Carlos',
        surname: 'García',
        file: mockFile
      });

      expect(component.candidateForm.valid).toBe(true);
    });
  });

  describe('File Selection', () => {
    it('should update file and filename on valid Excel file selection', () => {
      const mockFile = new File(['test'], 'candidate.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const event = {
        target: {
          files: [mockFile]
        }
      } as any;

      component.onFileSelected(event);

      expect(component.candidateForm.get('file')?.value).toBe(mockFile);
      expect(component.selectedFileName()).toBe('candidate.xlsx');
    });

    it('should reject non-Excel files', () => {
      const mockFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });
      
      const event = {
        target: {
          files: [mockFile]
        }
      } as any;

      spyOn(component['snackBar'], 'open').and.callThrough();

      component.onFileSelected(event);

      expect(component.candidateForm.get('file')?.value).toBeNull();
      expect(component.selectedFileName()).toBeNull();
      expect(component['snackBar'].open).toHaveBeenCalledWith(
        'Please select a valid Excel file (.xlsx, .xls)',
        'Close',
        jasmine.objectContaining({ duration: 5000 })
      );
    });

    it('should clear file when no file is selected', () => {
      const event = {
        target: {
          files: []
        }
      } as any;

      component.onFileSelected(event);

      expect(component.candidateForm.get('file')?.value).toBeNull();
      expect(component.selectedFileName()).toBeNull();
    });

    it('should accept .xls files', () => {
      const mockFile = new File(['test'], 'candidate.xls', { type: 'application/vnd.ms-excel' });
      
      const event = {
        target: {
          files: [mockFile]
        }
      } as any;

      component.onFileSelected(event);

      expect(component.candidateForm.get('file')?.value).toBe(mockFile);
      expect(component.selectedFileName()).toBe('candidate.xls');
    });
  });

  describe('Form Submission', () => {
    it('should not submit when form is invalid', async () => {
      await component.onSubmit();

      expect(mockCandidateStore.createCandidate).not.toHaveBeenCalled();
      expect(component.candidateForm.get('name')?.touched).toBe(true);
      expect(component.candidateForm.get('surname')?.touched).toBe(true);
    });

    it('should submit valid form and show success message', async () => {
      const mockFile = new File(['test'], 'candidate.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      component.candidateForm.patchValue({
        name: 'Carlos',
        surname: 'García',
        file: mockFile
      });

      spyOn(component['snackBar'], 'open').and.callThrough();
      mockCandidateStore.createCandidate.and.returnValue(Promise.resolve(mockCandidate));

      await component.onSubmit();

      expect(mockCandidateStore.createCandidate).toHaveBeenCalledWith({
        name: 'Carlos',
        surname: 'García',
        file: mockFile
      });

      expect(component['snackBar'].open).toHaveBeenCalledWith(
        'Candidate Carlos García created successfully!',
        'Close',
        jasmine.objectContaining({ duration: 3000 })
      );
    });

    it('should reset form after successful submission', async () => {
      const mockFile = new File(['test'], 'candidate.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      component.candidateForm.patchValue({
        name: 'Carlos',
        surname: 'García',
        file: mockFile
      });

      mockCandidateStore.createCandidate.and.returnValue(Promise.resolve(mockCandidate));

      await component.onSubmit();

      expect(component.candidateForm.value).toEqual({
        name: '',
        surname: '',
        file: null
      });
      expect(component.selectedFileName()).toBeNull();
    });

    it('should show error message when submission fails', async () => {
      const mockFile = new File(['test'], 'candidate.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      component.candidateForm.patchValue({
        name: 'Carlos',
        surname: 'García',
        file: mockFile
      });

      spyOn(component['snackBar'], 'open').and.callThrough();
      mockCandidateStore.createCandidate.and.returnValue(Promise.resolve(null));
      Object.defineProperty(mockCandidateStore, 'error', { value: () => 'Validation error' });

      await component.onSubmit();

      expect(component['snackBar'].open).toHaveBeenCalledWith(
        'Validation error',
        'Close',
        jasmine.objectContaining({ duration: 5000 })
      );
    });
  });

  describe('Error Messages', () => {
    it('should return correct error message for required name', () => {
      const nameControl = component.candidateForm.get('name');
      nameControl?.setErrors({ required: true });

      expect(component.getErrorMessage('name')).toBe('Name is required');
    });

    it('should return correct error message for minlength name', () => {
      const nameControl = component.candidateForm.get('name');
      nameControl?.setErrors({ minlength: true });

      expect(component.getErrorMessage('name')).toBe('Name must be at least 2 characters');
    });

    it('should return correct error message for required surname', () => {
      const surnameControl = component.candidateForm.get('surname');
      surnameControl?.setErrors({ required: true });

      expect(component.getErrorMessage('surname')).toBe('Surname is required');
    });
  });
});

