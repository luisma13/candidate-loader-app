import { Candidate, CandidatePrimitives } from '../../domain';
import { CandidateResponseDto } from '../dto';

export class CandidateMapper {
  static toResponseDto(candidate: Candidate): CandidateResponseDto {
    const primitives = candidate.toPrimitives();
    
    return {
      id: primitives.id,
      name: primitives.name,
      surname: primitives.surname,
      seniority: primitives.seniority,
      years: primitives.years,
      availability: primitives.availability,
      createdAt: primitives.createdAt,
    };
  }

  static toResponseDtoArray(candidates: Candidate[]): CandidateResponseDto[] {
    return candidates.map(candidate => this.toResponseDto(candidate));
  }
}

