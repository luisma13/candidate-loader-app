import { YearsExperience } from './years-experience.vo';
import { InvalidYearsException } from '../exceptions/invalid-years.exception';

describe('YearsExperience Value Object', () => {
  describe('create', () => {
    it('should create years experience with 0 years', () => {
      const years = YearsExperience.create(0);

      expect(years).toBeInstanceOf(YearsExperience);
      expect(years.getValue()).toBe(0);
    });

    it('should create years experience with positive value', () => {
      const years = YearsExperience.create(5);

      expect(years).toBeInstanceOf(YearsExperience);
      expect(years.getValue()).toBe(5);
    });

    it('should create years experience with large value', () => {
      const years = YearsExperience.create(50);

      expect(years).toBeInstanceOf(YearsExperience);
      expect(years.getValue()).toBe(50);
    });

    it('should throw InvalidYearsException for negative value', () => {
      expect(() => {
        YearsExperience.create(-1);
      }).toThrow(InvalidYearsException);
    });

    it('should throw InvalidYearsException for negative large value', () => {
      expect(() => {
        YearsExperience.create(-100);
      }).toThrow(InvalidYearsException);
    });

    it('should handle decimal values by accepting them', () => {
      const years = YearsExperience.create(2.5);

      expect(years.getValue()).toBe(2.5);
    });
  });

  describe('equals', () => {
    it('should return true for equal years', () => {
      const years1 = YearsExperience.create(5);
      const years2 = YearsExperience.create(5);

      expect(years1.equals(years2)).toBe(true);
    });

    it('should return true for both zero', () => {
      const years1 = YearsExperience.create(0);
      const years2 = YearsExperience.create(0);

      expect(years1.equals(years2)).toBe(true);
    });

    it('should return false for different years', () => {
      const years1 = YearsExperience.create(5);
      const years2 = YearsExperience.create(10);

      expect(years1.equals(years2)).toBe(false);
    });

    it('should return false for 0 and positive value', () => {
      const years1 = YearsExperience.create(0);
      const years2 = YearsExperience.create(1);

      expect(years1.equals(years2)).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the correct value', () => {
      const years = YearsExperience.create(7);

      expect(years.getValue()).toBe(7);
    });

    it('should return 0 for zero years', () => {
      const years = YearsExperience.create(0);

      expect(years.getValue()).toBe(0);
    });
  });

  describe('immutability', () => {
    it('should be immutable', () => {
      const years = YearsExperience.create(5);
      const value = years.getValue();

      expect(value).toBe(5);
      expect(years.getValue()).toBe(5); // Still the same
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      const years = YearsExperience.create(999);

      expect(years.getValue()).toBe(999);
    });

    it('should throw for NaN', () => {
      expect(() => {
        YearsExperience.create(NaN);
      }).toThrow(InvalidYearsException);
    });

    it('should throw for null', () => {
      expect(() => {
        YearsExperience.create(null as any);
      }).toThrow(InvalidYearsException);
    });

    it('should throw for undefined', () => {
      expect(() => {
        YearsExperience.create(undefined as any);
      }).toThrow(InvalidYearsException);
    });
  });
});

