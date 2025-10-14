import { DomainException } from './domain.exception';

export class InvalidCandidateException extends DomainException {
  constructor(message: string) {
    super(`Invalid candidate: ${message}`);
  }
}
