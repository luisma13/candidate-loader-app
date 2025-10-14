export type Seniority = 'junior' | 'senior';

export interface Candidate {
  id: string;
  name: string;
  surname: string;
  seniority: Seniority;
  years: number;
  availability: boolean;
  createdAt: Date;
}

export interface CreateCandidateRequest {
  name: string;
  surname: string;
  file: File;
}

export interface CandidateResponse {
  id: string;
  name: string;
  surname: string;
  seniority: Seniority;
  years: number;
  availability: boolean;
  createdAt: string;
}

