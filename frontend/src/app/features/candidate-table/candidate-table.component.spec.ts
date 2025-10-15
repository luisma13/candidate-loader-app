import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal, WritableSignal } from '@angular/core';

import { CandidateTableComponent } from './candidate-table.component';
import { CandidateStore } from '../../core/store/candidate.store';
import { Candidate } from '../../core/models/candidate.model';

describe('CandidateTableComponent', () => {
  let component: CandidateTableComponent;
  let fixture: ComponentFixture<CandidateTableComponent>;
  let candidatesSignal: WritableSignal<Candidate[]>;
  let loadingSignal: WritableSignal<boolean>;
  let errorSignal: WritableSignal<string | null>;
  let mockStore: jasmine.SpyObj<CandidateStore>;

  const mockCandidates: Candidate[] = [
    {
      id: '1',
      name: 'John',
      surname: 'Doe',
      seniority: 'senior',
      years: 5,
      availability: true,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Jane',
      surname: 'Smith',
      seniority: 'junior',
      years: 3,
      availability: false,
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    candidatesSignal = signal<Candidate[]>([]);
    loadingSignal = signal(false);
    errorSignal = signal<string | null>(null);

    mockStore = jasmine.createSpyObj('CandidateStore', ['loadCandidates'], {
      candidates: candidatesSignal.asReadonly(),
      loading: loadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [CandidateTableComponent],
      providers: [
        { provide: CandidateStore, useValue: mockStore },
        provideHttpClient(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load candidates on init', () => {
      fixture.detectChanges();
      expect(mockStore.loadCandidates).toHaveBeenCalled();
    });

    it('should have correct displayed columns', () => {
      expect(component.displayedColumns).toEqual([
        'name',
        'surname',
        'seniority',
        'years',
        'availability',
      ]);
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when loading', () => {
      loadingSignal.set(true);
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      const loadingText = fixture.nativeElement.querySelector(
        '.loading-container p'
      );

      expect(spinner).toBeTruthy();
      expect(loadingText?.textContent).toContain('Loading candidates');
    });
  });

  describe('Error Banner', () => {
    it('should display error banner when there is an error', () => {
      const errorMessage = 'Failed to load candidates';
      errorSignal.set(errorMessage);
      loadingSignal.set(false);
      fixture.detectChanges();

      const errorBanner = fixture.nativeElement.querySelector('.error-banner');
      const errorText = fixture.nativeElement.querySelector('.error-banner .message');

      expect(errorBanner).toBeTruthy();
      expect(errorText?.textContent).toContain(errorMessage);
    });

    it('should not display error banner when there is no error', () => {
      errorSignal.set(null);
      fixture.detectChanges();

      const errorBanner = fixture.nativeElement.querySelector('.error-banner');
      expect(errorBanner).toBeFalsy();
    });

    it('should show table alongside error banner if candidates exist', () => {
      candidatesSignal.set(mockCandidates);
      errorSignal.set('Network error');
      loadingSignal.set(false);
      fixture.detectChanges();

      const errorBanner = fixture.nativeElement.querySelector('.error-banner');
      const table = fixture.nativeElement.querySelector('.candidates-table');

      expect(errorBanner).toBeTruthy();
      expect(table).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no candidates', () => {
      candidatesSignal.set([]);
      loadingSignal.set(false);
      fixture.detectChanges();

      const emptyContainer =
        fixture.nativeElement.querySelector('.empty-container');
      const emptyText = emptyContainer?.querySelector('p');

      expect(emptyContainer).toBeTruthy();
      expect(emptyText?.textContent).toContain('No candidates loaded yet');
    });

    it('should compute isEmpty correctly', () => {
      candidatesSignal.set([]);
      loadingSignal.set(false);

      expect(component.isEmpty()).toBe(true);

      loadingSignal.set(true);
      expect(component.isEmpty()).toBe(false);

      loadingSignal.set(false);
      candidatesSignal.set(mockCandidates);
      expect(component.isEmpty()).toBe(false);
    });
  });

  describe('Table Display', () => {
    beforeEach(() => {
      candidatesSignal.set(mockCandidates);
      loadingSignal.set(false);
      fixture.detectChanges();
    });

    it('should display table when candidates exist', () => {
      const table = fixture.nativeElement.querySelector('.candidates-table');
      expect(table).toBeTruthy();
    });

    it('should display correct number of rows', () => {
      const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
      expect(rows.length).toBe(mockCandidates.length);
    });

    it('should display candidate data correctly', () => {
      const firstRow = fixture.nativeElement.querySelector('tr.mat-mdc-row');
      const cells = firstRow.querySelectorAll('td');

      expect(cells[0]?.textContent?.trim()).toBe('John');
      expect(cells[1]?.textContent?.trim()).toBe('Doe');
      expect(cells[3]?.textContent?.trim()).toBe('5');
    });
  });

  describe('Seniority Styling', () => {
    it('should return correct class for junior seniority', () => {
      expect(component.getSeniorityClass('junior')).toBe('seniority-junior');
      expect(component.getSeniorityClass('JUNIOR')).toBe('seniority-junior');
    });

    it('should return correct class for senior seniority', () => {
      expect(component.getSeniorityClass('senior')).toBe('seniority-senior');
      expect(component.getSeniorityClass('SENIOR')).toBe('seniority-senior');
    });

    it('should return default class for unknown seniority', () => {
      expect(component.getSeniorityClass('unknown')).toBe('seniority-default');
    });
  });

  describe('Availability Display', () => {
    it('should return correct icon for available candidate', () => {
      expect(component.getAvailabilityIcon(true)).toBe('check_circle');
    });

    it('should return correct icon for unavailable candidate', () => {
      expect(component.getAvailabilityIcon(false)).toBe('cancel');
    });

    it('should return correct class for available candidate', () => {
      expect(component.getAvailabilityClass(true)).toBe('availability-yes');
    });

    it('should return correct class for unavailable candidate', () => {
      expect(component.getAvailabilityClass(false)).toBe('availability-no');
    });
  });
});

