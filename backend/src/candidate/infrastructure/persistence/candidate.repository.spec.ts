import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateRepository } from './candidate.repository';
import { CandidateEntity } from './candidate.entity';
import { Candidate } from '../../domain';

describe('CandidateRepository', () => {
  let repository: CandidateRepository;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
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
      providers: [CandidateRepository],
    }).compile();

    repository = module.get<CandidateRepository>(CandidateRepository);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('save', () => {
    it('should save a candidate and return domain entity', async () => {
      const candidate = Candidate.create('Carlos', 'García', 'junior', 2, true);

      const savedCandidate = await repository.save(candidate);

      expect(savedCandidate).toBeInstanceOf(Candidate);
      expect(savedCandidate.name).toBe('Carlos');
      expect(savedCandidate.surname).toBe('García');
      expect(savedCandidate.seniority).toBe('junior');
      expect(savedCandidate.years).toBe(2);
      expect(savedCandidate.availability).toBe(true);
      expect(savedCandidate.id).toBeDefined();
      expect(savedCandidate.createdAt).toBeInstanceOf(Date);
    });

    it('should save a senior candidate', async () => {
      const candidate = Candidate.create('María', 'López', 'senior', 10, false);

      const savedCandidate = await repository.save(candidate);

      expect(savedCandidate.seniority).toBe('senior');
      expect(savedCandidate.years).toBe(10);
      expect(savedCandidate.availability).toBe(false);
    });

    it('should save candidate with 0 years of experience', async () => {
      const candidate = Candidate.create('Pedro', 'Martínez', 'junior', 0, true);

      const savedCandidate = await repository.save(candidate);

      expect(savedCandidate.years).toBe(0);
    });

    it('should persist candidate to database', async () => {
      const candidate = Candidate.create('Ana', 'Fernández', 'senior', 5, true);

      await repository.save(candidate);
      const allCandidates = await repository.findAll();

      expect(allCandidates).toHaveLength(1);
      expect(allCandidates[0].name).toBe('Ana');
    });
  });

  describe('findAll', () => {
    it('should return empty array when no candidates exist', async () => {
      const candidates = await repository.findAll();

      expect(candidates).toEqual([]);
      expect(candidates).toHaveLength(0);
    });

    it('should return all saved candidates', async () => {
      const candidate1 = Candidate.create('Carlos', 'García', 'junior', 2, true);
      const candidate2 = Candidate.create('María', 'López', 'senior', 10, false);
      const candidate3 = Candidate.create('Pedro', 'Martínez', 'junior', 0, true);

      await repository.save(candidate1);
      await repository.save(candidate2);
      await repository.save(candidate3);

      const candidates = await repository.findAll();

      expect(candidates).toHaveLength(3);
      expect(candidates[0]).toBeInstanceOf(Candidate);
      expect(candidates[1]).toBeInstanceOf(Candidate);
      expect(candidates[2]).toBeInstanceOf(Candidate);
    });

    it('should return candidates ordered by createdAt DESC', async () => {
      const candidate1 = Candidate.create('First', 'User', 'junior', 1, true);
      await repository.save(candidate1);
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const candidate2 = Candidate.create('Second', 'User', 'senior', 5, false);
      await repository.save(candidate2);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const candidate3 = Candidate.create('Third', 'User', 'junior', 3, true);
      await repository.save(candidate3);

      const candidates = await repository.findAll();

      expect(candidates[0].name).toBe('Third');
      expect(candidates[1].name).toBe('Second');
      expect(candidates[2].name).toBe('First');
    });

    it('should return candidates with all properties correctly mapped', async () => {
      const candidate = Candidate.create('Test', 'User', 'junior', 5, true);
      await repository.save(candidate);

      const candidates = await repository.findAll();

      expect(candidates[0]).toHaveProperty('id');
      expect(candidates[0]).toHaveProperty('name');
      expect(candidates[0]).toHaveProperty('surname');
      expect(candidates[0]).toHaveProperty('seniority');
      expect(candidates[0]).toHaveProperty('years');
      expect(candidates[0]).toHaveProperty('availability');
      expect(candidates[0]).toHaveProperty('createdAt');
    });
  });

  describe('domain mapping', () => {
    it('should correctly map from domain to entity and back', async () => {
      const originalCandidate = Candidate.create(
        'Integration',
        'Test',
        'senior',
        15,
        false,
      );

      const savedCandidate = await repository.save(originalCandidate);

      expect(savedCandidate.name).toBe(originalCandidate.name);
      expect(savedCandidate.surname).toBe(originalCandidate.surname);
      expect(savedCandidate.seniority).toBe(originalCandidate.seniority);
      expect(savedCandidate.years).toBe(originalCandidate.years);
      expect(savedCandidate.availability).toBe(originalCandidate.availability);
    });

    it('should handle multiple saves correctly', async () => {
      const candidates = [
        Candidate.create('User1', 'Test1', 'junior', 1, true),
        Candidate.create('User2', 'Test2', 'senior', 5, false),
        Candidate.create('User3', 'Test3', 'junior', 2, true),
        Candidate.create('User4', 'Test4', 'senior', 10, false),
        Candidate.create('User5', 'Test5', 'junior', 0, true),
      ];

      for (const candidate of candidates) {
        await repository.save(candidate);
      }

      const allCandidates = await repository.findAll();

      expect(allCandidates).toHaveLength(5);
      allCandidates.forEach(candidate => {
        expect(candidate).toBeInstanceOf(Candidate);
      });
    });
  });
});

