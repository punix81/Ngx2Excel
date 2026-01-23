import { Component, effect, inject } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { ConvertJsonToExcelService } from './convert-json-to-excel.service';

// Explicit Angular Material imports (statically analyzable)
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-convert-json-to-excel',
  standalone: true,
  imports: [
    TranslateModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './convert-Json-to-Excel.component.html',
  styleUrls: ['./convert-json-to-excel.component.scss']
})
export class ConvertJsonToExcelComponent {
  selectedFiles: File[] = [];
  successMessage = '';
  outputFormat: 'xlsx' | 'csv' = 'xlsx';
  displayedColumns = ['name', 'size'];

  // Prefer inject() as per lint rule
  public readonly convertService = inject(ConvertJsonToExcelService);

  constructor() {
    // Réagir automatiquement quand un résultat est disponible
    effect(() => {
      const res = this.convertService.result();
      if (res) {
        // Télécharger automatiquement le fichier généré
        try {
          this.convertService.downloadFile(res);
          this.successMessage = `Fichier ${res.fileExtension.toUpperCase()} généré avec succès!`;
          this.selectedFiles = [];
        } finally {
          // Clear result after download
          this.convertService.clearResult();
        }
      }
    });

    // Synchroniser message d'erreur si besoin (optionnel)
    effect(() => {
      const err = this.convertService.error();
      if (err) {
        // nothing else, template can read service.error()
      }
    });
  }

  // Getters pour exposer directement l'état du service
  get isProcessing(): boolean {
    return this.convertService.isProcessing();
  }

  get errorMessage(): string {
    return this.convertService.error();
  }

  get serviceSuccessMessage(): string {
    return this.convertService.success();
  }

  /**
   * Gère la sélection de fichiers
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      // Clear previous messages
      this.convertService.clearResult();
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
   * Convertit et fusionne les fichiers (utilise les signals du service)
   */
  convertFiles(): void {
    if (this.selectedFiles.length === 0) {
      this.convertService.error.set('Veuillez sélectionner au moins un fichier JSON');
      return;
    }

    // Démarrer la fusion ; résultat et état sont gérés par les signals
    this.convertService.startMergeFiles(this.selectedFiles, this.outputFormat);
  }

  /**
   * Réinitialise le formulaire
   */
  reset(): void {
    this.selectedFiles = [];
    this.outputFormat = 'xlsx';
    this.convertService.clearResult();
  }
}
