import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateEntity, CandidateRepository } from './infrastructure/persistence';
import { ExcelParserService } from './infrastructure/services';
import { CandidateController } from './infrastructure/http';
import { CreateCandidateUseCase, GetAllCandidatesUseCase } from './application/use-cases';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateEntity])],
  controllers: [CandidateController],
  providers: [
    // Use Cases
    CreateCandidateUseCase,
    GetAllCandidatesUseCase,
    
    // Infrastructure adapters
    {
      provide: 'ICandidateRepository',
      useClass: CandidateRepository,
    },
    {
      provide: 'IExcelParserService',
      useClass: ExcelParserService,
    },
  ],
})
export class CandidateModule {}

