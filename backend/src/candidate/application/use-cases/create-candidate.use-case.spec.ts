import { Test, TestingModule } from '@nestjs/testing';
import { CreateCandidateUseCase } from './create-candidate.use-case';
import { ICandidateRepository } from '../interfaces/candidate-repository.interface';
import { IExcelParserService, ExcelRowData } from '../interfaces/excel-parser.interface';
import { Candidate } from '../../domain';
import { InvalidSeniorityException } from '../../domain/exceptions/invalid-seniority.exception';
import { InvalidYearsException } from '../../domain/exceptions/invalid-years.exception';

describe('CreateCandidateUseCase', () => {
  let useCase: CreateCandidateUseCase;
  let mockRepository: jest.Mocked<ICandidateRepository>;
  let mockExcelParser: jest.Mocked<IExcelParserService>;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
    };

    mockExcelParser = {
      parseFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCandidateUseCase,
        {
          provide: 'ICandidateRepository',
          useValue: mockRepository,
        },
        {
          provide: 'IExcelParserService',
          useValue: mockExcelParser,
        },
      ],
    }).compile();

    useCase = module.get<CreateCandidateUseCase>(CreateCandidateUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a candidate successfully with junior seniority', async () => {
      const excelData: ExcelRowData = {
        seniority: 'junior',
        years: 2,
        availability: true,
      };

      const mockCandidate = Candidate.create('Carlos', 'García', 'junior', 2, true);

      mockExcelParser.parseFile.mockResolvedValue(excelData);
      mockRepository.save.mockResolvedValue(mockCandidate);

      const result = await useCase.execute(
        'Carlos',
        'García',
        Buffer.from('mock-excel-data'),
      );

      expect(mockExcelParser.parseFile).toHaveBeenCalledWith(Buffer.from('mock-excel-data'));
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Carlos',
          surname: 'García',
          seniority: 'junior',
          years: 2,
          availability: true,
        }),
      );
      expect(result).toEqual({
        id: mockCandidate.id,
        name: 'Carlos',
        surname: 'García',
        seniority: 'junior',
        years: 2,
        availability: true,
        createdAt: mockCandidate.createdAt,
      });
    });

    it('should create a candidate successfully with senior seniority', async () => {
      const excelData: ExcelRowData = {
        seniority: 'senior',
        years: 10,
        availability: false,
      };

      const mockCandidate = Candidate.create('María', 'López', 'senior', 10, false);

      mockExcelParser.parseFile.mockResolvedValue(excelData);
      mockRepository.save.mockResolvedValue(mockCandidate);

      const result = await useCase.execute(
        'María',
        'López',
        Buffer.from('mock-excel-data'),
      );

      expect(result.seniority).toBe('senior');
      expect(result.years).toBe(10);
      expect(result.availability).toBe(false);
    });

    it('should create a candidate with 0 years of experience', async () => {
      const excelData: ExcelRowData = {
        seniority: 'junior',
        years: 0,
        availability: true,
      };

      const mockCandidate = Candidate.create('Pedro', 'Martínez', 'junior', 0, true);

      mockExcelParser.parseFile.mockResolvedValue(excelData);
      mockRepository.save.mockResolvedValue(mockCandidate);

      const result = await useCase.execute(
        'Pedro',
        'Martínez',
        Buffer.from('mock-excel-data'),
      );

      expect(result.years).toBe(0);
    });

    it('should throw InvalidSeniorityException for invalid seniority', async () => {
      const excelData: ExcelRowData = {
        seniority: 'intermediate',
        years: 5,
        availability: true,
      };

      mockExcelParser.parseFile.mockResolvedValue(excelData);

      await expect(
        useCase.execute('Carlos', 'García', Buffer.from('mock-excel-data')),
      ).rejects.toThrow(InvalidSeniorityException);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InvalidYearsException for negative years', async () => {
      const excelData: ExcelRowData = {
        seniority: 'junior',
        years: -1,
        availability: true,
      };

      mockExcelParser.parseFile.mockResolvedValue(excelData);

      await expect(
        useCase.execute('Carlos', 'García', Buffer.from('mock-excel-data')),
      ).rejects.toThrow(InvalidYearsException);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should propagate Excel parsing errors', async () => {
      mockExcelParser.parseFile.mockRejectedValue(
        new Error('Invalid Excel format'),
      );

      await expect(
        useCase.execute('Carlos', 'García', Buffer.from('invalid-data')),
      ).rejects.toThrow('Invalid Excel format');

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const excelData: ExcelRowData = {
        seniority: 'junior',
        years: 2,
        availability: true,
      };

      mockExcelParser.parseFile.mockResolvedValue(excelData);
      mockRepository.save.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        useCase.execute('Carlos', 'García', Buffer.from('mock-excel-data')),
      ).rejects.toThrow('Database connection failed');
    });

    it('should call services in correct order', async () => {
      const excelData: ExcelRowData = {
        seniority: 'junior',
        years: 3,
        availability: true,
      };

      const mockCandidate = Candidate.create('Ana', 'Fernández', 'junior', 3, true);

      const callOrder: string[] = [];

      mockExcelParser.parseFile.mockImplementation(async () => {
        callOrder.push('parseFile');
        return excelData;
      });

      mockRepository.save.mockImplementation(async (candidate) => {
        callOrder.push('save');
        return candidate;
      });

      await useCase.execute('Ana', 'Fernández', Buffer.from('mock-excel-data'));

      expect(callOrder).toEqual(['parseFile', 'save']);
    });
  });
});

