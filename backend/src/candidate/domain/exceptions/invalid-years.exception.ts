import { DomainException } from './domain.exception';

export class InvalidYearsException extends DomainException {
  constructor(value: number) {
    super(`Invalid years of experience: ${value}. Must be a non-negative number`);
  }
}
