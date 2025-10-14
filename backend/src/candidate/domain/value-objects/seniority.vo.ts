import { InvalidSeniorityException } from '../exceptions/invalid-seniority.exception';

export class Seniority {
  private readonly value: 'junior' | 'senior';

  private constructor(value: 'junior' | 'senior') {
    this.value = value;
  }

  static create(value: string): Seniority {
    if (value !== 'junior' && value !== 'senior') {
      throw new InvalidSeniorityException(value);
    }
    return new Seniority(value);
  }

  getValue(): 'junior' | 'senior' {
    return this.value;
  }

  equals(other: Seniority): boolean {
    return this.value === other.value;
  }
}
