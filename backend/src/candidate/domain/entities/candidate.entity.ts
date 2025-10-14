import { Seniority } from '../value-objects/seniority.vo';
import { YearsExperience } from '../value-objects/years-experience.vo';
import { InvalidCandidateException } from '../exceptions/invalid-candidate.exception';

export interface CandidatePrimitives {
  id: string;
  name: string;
  surname: string;
  seniority: 'junior' | 'senior';
  years: number;
  availability: boolean;
  createdAt: Date;
}

export class Candidate {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _surname: string;
  private readonly _seniority: Seniority;
  private readonly _years: YearsExperience;
  private readonly _availability: boolean;
  private readonly _createdAt: Date;

  constructor(
    id: string,
    name: string,
    surname: string,
    seniority: Seniority,
    years: YearsExperience,
    availability: boolean,
    createdAt: Date,
  ) {
    this.validateConstructorParams(id, name, surname, seniority, years, availability, createdAt);
    
    this._id = id;
    this._name = name;
    this._surname = surname;
    this._seniority = seniority;
    this._years = years;
    this._availability = availability;
    this._createdAt = createdAt;
  }

  static create(
    name: string,
    surname: string,
    seniority: string,
    years: number,
    availability: boolean,
  ): Candidate {
    const id = Candidate.generateUUID();
    const createdAt = new Date();
    const seniorityVO = Seniority.create(seniority);
    const yearsVO = YearsExperience.create(years);

    return new Candidate(id, name, surname, seniorityVO, yearsVO, availability, createdAt);
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get surname(): string {
    return this._surname;
  }

  get seniority(): 'junior' | 'senior' {
    return this._seniority.getValue();
  }

  get years(): number {
    return this._years.getValue();
  }

  get availability(): boolean {
    return this._availability;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  toPrimitives(): CandidatePrimitives {
    return {
      id: this._id,
      name: this._name,
      surname: this._surname,
      seniority: this._seniority.getValue(),
      years: this._years.getValue(),
      availability: this._availability,
      createdAt: this._createdAt,
    };
  }

  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private validateConstructorParams(
    id: string,
    name: string,
    surname: string,
    seniority: Seniority,
    years: YearsExperience,
    availability: boolean,
    createdAt: Date,
  ): void {
    if (!id || typeof id !== 'string') {
      throw new InvalidCandidateException('ID must be a non-empty string');
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new InvalidCandidateException('Name must be a non-empty string');
    }

    if (!surname || typeof surname !== 'string' || surname.trim().length === 0) {
      throw new InvalidCandidateException('Surname must be a non-empty string');
    }

    if (!seniority || !(seniority instanceof Seniority)) {
      throw new InvalidCandidateException('Seniority must be a valid Seniority value object');
    }

    if (!years || !(years instanceof YearsExperience)) {
      throw new InvalidCandidateException('Years must be a valid YearsExperience value object');
    }

    if (typeof availability !== 'boolean') {
      throw new InvalidCandidateException('Availability must be a boolean');
    }

    if (!createdAt || !(createdAt instanceof Date)) {
      throw new InvalidCandidateException('CreatedAt must be a valid Date');
    }
  }
}
