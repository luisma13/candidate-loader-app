import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCandidateRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  surname: string;
}

