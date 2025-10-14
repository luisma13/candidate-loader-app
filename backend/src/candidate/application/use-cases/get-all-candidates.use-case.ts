import { Injectable, Inject } from '@nestjs/common';
import type { ICandidateRepository } from '../interfaces/candidate-repository.interface';
import { CandidateResponseDto } from '../dto';
import { CandidateMapper } from '../mappers';

@Injectable()
export class GetAllCandidatesUseCase {
  constructor(
    @Inject('ICandidateRepository')
    private readonly candidateRepository: ICandidateRepository,
  ) {}

  async execute(): Promise<CandidateResponseDto[]> {
    const candidates = await this.candidateRepository.findAll();
    return CandidateMapper.toResponseDtoArray(candidates);
  }
}

