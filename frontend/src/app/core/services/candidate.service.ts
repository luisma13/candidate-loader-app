import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Candidate, CandidateResponse, CreateCandidateRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/candidates';

  create(request: CreateCandidateRequest): Observable<Candidate> {
    const formData = new FormData();
    formData.append('name', request.name);
    formData.append('surname', request.surname);
    formData.append('file', request.file);

    return this.http
      .post<CandidateResponse>(this.apiUrl, formData)
      .pipe(map(this.mapResponseToCandidate));
  }

  getAll(): Observable<Candidate[]> {
    return this.http
      .get<CandidateResponse[]>(this.apiUrl)
      .pipe(map(responses => responses.map(this.mapResponseToCandidate)));
  }

  private mapResponseToCandidate(response: CandidateResponse): Candidate {
    return {
      ...response,
      createdAt: new Date(response.createdAt)
    };
  }
}

