import { Component, effect, inject, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ConvertJsonToExcelService } from './convert-json-to-excel.service';
import { MatSelectChange } from '@angular/material/select';
import { MatTableModule, MatTableDataSource, MatTable } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-convert-json-to-excel',
  standalone: true,
  imports: [
    TranslateModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
],
  templateUrl: './convert-Json-to-Excel.component.html',
  styleUrls: ['./convert-json-to-excel.component.scss']
})
export class ConvertJsonToExcelComponent {
  selectedFiles: File[] = [];
  dataSource = new MatTableDataSource<File>(this.selectedFiles);
  @ViewChild(MatTable) table?: MatTable<File>;
  successMessage = '';
  outputFormat: 'xlsx' | 'csv' = 'xlsx';
  displayedColumns: string[] = ['name', 'size', 'actions'];

  public readonly convertService = inject(ConvertJsonToExcelService);

  // Drag state
  isDragging = false;

  constructor() {
    effect(() => {
      const res = this.convertService.result();
      if (res) {
        try {
          this.convertService.downloadFile(res);
          this.successMessage = `Fichier ${res.fileExtension.toUpperCase()} généré avec succès!`;
          this.selectedFiles = [];
        } finally {
          this.convertService.clearResult();
        }
      }
    });

    effect(() => {
      const err = this.convertService.error();
      if (err) {
      }
    });
  }

  get isProcessing(): boolean {
    return this.convertService.isProcessing();
  }

  get errorMessage(): string {
    return this.convertService.error();
  }

  get serviceSuccessMessage(): string {
    return this.convertService.success();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      this.convertService.clearResult();
      this.dataSource.data = this.selectedFiles;
      setTimeout(() => this.table?.renderRows());
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const dt = event.dataTransfer;
    if (!dt) return;
    const files = dt.files;
    if (!files || files.length === 0) return;

    // convert FileList to array and reuse logic
    this.selectedFiles = Array.from(files);
    this.convertService.clearResult();
    this.dataSource.data = this.selectedFiles;
    setTimeout(() => this.table?.renderRows());
  }

  removeFile(file: File): void {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
    this.dataSource.data = this.selectedFiles;
    setTimeout(() => this.table?.renderRows());
  }

  formatSize(sizeInBytes: number | undefined): string {
    if (!sizeInBytes && sizeInBytes !== 0) return '';
    const kb = sizeInBytes / 1024;
    return kb.toFixed(2) + ' KB';
  }

  trackByFile(index: number, file: File): string {
    return `${file.name}_${file.size}`;
  }

  onFormatChange(event: MatSelectChange): void {
    this.outputFormat = event.value as 'xlsx' | 'csv';
  }

  convertFiles(): void {
    if (this.selectedFiles.length === 0) {
      this.convertService.error.set('Veuillez sélectionner au moins un fichier JSON');
      return;
    }

    this.convertService.startMergeFiles(this.selectedFiles, this.outputFormat);
  }

  reset(): void {
    this.selectedFiles = [];
    this.outputFormat = 'xlsx';
    this.convertService.clearResult();
    this.dataSource.data = this.selectedFiles;
    setTimeout(() => this.table?.renderRows());
  }

  onReset(): void {
    // safety log to help debug UI clicks
    // eslint-disable-next-line no-console
    console.log('onReset clicked — selectedFiles before reset:', this.selectedFiles.length);
    this.reset();
  }
}
