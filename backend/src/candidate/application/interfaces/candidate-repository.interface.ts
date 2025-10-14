import { Candidate } from '../../domain';

export interface ICandidateRepository {
  save(candidate: Candidate): Promise<Candidate>;
  findAll(): Promise<Candidate[]>;
}

