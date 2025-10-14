import { DomainException } from './domain.exception';
import { InvalidCandidateException } from './invalid-candidate.exception';
import { InvalidSeniorityException } from './invalid-seniority.exception';
import { InvalidYearsException } from './invalid-years.exception';

describe('Domain Exceptions', () => {
  describe('InvalidCandidateException', () => {
    it('should create exception with message', () => {
      const exception = new InvalidCandidateException('Name is required');

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(DomainException);
      expect(exception).toBeInstanceOf(InvalidCandidateException);
      expect(exception.message).toBe('Invalid candidate: Name is required');
      expect(exception.name).toBe('InvalidCandidateException');
    });

    it('should be throwable and catchable', () => {
      expect(() => {
        throw new InvalidCandidateException('Invalid data');
      }).toThrow(InvalidCandidateException);
    });
  });

  describe('InvalidSeniorityException', () => {
    it('should create exception with invalid value in message', () => {
      const exception = new InvalidSeniorityException('intermediate');

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(DomainException);
      expect(exception).toBeInstanceOf(InvalidSeniorityException);
      expect(exception.message).toContain('intermediate');
      expect(exception.message).toContain('junior');
      expect(exception.message).toContain('senior');
      expect(exception.name).toBe('InvalidSeniorityException');
    });

    it('should be throwable and catchable', () => {
      expect(() => {
        throw new InvalidSeniorityException('manager');
      }).toThrow(InvalidSeniorityException);
    });
  });

  describe('InvalidYearsException', () => {
    it('should create exception with invalid value in message for negative', () => {
      const exception = new InvalidYearsException(-5);

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(DomainException);
      expect(exception).toBeInstanceOf(InvalidYearsException);
      expect(exception.message).toContain('-5');
      expect(exception.name).toBe('InvalidYearsException');
    });

    it('should be throwable and catchable', () => {
      expect(() => {
        throw new InvalidYearsException(-1);
      }).toThrow(InvalidYearsException);
    });
  });

  describe('Exception hierarchy', () => {
    it('should allow catching specific exceptions', () => {
      try {
        throw new InvalidSeniorityException('test');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidSeniorityException);
        expect(error).toBeInstanceOf(DomainException);
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should allow catching all domain exceptions', () => {
      const exceptions = [
        new InvalidCandidateException('test1'),
        new InvalidSeniorityException('test2'),
        new InvalidYearsException(-1),
      ];

      exceptions.forEach(exception => {
        expect(exception).toBeInstanceOf(DomainException);
      });
    });
  });
});

