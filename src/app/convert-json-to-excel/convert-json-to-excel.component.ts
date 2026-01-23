import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ConvertJsonToExcelService } from './convert-json-to-excel.service';

@Component({
  selector: 'app-convert-json-to-excel',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './convert-Json-to-Excel.component.html',
  styleUrls: ['./convert-json-to-excel.component.scss']
})
export class ConvertJsonToExcelComponent {
  selectedFiles: File[] = [];
  isProcessing = false;
  errorMessage = '';
  successMessage = '';
  outputFormat: 'xlsx' | 'csv' = 'xlsx';

  constructor(private convertService: ConvertJsonToExcelService) {}

  /**
   * Gère la sélection de fichiers
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  /**
   * Change le format de sortie
   */
  onFormatChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.outputFormat = select.value as 'xlsx' | 'csv';
  }

  /**
   * Convertit et fusionne les fichiers
   */
  async convertFiles(): Promise<void> {
    if (this.selectedFiles.length === 0) {
      this.errorMessage = 'Veuillez sélectionner au moins un fichier JSON';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const result = await this.convertService.mergeJsonToExcel(this.selectedFiles, this.outputFormat);
      this.convertService.downloadFile(result);
      this.successMessage = `Fichier ${this.outputFormat.toUpperCase()} généré avec succès!`;
      this.selectedFiles = [];
    } catch (error: any) {
      this.errorMessage = error.message || 'Une erreur est survenue';
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Réinitialise le formulaire
   */
  reset(): void {
    this.selectedFiles = [];
    this.errorMessage = '';
    this.successMessage = '';
    this.outputFormat = 'xlsx';
  }
}
