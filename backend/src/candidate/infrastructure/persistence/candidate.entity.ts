import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('candidates')
export class CandidateEntity {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 255 })
  surname: string;

  @Column('varchar', { length: 10 })
  seniority: 'junior' | 'senior';

  @Column('integer')
  years: number;

  @Column('boolean')
  availability: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

