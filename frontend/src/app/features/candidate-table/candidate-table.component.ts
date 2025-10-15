import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { CandidateStore } from '../../core/store/candidate.store';
import { Candidate } from '../../core/models/candidate.model';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-candidate-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    ErrorBannerComponent,
  ],
  templateUrl: './candidate-table.component.html',
  styleUrls: ['./candidate-table.component.scss'],
})
export class CandidateTableComponent implements OnInit {
  private readonly store = inject(CandidateStore);

  readonly candidates = this.store.candidates;
  readonly isLoading = this.store.loading;
  readonly error = this.store.loadError;

  readonly displayedColumns: string[] = [
    'name',
    'surname',
    'seniority',
    'years',
    'availability',
  ];

  readonly isEmpty = computed(() => {
    return !this.isLoading() && this.candidates().length === 0;
  });

  ngOnInit(): void {
    this.store.loadCandidates();
  }

  getSeniorityClass(seniority: string): string {
    const seniorityMap: Record<string, string> = {
      junior: 'seniority-junior',
      senior: 'seniority-senior',
    };
    return seniorityMap[seniority.toLowerCase()] || 'seniority-default';
  }

  getAvailabilityIcon(availability: boolean): string {
    return availability ? 'check_circle' : 'cancel';
  }

  getAvailabilityClass(availability: boolean): string {
    return availability ? 'availability-yes' : 'availability-no';
  }
}

