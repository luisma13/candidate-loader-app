import { Injectable, signal, computed, inject } from '@angular/core';
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
        error: error instanceof Error ? error.message : 'Failed to load candidates'
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
        error: error instanceof Error ? error.message : 'Failed to create candidate'
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
}

