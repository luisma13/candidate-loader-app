import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as XLSX from 'xlsx';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateController } from './candidate.controller';
import { DomainExceptionFilter } from './domain-exception.filter';
import { CandidateEntity, CandidateRepository } from '../persistence';
import { ExcelParserService } from '../services';
import { CreateCandidateUseCase, GetAllCandidatesUseCase } from '../../application/use-cases';

describe('CandidateController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [CandidateEntity],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([CandidateEntity]),
      ],
      controllers: [CandidateController],
      providers: [
        CreateCandidateUseCase,
        GetAllCandidatesUseCase,
        {
          provide: 'ICandidateRepository',
          useClass: CandidateRepository,
        },
        {
          provide: 'IExcelParserService',
          useClass: ExcelParserService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /candidates', () => {
    it('should create a candidate with junior seniority', () => {
      const excelBuffer = createExcelBuffer([
        { seniority: 'junior', years: 2, availability: true },
      ]);

      return request(app.getHttpServer())
        .post('/candidates')
        .field('name', 'Carlos')
        .field('surname', 'García')
        .attach('file', excelBuffer, 'candidate.xlsx')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Carlos');
          expect(res.body.surname).toBe('García');
          expect(res.body.seniority).toBe('junior');
          expect(res.body.years).toBe(2);
          expect(res.body.availability).toBe(true);
          expect(res.body).toHaveProperty('createdAt');
        });
    });

    it('should create a candidate with senior seniority', () => {
      const excelBuffer = createExcelBuffer([
        { seniority: 'senior', years: 10, availability: false },
      ]);

      return request(app.getHttpServer())
        .post('/candidates')
        .field('name', 'María')
        .field('surname', 'López')
        .attach('file', excelBuffer, 'candidate.xlsx')
        .expect(201)
        .expect((res) => {
          expect(res.body.seniority).toBe('senior');
          expect(res.body.years).toBe(10);
          expect(res.body.availability).toBe(false);
        });
    });

    it('should return 400 for missing name', () => {
      const excelBuffer = createExcelBuffer([
        { seniority: 'junior', years: 2, availability: true },
      ]);

      return request(app.getHttpServer())
        .post('/candidates')
        .field('surname', 'García')
        .attach('file', excelBuffer, 'candidate.xlsx')
        .expect(400);
    });

    it('should return 400 for missing surname', () => {
      const excelBuffer = createExcelBuffer([
        { seniority: 'junior', years: 2, availability: true },
      ]);

      return request(app.getHttpServer())
        .post('/candidates')
        .field('name', 'Carlos')
        .attach('file', excelBuffer, 'candidate.xlsx')
        .expect(400);
    });

    it('should return 400 for invalid seniority in Excel', () => {
      const excelBuffer = createExcelBuffer([
        { seniority: 'intermediate', years: 5, availability: true },
      ]);

      return request(app.getHttpServer())
        .post('/candidates')
        .field('name', 'Carlos')
        .field('surname', 'García')
        .attach('file', excelBuffer, 'candidate.xlsx')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('seniority');
        });
    });

    it('should return 400 for negative years', () => {
      const excelBuffer = createExcelBuffer([
        { seniority: 'junior', years: -1, availability: true },
      ]);

      return request(app.getHttpServer())
        .post('/candidates')
        .field('name', 'Carlos')
        .field('surname', 'García')
        .attach('file', excelBuffer, 'candidate.xlsx')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('negative');
        });
    });

    it('should return 400 for more than one row in Excel', () => {
      const excelBuffer = createExcelBuffer([
        { seniority: 'junior', years: 2, availability: true },
        { seniority: 'senior', years: 10, availability: false },
      ]);

      return request(app.getHttpServer())
        .post('/candidates')
        .field('name', 'Carlos')
        .field('surname', 'García')
        .attach('file', excelBuffer, 'candidate.xlsx')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('only 1');
        });
    });
  });

  describe('GET /candidates', () => {
    it('should return empty array when no candidates exist', () => {
      return request(app.getHttpServer())
        .get('/candidates')
        .expect(200)
        .expect([]);
    });

    it('should return all candidates', async () => {
      // Create first candidate
      const excel1 = createExcelBuffer([
        { seniority: 'junior', years: 2, availability: true },
      ]);
      await request(app.getHttpServer())
        .post('/candidates')
        .field('name', 'Carlos')
        .field('surname', 'García')
        .attach('file', excel1, 'candidate1.xlsx');

      // Create second candidate
      const excel2 = createExcelBuffer([
        { seniority: 'senior', years: 10, availability: false },
      ]);
      await request(app.getHttpServer())
        .post('/candidates')
        .field('name', 'María')
        .field('surname', 'López')
        .attach('file', excel2, 'candidate2.xlsx');

      // Get all candidates
      return request(app.getHttpServer())
        .get('/candidates')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('seniority');
        });
    });
  });
});

// Helper function to create Excel buffer
function createExcelBuffer(data: any[]): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

