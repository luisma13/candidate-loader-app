import { Test, TestingModule } from '@nestjs/testing';
import { GetAllCandidatesUseCase } from './get-all-candidates.use-case';
import { ICandidateRepository } from '../interfaces/candidate-repository.interface';
import { Candidate } from '../../domain';

describe('GetAllCandidatesUseCase', () => {
  let useCase: GetAllCandidatesUseCase;
  let mockRepository: jest.Mocked<ICandidateRepository>;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllCandidatesUseCase,
        {
          provide: 'ICandidateRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAllCandidatesUseCase>(GetAllCandidatesUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return empty array when no candidates exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return all candidates as DTOs', async () => {
      const candidate1 = Candidate.create('Carlos', 'García', 'junior', 2, true);
      const candidate2 = Candidate.create('María', 'López', 'senior', 10, false);
      const candidate3 = Candidate.create('Pedro', 'Martínez', 'junior', 0, true);

      mockRepository.findAll.mockResolvedValue([candidate1, candidate2, candidate3]);

      const result = await useCase.execute();

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: candidate1.id,
        name: 'Carlos',
        surname: 'García',
        seniority: 'junior',
        years: 2,
        availability: true,
        createdAt: candidate1.createdAt,
      });
      expect(result[1]).toEqual({
        id: candidate2.id,
        name: 'María',
        surname: 'López',
        seniority: 'senior',
        years: 10,
        availability: false,
        createdAt: candidate2.createdAt,
      });
      expect(result[2]).toEqual({
        id: candidate3.id,
        name: 'Pedro',
        surname: 'Martínez',
        seniority: 'junior',
        years: 0,
        availability: true,
        createdAt: candidate3.createdAt,
      });
    });

    it('should return single candidate correctly', async () => {
      const candidate = Candidate.create('Ana', 'Fernández', 'senior', 15, false);

      mockRepository.findAll.mockResolvedValue([candidate]);

      const result = await useCase.execute();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Ana');
      expect(result[0].surname).toBe('Fernández');
      expect(result[0].seniority).toBe('senior');
      expect(result[0].years).toBe(15);
      expect(result[0].availability).toBe(false);
    });

    it('should propagate repository errors', async () => {
      mockRepository.findAll.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute()).rejects.toThrow('Database connection failed');
    });

    it('should preserve candidate order from repository', async () => {
      const candidates = [
        Candidate.create('First', 'User', 'junior', 1, true),
        Candidate.create('Second', 'User', 'senior', 5, false),
        Candidate.create('Third', 'User', 'junior', 3, true),
      ];

      mockRepository.findAll.mockResolvedValue(candidates);

      const result = await useCase.execute();

      expect(result[0].name).toBe('First');
      expect(result[1].name).toBe('Second');
      expect(result[2].name).toBe('Third');
    });

    it('should map all candidate properties correctly', async () => {
      const candidate = Candidate.create('Test', 'User', 'junior', 5, true);

      mockRepository.findAll.mockResolvedValue([candidate]);

      const result = await useCase.execute();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('surname');
      expect(result[0]).toHaveProperty('seniority');
      expect(result[0]).toHaveProperty('years');
      expect(result[0]).toHaveProperty('availability');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0].id).toBe(candidate.id);
    });
  });
});

