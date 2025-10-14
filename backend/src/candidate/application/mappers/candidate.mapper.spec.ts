import { Candidate, CandidatePrimitives } from '../../domain';
import { CandidateMapper } from './candidate.mapper';
import { CandidateResponseDto } from '../dto';

describe('CandidateMapper', () => {
  describe('toResponseDto', () => {
    it('should map Candidate entity to CandidateResponseDto', () => {
      const candidate = Candidate.create(
        'John',
        'Doe',
        'junior',
        2,
        true,
      );

      const dto = CandidateMapper.toResponseDto(candidate);

      expect(dto).toBeInstanceOf(Object);
      expect(dto.id).toBe(candidate.id);
      expect(dto.name).toBe('John');
      expect(dto.surname).toBe('Doe');
      expect(dto.seniority).toBe('junior');
      expect(dto.years).toBe(2);
      expect(dto.availability).toBe(true);
      expect(dto.createdAt).toBe(candidate.createdAt);
    });

    it('should map senior candidate correctly', () => {
      const candidate = Candidate.create(
        'Jane',
        'Smith',
        'senior',
        10,
        false,
      );

      const dto = CandidateMapper.toResponseDto(candidate);

      expect(dto.seniority).toBe('senior');
      expect(dto.years).toBe(10);
      expect(dto.availability).toBe(false);
    });

    it('should map candidate with 0 years of experience', () => {
      const candidate = Candidate.create(
        'Alice',
        'Brown',
        'junior',
        0,
        true,
      );

      const dto = CandidateMapper.toResponseDto(candidate);

      expect(dto.years).toBe(0);
    });

    it('should preserve all required fields', () => {
      const candidate = Candidate.create(
        'Bob',
        'Johnson',
        'senior',
        15,
        false,
      );

      const dto = CandidateMapper.toResponseDto(candidate);

      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('name');
      expect(dto).toHaveProperty('surname');
      expect(dto).toHaveProperty('seniority');
      expect(dto).toHaveProperty('years');
      expect(dto).toHaveProperty('availability');
      expect(dto).toHaveProperty('createdAt');
    });
  });

  describe('toResponseDtoFromPrimitives', () => {
    it('should map CandidatePrimitives to CandidateResponseDto', () => {
      const primitives: CandidatePrimitives = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John',
        surname: 'Doe',
        seniority: 'junior',
        years: 3,
        availability: true,
        createdAt: new Date('2024-01-15'),
      };

      const dto = CandidateMapper.toResponseDtoFromPrimitives(primitives);

      expect(dto.id).toBe(primitives.id);
      expect(dto.name).toBe(primitives.name);
      expect(dto.surname).toBe(primitives.surname);
      expect(dto.seniority).toBe(primitives.seniority);
      expect(dto.years).toBe(primitives.years);
      expect(dto.availability).toBe(primitives.availability);
      expect(dto.createdAt).toBe(primitives.createdAt);
    });

    it('should handle senior seniority from primitives', () => {
      const primitives: CandidatePrimitives = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Jane',
        surname: 'Smith',
        seniority: 'senior',
        years: 20,
        availability: false,
        createdAt: new Date('2024-02-20'),
      };

      const dto = CandidateMapper.toResponseDtoFromPrimitives(primitives);

      expect(dto.seniority).toBe('senior');
      expect(dto.availability).toBe(false);
    });
  });

  describe('toResponseDtoArray', () => {
    it('should map empty array to empty array', () => {
      const candidates: Candidate[] = [];

      const dtos = CandidateMapper.toResponseDtoArray(candidates);

      expect(dtos).toEqual([]);
      expect(dtos).toHaveLength(0);
    });

    it('should map single candidate array', () => {
      const candidate = Candidate.create('John', 'Doe', 'junior', 2, true);
      const candidates = [candidate];

      const dtos = CandidateMapper.toResponseDtoArray(candidates);

      expect(dtos).toHaveLength(1);
      expect(dtos[0].name).toBe('John');
      expect(dtos[0].surname).toBe('Doe');
    });

    it('should map multiple candidates array', () => {
      const candidate1 = Candidate.create('John', 'Doe', 'junior', 2, true);
      const candidate2 = Candidate.create('Jane', 'Smith', 'senior', 10, false);
      const candidate3 = Candidate.create('Bob', 'Johnson', 'junior', 1, true);
      const candidates = [candidate1, candidate2, candidate3];

      const dtos = CandidateMapper.toResponseDtoArray(candidates);

      expect(dtos).toHaveLength(3);
      
      expect(dtos[0].name).toBe('John');
      expect(dtos[0].seniority).toBe('junior');
      
      expect(dtos[1].name).toBe('Jane');
      expect(dtos[1].seniority).toBe('senior');
      
      expect(dtos[2].name).toBe('Bob');
      expect(dtos[2].years).toBe(1);
    });

    it('should preserve order of candidates', () => {
      const candidates = [
        Candidate.create('Alice', 'A', 'junior', 1, true),
        Candidate.create('Bob', 'B', 'senior', 5, false),
        Candidate.create('Charlie', 'C', 'junior', 3, true),
      ];

      const dtos = CandidateMapper.toResponseDtoArray(candidates);

      expect(dtos[0].name).toBe('Alice');
      expect(dtos[1].name).toBe('Bob');
      expect(dtos[2].name).toBe('Charlie');
    });

    it('should map all properties correctly for each candidate', () => {
      const candidates = [
        Candidate.create('John', 'Doe', 'junior', 2, true),
        Candidate.create('Jane', 'Smith', 'senior', 10, false),
      ];

      const dtos = CandidateMapper.toResponseDtoArray(candidates);

      dtos.forEach((dto, index) => {
        expect(dto).toHaveProperty('id');
        expect(dto).toHaveProperty('name');
        expect(dto).toHaveProperty('surname');
        expect(dto).toHaveProperty('seniority');
        expect(dto).toHaveProperty('years');
        expect(dto).toHaveProperty('availability');
        expect(dto).toHaveProperty('createdAt');
        expect(dto.id).toBe(candidates[index].id);
      });
    });
  });

  describe('DTO structure validation', () => {
    it('should create DTO with correct TypeScript types', () => {
      const candidate = Candidate.create('John', 'Doe', 'junior', 5, true);
      const dto = CandidateMapper.toResponseDto(candidate);

      expect(typeof dto.id).toBe('string');
      expect(typeof dto.name).toBe('string');
      expect(typeof dto.surname).toBe('string');
      expect(typeof dto.seniority).toBe('string');
      expect(['junior', 'senior']).toContain(dto.seniority);
      expect(typeof dto.years).toBe('number');
      expect(typeof dto.availability).toBe('boolean');
      expect(dto.createdAt).toBeInstanceOf(Date);
    });
  });
});

