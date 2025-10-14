import { Seniority } from './seniority.vo';
import { InvalidSeniorityException } from '../exceptions/invalid-seniority.exception';

describe('Seniority Value Object', () => {
  describe('create', () => {
    it('should create a junior seniority', () => {
      const seniority = Seniority.create('junior');

      expect(seniority).toBeInstanceOf(Seniority);
      expect(seniority.getValue()).toBe('junior');
    });

    it('should create a senior seniority', () => {
      const seniority = Seniority.create('senior');

      expect(seniority).toBeInstanceOf(Seniority);
      expect(seniority.getValue()).toBe('senior');
    });

    it('should throw InvalidSeniorityException for invalid value', () => {
      expect(() => {
        Seniority.create('intermediate');
      }).toThrow(InvalidSeniorityException);
    });

    it('should throw InvalidSeniorityException for empty string', () => {
      expect(() => {
        Seniority.create('');
      }).toThrow(InvalidSeniorityException);
    });

    it('should throw InvalidSeniorityException for uppercase JUNIOR', () => {
      expect(() => {
        Seniority.create('JUNIOR');
      }).toThrow(InvalidSeniorityException);
    });

    it('should throw InvalidSeniorityException for mixed case Senior', () => {
      expect(() => {
        Seniority.create('Senior');
      }).toThrow(InvalidSeniorityException);
    });

    it('should throw InvalidSeniorityException for null', () => {
      expect(() => {
        Seniority.create(null as any);
      }).toThrow(InvalidSeniorityException);
    });

    it('should throw InvalidSeniorityException for undefined', () => {
      expect(() => {
        Seniority.create(undefined as any);
      }).toThrow(InvalidSeniorityException);
    });
  });

  describe('equals', () => {
    it('should return true for two junior seniorities', () => {
      const seniority1 = Seniority.create('junior');
      const seniority2 = Seniority.create('junior');

      expect(seniority1.equals(seniority2)).toBe(true);
    });

    it('should return true for two senior seniorities', () => {
      const seniority1 = Seniority.create('senior');
      const seniority2 = Seniority.create('senior');

      expect(seniority1.equals(seniority2)).toBe(true);
    });

    it('should return false for junior and senior seniorities', () => {
      const junior = Seniority.create('junior');
      const senior = Seniority.create('senior');

      expect(junior.equals(senior)).toBe(false);
      expect(senior.equals(junior)).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the correct value for junior', () => {
      const seniority = Seniority.create('junior');

      expect(seniority.getValue()).toBe('junior');
    });

    it('should return the correct value for senior', () => {
      const seniority = Seniority.create('senior');

      expect(seniority.getValue()).toBe('senior');
    });
  });

  describe('immutability', () => {
    it('should be immutable', () => {
      const seniority = Seniority.create('junior');
      const value = seniority.getValue();

      expect(value).toBe('junior');
      expect(seniority.getValue()).toBe('junior'); // Still the same
    });
  });
});

