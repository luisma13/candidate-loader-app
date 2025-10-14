import { InvalidYearsException } from '../exceptions/invalid-years.exception';

export class YearsExperience {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number): YearsExperience {
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      throw new InvalidYearsException(value);
    }
    return new YearsExperience(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: YearsExperience): boolean {
    return this.value === other.value;
  }
}
