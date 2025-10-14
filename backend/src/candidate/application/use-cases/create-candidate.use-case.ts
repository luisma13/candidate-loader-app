import { Injectable, Inject } from '@nestjs/common';
import { Candidate } from '../../domain';
import type { ICandidateRepository } from '../interfaces/candidate-repository.interface';
import type { IExcelParserService } from '../interfaces/excel-parser.interface';
import { CandidateResponseDto } from '../dto';
import { CandidateMapper } from '../mappers';

@Injectable()
export class CreateCandidateUseCase {
  constructor(
    @Inject('ICandidateRepository')
    private readonly candidateRepository: ICandidateRepository,
    @Inject('IExcelParserService')
    private readonly excelParserService: IExcelParserService,
  ) {}

  async execute(
    name: string,
    surname: string,
    excelBuffer: Buffer,
  ): Promise<CandidateResponseDto> {
    // Parse Excel file
    const excelData = await this.excelParserService.parseFile(excelBuffer);

    // Create domain entity
    const candidate = Candidate.create(
      name,
      surname,
      excelData.seniority,
      excelData.years,
      excelData.availability,
    );

    // Persist candidate
    const savedCandidate = await this.candidateRepository.save(candidate);

    // Map to response DTO
    return CandidateMapper.toResponseDto(savedCandidate);
  }
}

