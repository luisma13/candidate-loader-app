import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCandidateRequestDto, CandidateResponseDto } from '../../application/dto';
import { CreateCandidateUseCase, GetAllCandidatesUseCase } from '../../application/use-cases';

@Controller('candidates')
export class CandidateController {
  constructor(
    private readonly createCandidateUseCase: CreateCandidateUseCase,
    private readonly getAllCandidatesUseCase: GetAllCandidatesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() dto: CreateCandidateRequestDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CandidateResponseDto> {
    if (!file) {
      throw new BadRequestException('Excel file is required');
    }

    return this.createCandidateUseCase.execute(
      dto.name,
      dto.surname,
      file.buffer,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<CandidateResponseDto[]> {
    return this.getAllCandidatesUseCase.execute();
  }
}

