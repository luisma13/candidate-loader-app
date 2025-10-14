import { Component, signal } from '@angular/core';
import { CandidateFormComponent } from './features/candidate-form';

@Component({
  selector: 'app-root',
  imports: [CandidateFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}
