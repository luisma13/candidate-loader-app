import { Candidate, CandidatePrimitives } from './candidate.entity';
import { Seniority } from '../value-objects/seniority.vo';
import { YearsExperience } from '../value-objects/years-experience.vo';
import { InvalidCandidateException } from '../exceptions/invalid-candidate.exception';

describe('Candidate Entity', () => {
  describe('create', () => {
    it('should create a valid candidate with junior seniority', () => {
      const candidate = Candidate.create(
        'John',
        'Doe',
        'junior',
        2,
        true,
      );

      expect(candidate).toBeInstanceOf(Candidate);
      expect(candidate.name).toBe('John');
      expect(candidate.surname).toBe('Doe');
      expect(candidate.seniority).toBe('junior');
      expect(candidate.years).toBe(2);
      expect(candidate.availability).toBe(true);
      expect(candidate.id).toBeDefined();
      expect(candidate.createdAt).toBeInstanceOf(Date);
    });

    it('should create a valid candidate with senior seniority', () => {
      const candidate = Candidate.create(
        'Jane',
        'Smith',
        'senior',
        10,
        false,
      );

      expect(candidate).toBeInstanceOf(Candidate);
      expect(candidate.seniority).toBe('senior');
      expect(candidate.years).toBe(10);
      expect(candidate.availability).toBe(false);
    });

    it('should create a candidate with 0 years of experience', () => {
      const candidate = Candidate.create(
        'Alice',
        'Brown',
        'junior',
        0,
        true,
      );

      expect(candidate.years).toBe(0);
    });

    it('should throw InvalidSeniorityException for invalid seniority', () => {
      expect(() => {
        Candidate.create('John', 'Doe', 'intermediate', 5, true);
      }).toThrow();
    });

    it('should throw InvalidYearsException for negative years', () => {
      expect(() => {
        Candidate.create('John', 'Doe', 'junior', -1, true);
      }).toThrow();
    });
  });

  describe('constructor validation', () => {
    it('should throw InvalidCandidateException for empty id', () => {
      const seniority = Seniority.create('junior');
      const years = YearsExperience.create(5);

      expect(() => {
        new Candidate('', 'John', 'Doe', seniority, years, true, new Date());
      }).toThrow(InvalidCandidateException);
    });

    it('should throw InvalidCandidateException for empty name', () => {
      const seniority = Seniority.create('junior');
      const years = YearsExperience.create(5);

      expect(() => {
        new Candidate('123', '', 'Doe', seniority, years, true, new Date());
      }).toThrow(InvalidCandidateException);
    });

    it('should throw InvalidCandidateException for whitespace-only name', () => {
      const seniority = Seniority.create('junior');
      const years = YearsExperience.create(5);

      expect(() => {
        new Candidate('123', '   ', 'Doe', seniority, years, true, new Date());
      }).toThrow(InvalidCandidateException);
    });

    it('should throw InvalidCandidateException for empty surname', () => {
      const seniority = Seniority.create('junior');
      const years = YearsExperience.create(5);

      expect(() => {
        new Candidate('123', 'John', '', seniority, years, true, new Date());
      }).toThrow(InvalidCandidateException);
    });

    it('should throw InvalidCandidateException for whitespace-only surname', () => {
      const seniority = Seniority.create('junior');
      const years = YearsExperience.create(5);

      expect(() => {
        new Candidate('123', 'John', '   ', seniority, years, true, new Date());
      }).toThrow(InvalidCandidateException);
    });

    it('should throw InvalidCandidateException for non-boolean availability', () => {
      const seniority = Seniority.create('junior');
      const years = YearsExperience.create(5);

      expect(() => {
        new Candidate('123', 'John', 'Doe', seniority, years, 'yes' as any, new Date());
      }).toThrow(InvalidCandidateException);
    });

    it('should throw InvalidCandidateException for invalid createdAt', () => {
      const seniority = Seniority.create('junior');
      const years = YearsExperience.create(5);

      expect(() => {
        new Candidate('123', 'John', 'Doe', seniority, years, true, 'invalid' as any);
      }).toThrow(InvalidCandidateException);
    });
  });

  describe('toPrimitives', () => {
    it('should convert candidate to primitives object', () => {
      const candidate = Candidate.create(
        'John',
        'Doe',
        'senior',
        15,
        false,
      );

      const primitives = candidate.toPrimitives();

      expect(primitives).toEqual({
        id: candidate.id,
        name: 'John',
        surname: 'Doe',
        seniority: 'senior',
        years: 15,
        availability: false,
        createdAt: candidate.createdAt,
      });
    });
  });

  describe('getters', () => {
    it('should return correct values through getters', () => {
      const candidate = Candidate.create(
        'Alice',
        'Johnson',
        'junior',
        3,
        true,
      );

      expect(candidate.name).toBe('Alice');
      expect(candidate.surname).toBe('Johnson');
      expect(candidate.seniority).toBe('junior');
      expect(candidate.years).toBe(3);
      expect(candidate.availability).toBe(true);
      expect(typeof candidate.id).toBe('string');
      expect(candidate.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('UUID generation', () => {
    it('should generate unique IDs for different candidates', () => {
      const candidate1 = Candidate.create('John', 'Doe', 'junior', 2, true);
      const candidate2 = Candidate.create('Jane', 'Doe', 'senior', 5, false);

      expect(candidate1.id).not.toBe(candidate2.id);
    });

    it('should generate valid UUID format', () => {
      const candidate = Candidate.create('John', 'Doe', 'junior', 2, true);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(candidate.id).toMatch(uuidRegex);
    });
  });

  describe('fromPrimitives', () => {
    it('should create candidate from primitives with preserved ID and date', () => {
      const primitives: CandidatePrimitives = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Carlos',
        surname: 'García',
        seniority: 'junior',
        years: 3,
        availability: true,
        createdAt: new Date('2024-01-15T10:00:00Z'),
      };

      const candidate = Candidate.fromPrimitives(primitives);

      expect(candidate).toBeInstanceOf(Candidate);
      expect(candidate.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(candidate.name).toBe('Carlos');
      expect(candidate.surname).toBe('García');
      expect(candidate.seniority).toBe('junior');
      expect(candidate.years).toBe(3);
      expect(candidate.availability).toBe(true);
      expect(candidate.createdAt).toEqual(new Date('2024-01-15T10:00:00Z'));
    });

    it('should create senior candidate from primitives', () => {
      const primitives: CandidatePrimitives = {
        id: 'test-id-123',
        name: 'María',
        surname: 'López',
        seniority: 'senior',
        years: 10,
        availability: false,
        createdAt: new Date('2024-02-20T15:30:00Z'),
      };

      const candidate = Candidate.fromPrimitives(primitives);

      expect(candidate.seniority).toBe('senior');
      expect(candidate.years).toBe(10);
      expect(candidate.availability).toBe(false);
    });

    it('should throw InvalidSeniorityException for invalid seniority in primitives', () => {
      const primitives: CandidatePrimitives = {
        id: 'test-id',
        name: 'Test',
        surname: 'User',
        seniority: 'intermediate' as any,
        years: 5,
        availability: true,
        createdAt: new Date(),
      };

      expect(() => {
        Candidate.fromPrimitives(primitives);
      }).toThrow();
    });

    it('should throw InvalidYearsException for negative years in primitives', () => {
      const primitives: CandidatePrimitives = {
        id: 'test-id',
        name: 'Test',
        surname: 'User',
        seniority: 'junior',
        years: -1,
        availability: true,
        createdAt: new Date(),
      };

      expect(() => {
        Candidate.fromPrimitives(primitives);
      }).toThrow();
    });
  });
});

