import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Candidate, CreateCandidateRequest } from '../models';
import { CandidateService } from '../services';

export interface CandidateState {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
}

const initialState: CandidateState = {
  candidates: [],
  loading: false,
  error: null
};

@Injectable({
  providedIn: 'root'
})
export class CandidateStore {
  private readonly candidateService = inject(CandidateService);

  // State signals
  private readonly state = signal<CandidateState>(initialState);

  // Selectors
  readonly candidates = computed(() => this.state().candidates);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly candidateCount = computed(() => this.state().candidates.length);

  // Actions
  async loadCandidates(): Promise<void> {
    this.updateState({ loading: true, error: null });

    try {
      const candidates = await firstValueFrom(this.candidateService.getAll());
      this.updateState({ candidates: candidates || [], loading: false });
    } catch (error) {
      this.updateState({
        loading: false,
        error: this.extractErrorMessage(error, 'Failed to load candidates')
      });
    }
  }

  async createCandidate(request: CreateCandidateRequest): Promise<Candidate | null> {
    this.updateState({ loading: true, error: null });

    try {
      const newCandidate = await firstValueFrom(this.candidateService.create(request));
      
      if (newCandidate) {
        // Add to existing candidates (incremental storage)
        const updatedCandidates = [...this.state().candidates, newCandidate];
        this.updateState({ 
          candidates: updatedCandidates, 
          loading: false 
        });
        
        return newCandidate;
      }
      
      this.updateState({ loading: false });
      return null;
    } catch (error) {
      this.updateState({
        loading: false,
        error: this.extractErrorMessage(error, 'Failed to create candidate')
      });
      return null;
    }
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  private updateState(partialState: Partial<CandidateState>): void {
    this.state.update(current => ({ ...current, ...partialState }));
  }

  private extractErrorMessage(error: unknown, defaultMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      // Extract backend error message
      if (error.error?.message) {
        return error.error.message;
      }
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (error.message) {
        return error.message;
      }
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return defaultMessage;
  }
}

