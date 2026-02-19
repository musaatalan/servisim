import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeminiService, Diagnosis } from '../../services/gemini.service';

@Component({
  selector: 'app-diagnosis-tool',
  templateUrl: './diagnosis-tool.component.html',
  imports: [FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosisToolComponent {
  private geminiService = inject(GeminiService);

  problemDescription = signal<string>('Kombi çalışmıyor, pilot alevi yanmıyor ve ekranda F28 hata kodu görünüyor.');
  diagnosis = signal<Diagnosis | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  async getDiagnosis() {
    if (!this.problemDescription().trim()) {
      this.error.set('Lütfen bir arıza açıklaması girin.');
      return;
    }

    this.isLoading.set(true);
    this.diagnosis.set(null);
    this.error.set(null);

    try {
      const result = await this.geminiService.diagnoseBoilerProblem(this.problemDescription());
      this.diagnosis.set(result);
    } catch (e: any) {
      this.error.set(e.message || 'An unknown error occurred.');
    } finally {
      this.isLoading.set(false);
    }
  }

  updateProblemDescription(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.problemDescription.set(input.value);
  }
}
