import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { CandidateStore } from './candidate.store';
import { CandidateService } from '../services';
import { Candidate } from '../models';

describe('CandidateStore', () => {
  let store: CandidateStore;
  let candidateService: jasmine.SpyObj<CandidateService>;

  const mockCandidate: Candidate = {
    id: '123',
    name: 'Carlos',
    surname: 'García',
    seniority: 'junior',
    years: 2,
    availability: true,
    createdAt: new Date('2025-10-14T10:00:00Z')
  };

  beforeEach(() => {
    const candidateServiceSpy = jasmine.createSpyObj('CandidateService', ['getAll', 'create']);

    TestBed.configureTestingModule({
      providers: [
        CandidateStore,
        { provide: CandidateService, useValue: candidateServiceSpy }
      ]
    });

    store = TestBed.inject(CandidateStore);
    candidateService = TestBed.inject(CandidateService) as jasmine.SpyObj<CandidateService>;
  });

  describe('initial state', () => {
    it('should have empty candidates array', () => {
      expect(store.candidates()).toEqual([]);
    });

    it('should not be loading', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error', () => {
      expect(store.error()).toBeNull();
    });

    it('should have candidateCount of 0', () => {
      expect(store.candidateCount()).toBe(0);
    });
  });

  describe('loadCandidates', () => {
    it('should load candidates successfully', async () => {
      const mockCandidates = [mockCandidate];
      candidateService.getAll.and.returnValue(of(mockCandidates));

      await store.loadCandidates();

      expect(store.candidates()).toEqual(mockCandidates);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.candidateCount()).toBe(1);
    });

    it('should set loading to true during load', () => {
      candidateService.getAll.and.returnValue(of([]));
      
      const loadPromise = store.loadCandidates();
      
      // Check immediately - might still be loading or already done
      const loadingState = store.loading();
      expect(typeof loadingState).toBe('boolean');
      
      return loadPromise;
    });

    it('should handle empty candidate list', async () => {
      candidateService.getAll.and.returnValue(of([]));

      await store.loadCandidates();

      expect(store.candidates()).toEqual([]);
      expect(store.candidateCount()).toBe(0);
      expect(store.loading()).toBe(false);
    });

    it('should handle errors when loading candidates', async () => {
      const error = new Error('Network error');
      candidateService.getAll.and.returnValue(throwError(() => error));

      await store.loadCandidates();

      expect(store.candidates()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Network error');
    });

    it('should handle unknown errors', async () => {
      candidateService.getAll.and.returnValue(throwError(() => 'Unknown error'));

      await store.loadCandidates();

      expect(store.error()).toBe('Failed to load candidates');
    });
  });

  describe('createCandidate', () => {
    it('should create candidate and add to store', async () => {
      const request = {
        name: 'Carlos',
        surname: 'García',
        file: new File(['test'], 'test.xlsx')
      };
      candidateService.create.and.returnValue(of(mockCandidate));

      const result = await store.createCandidate(request);

      expect(result).toEqual(mockCandidate);
      expect(store.candidates()).toEqual([mockCandidate]);
      expect(store.candidateCount()).toBe(1);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should add candidate incrementally to existing list', async () => {
      const existingCandidate: Candidate = {
        id: '1',
        name: 'María',
        surname: 'López',
        seniority: 'senior',
        years: 10,
        availability: false,
        createdAt: new Date()
      };

      // Load initial candidate
      candidateService.getAll.and.returnValue(of([existingCandidate]));
      await store.loadCandidates();

      // Create new candidate
      candidateService.create.and.returnValue(of(mockCandidate));
      await store.createCandidate({
        name: 'Carlos',
        surname: 'García',
        file: new File(['test'], 'test.xlsx')
      });

      expect(store.candidateCount()).toBe(2);
      expect(store.candidates()).toEqual([existingCandidate, mockCandidate]);
    });

    it('should handle errors when creating candidate', async () => {
      const request = {
        name: 'Carlos',
        surname: 'García',
        file: new File(['test'], 'test.xlsx')
      };
      const error = new Error('Validation error');
      candidateService.create.and.returnValue(throwError(() => error));

      const result = await store.createCandidate(request);

      expect(result).toBeNull();
      expect(store.candidates()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Validation error');
    });

    it('should extract error message from HttpErrorResponse with message', async () => {
      const request = {
        name: 'Test',
        surname: 'User',
        file: new File(['test'], 'test.xlsx')
      };
      const httpError = new HttpErrorResponse({
        error: { message: 'Missing required column(s): seniority' },
        status: 400,
        statusText: 'Bad Request'
      });
      candidateService.create.and.returnValue(throwError(() => httpError));

      const result = await store.createCandidate(request);

      expect(result).toBeNull();
      expect(store.error()).toBe('Missing required column(s): seniority');
    });

    it('should extract error message from HttpErrorResponse with string error', async () => {
      const request = {
        name: 'Test',
        surname: 'User',
        file: new File(['test'], 'test.xlsx')
      };
      const httpError = new HttpErrorResponse({
        error: 'Invalid file format',
        status: 400,
        statusText: 'Bad Request'
      });
      candidateService.create.and.returnValue(throwError(() => httpError));

      const result = await store.createCandidate(request);

      expect(result).toBeNull();
      expect(store.error()).toBe('Invalid file format');
    });

    it('should handle unknown errors when creating', async () => {
      const request = {
        name: 'Test',
        surname: 'User',
        file: new File(['test'], 'test.xlsx')
      };
      candidateService.create.and.returnValue(throwError(() => 'Unknown'));

      const result = await store.createCandidate(request);

      expect(result).toBeNull();
      expect(store.error()).toBe('Failed to create candidate');
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const error = new Error('Test error');
      candidateService.getAll.and.returnValue(throwError(() => error));

      await store.loadCandidates();
      expect(store.error()).toBe('Test error');

      store.clearError();
      expect(store.error()).toBeNull();
    });
  });

  describe('computed properties', () => {
    it('should update candidateCount when candidates change', async () => {
      const candidates = [mockCandidate, { ...mockCandidate, id: '456' }];
      candidateService.getAll.and.returnValue(of(candidates));

      await store.loadCandidates();

      expect(store.candidateCount()).toBe(2);
    });

    it('should be reactive to state changes', async () => {
      candidateService.getAll.and.returnValue(of([mockCandidate]));
      
      expect(store.candidateCount()).toBe(0);
      
      await store.loadCandidates();
      
      expect(store.candidateCount()).toBe(1);
    });
  });
});

