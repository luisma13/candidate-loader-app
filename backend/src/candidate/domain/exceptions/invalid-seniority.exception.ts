import { DomainException } from './domain.exception';

export class InvalidSeniorityException extends DomainException {
  constructor(value: string) {
    super(`Invalid seniority value: ${value}. Must be 'junior' or 'senior'`);
  }
}
