import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../../domain';
import type { ICandidateRepository } from '../../application/interfaces';
import { CandidateEntity } from './candidate.entity';

@Injectable()
export class CandidateRepository implements ICandidateRepository {
  constructor(
    @InjectRepository(CandidateEntity)
    private readonly repository: Repository<CandidateEntity>,
  ) {}

  async save(candidate: Candidate): Promise<Candidate> {
    const primitives = candidate.toPrimitives();
    
    const entity = this.repository.create({
      id: primitives.id,
      name: primitives.name,
      surname: primitives.surname,
      seniority: primitives.seniority,
      years: primitives.years,
      availability: primitives.availability,
      createdAt: primitives.createdAt,
    });

    const savedEntity = await this.repository.save(entity);
    
    return this.toDomain(savedEntity);
  }

  async findAll(): Promise<Candidate[]> {
    const entities = await this.repository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return entities.map(entity => this.toDomain(entity));
  }

  private toDomain(entity: CandidateEntity): Candidate {
    return Candidate.fromPrimitives({
      id: entity.id,
      name: entity.name,
      surname: entity.surname,
      seniority: entity.seniority,
      years: entity.years,
      availability: entity.availability,
      createdAt: entity.createdAt,
    });
  }
}

