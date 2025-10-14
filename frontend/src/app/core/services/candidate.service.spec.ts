import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CandidateService } from './candidate.service';
import { CandidateResponse } from '../models';

describe('CandidateService', () => {
  let service: CandidateService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/candidates';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CandidateService
      ]
    });

    service = TestBed.inject(CandidateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('create', () => {
    it('should create a candidate with FormData', (done) => {
      const mockFile = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const request = {
        name: 'Carlos',
        surname: 'García',
        file: mockFile
      };

      const mockResponse: CandidateResponse = {
        id: '123',
        name: 'Carlos',
        surname: 'García',
        seniority: 'junior',
        years: 2,
        availability: true,
        createdAt: '2025-10-14T10:00:00Z'
      };

      service.create(request).subscribe(candidate => {
        expect(candidate.id).toBe('123');
        expect(candidate.name).toBe('Carlos');
        expect(candidate.surname).toBe('García');
        expect(candidate.seniority).toBe('junior');
        expect(candidate.years).toBe(2);
        expect(candidate.availability).toBe(true);
        expect(candidate.createdAt).toBeInstanceOf(Date);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush(mockResponse);
    });

    it('should map createdAt string to Date object', (done) => {
      const mockFile = new File(['test'], 'test.xlsx');
      const request = { name: 'María', surname: 'López', file: mockFile };
      
      const mockResponse: CandidateResponse = {
        id: '456',
        name: 'María',
        surname: 'López',
        seniority: 'senior',
        years: 10,
        availability: false,
        createdAt: '2025-10-14T15:30:00Z'
      };

      service.create(request).subscribe(candidate => {
        expect(candidate.createdAt).toBeInstanceOf(Date);
        expect(candidate.createdAt.toISOString()).toBe('2025-10-14T15:30:00.000Z');
        done();
      });

      httpMock.expectOne(apiUrl).flush(mockResponse);
    });
  });

  describe('getAll', () => {
    it('should get all candidates', (done) => {
      const mockResponses: CandidateResponse[] = [
        {
          id: '1',
          name: 'Carlos',
          surname: 'García',
          seniority: 'junior',
          years: 2,
          availability: true,
          createdAt: '2025-10-14T10:00:00Z'
        },
        {
          id: '2',
          name: 'María',
          surname: 'López',
          seniority: 'senior',
          years: 10,
          availability: false,
          createdAt: '2025-10-14T11:00:00Z'
        }
      ];

      service.getAll().subscribe(candidates => {
        expect(candidates.length).toBe(2);
        expect(candidates[0].id).toBe('1');
        expect(candidates[0].name).toBe('Carlos');
        expect(candidates[0].createdAt).toBeInstanceOf(Date);
        expect(candidates[1].id).toBe('2');
        expect(candidates[1].name).toBe('María');
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponses);
    });

    it('should return empty array when no candidates exist', (done) => {
      service.getAll().subscribe(candidates => {
        expect(candidates).toEqual([]);
        done();
      });

      httpMock.expectOne(apiUrl).flush([]);
    });

    it('should map all createdAt dates correctly', (done) => {
      const mockResponses: CandidateResponse[] = [
        {
          id: '1',
          name: 'Test',
          surname: 'User',
          seniority: 'junior',
          years: 0,
          availability: true,
          createdAt: '2025-10-14T10:00:00Z'
        }
      ];

      service.getAll().subscribe(candidates => {
        expect(candidates[0].createdAt).toBeInstanceOf(Date);
        done();
      });

      httpMock.expectOne(apiUrl).flush(mockResponses);
    });
  });
});

