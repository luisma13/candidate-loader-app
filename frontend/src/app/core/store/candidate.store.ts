import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Candidate, CreateCandidateRequest } from '../models';
import { CandidateService } from '../services';

export interface CandidateState {
  candidates: Candidate[];
  loading: boolean;
  loadError: string | null;
  createError: string | null;
}

const initialState: CandidateState = {
  candidates: [],
  loading: false,
  loadError: null,
  createError: null
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
  readonly loadError = computed(() => this.state().loadError);
  readonly createError = computed(() => this.state().createError);
  readonly candidateCount = computed(() => this.state().candidates.length);

  // Actions
  async loadCandidates(): Promise<void> {
    this.updateState({ loading: true, loadError: null });

    try {
      const candidates = await firstValueFrom(this.candidateService.getAll());
      this.updateState({ candidates: candidates || [], loading: false });
    } catch (error) {
      this.updateState({
        loading: false,
        loadError: this.extractErrorMessage(error, 'Failed to load candidates')
      });
    }
  }

  async createCandidate(request: CreateCandidateRequest): Promise<Candidate | null> {
    this.updateState({ loading: true, createError: null });

    try {
      const newCandidate = await firstValueFrom(this.candidateService.create(request));
      
      if (newCandidate) {
        // Add to existing candidates (incremental storage, newest first)
        const updatedCandidates = [newCandidate, ...this.state().candidates];
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
        createError: this.extractErrorMessage(error, 'Failed to create candidate')
      });
      return null;
    }
  }

  clearLoadError(): void {
    this.updateState({ loadError: null });
  }

  clearCreateError(): void {
    this.updateState({ createError: null });
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

