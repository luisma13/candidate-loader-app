import { Component, signal } from '@angular/core';
import { CandidateFormComponent } from './features/candidate-form';
import { CandidateTableComponent } from './features/candidate-table/candidate-table.component';

@Component({
  selector: 'app-root',
  imports: [CandidateFormComponent, CandidateTableComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}
