import { Component, effect, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConvertCsvService } from './convert-excel-to-json.service';
import { ExcelToJsonConverterService, ExcelSheetData } from './excel-to-json-converter.service';
import { MatTableModule, MatTableDataSource, MatTable } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-convert-excel-to-json',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule, MatCheckboxModule, MatInputModule],
  templateUrl: './convert-excel-to-json.component.html',
  styleUrls: ['./convert-excel-to-json.component.scss']
})
export class ConvertExcelToJsonComponent {
  files: File[] = [];
  dataSource = new MatTableDataSource<File>(this.files);
  @ViewChild(MatTable) table?: MatTable<File>;
  filenameList: string[] = [];
  headersMap: Record<string, string[]> = {};
  rowsMap: Record<string, any[]> = {};
  keyColMap: Record<string, string> = {};
  selectedColsMap: Record<string, Set<string>> = {};
  displayedColumns: string[] = ['name', 'size', 'actions'];
  isDragging = false;
  sheetsMap: Record<string, ExcelSheetData[]> = {}; // For Excel files

  readonly csvSvc = inject(ConvertCsvService);
  readonly excelSvc = inject(ExcelToJsonConverterService);
  private isProcessingExcel = false;

  constructor() {
    // react to parsed results from CSV service
    effect(() => {
      const parsed = this.csvSvc.parsedResults();
      // update local maps when service parsedResults changes
      this.updateMapsFromCsv(parsed);
    });

    // react to parsed results from Excel service
    effect(() => {
      const parsed = this.excelSvc.parsedResults();
      // update local maps when service parsedResults changes
      this.updateMapsFromExcel(parsed);
    });

    // keep table rendering in sync
    effect(() => {
      const _csvParsing = this.csvSvc.parsing();
      const _excelParsing = this.excelSvc.parsing();
      setTimeout(() => this.table?.renderRows());
    });
  }

  private updateMapsFromCsv(parsed: Record<string, { rows: any[]; headers: string[] }>): void {
    for (const [fileName, payload] of Object.entries(parsed)) {
      if (!this.filenameList.includes(fileName)) {
        this.filenameList.push(fileName);
      }
      this.rowsMap[fileName] = payload.rows;
      this.headersMap[fileName] = payload.headers;
      this.keyColMap[fileName] = payload.headers.includes('key') ? 'key' : (payload.headers[0] || '');
      this.selectedColsMap[fileName] = new Set(payload.headers.filter(h => h !== this.keyColMap[fileName]));
    }
  }

  private updateMapsFromExcel(parsed: Record<string, ExcelSheetData[]>): void {
    for (const [fileName, sheetsData] of Object.entries(parsed)) {
      this.sheetsMap[fileName] = sheetsData;
      if (sheetsData.length > 0) {
        // Use first sheet by default
        const firstSheet = sheetsData[0];
        if (!this.filenameList.includes(fileName)) {
          this.filenameList.push(fileName);
        }
        this.rowsMap[fileName] = firstSheet.rows;
        this.headersMap[fileName] = firstSheet.headers;
        this.keyColMap[fileName] = firstSheet.headers.includes('key') ? 'key' : (firstSheet.headers[0] || '');
        this.selectedColsMap[fileName] = new Set(firstSheet.headers.filter(h => h !== this.keyColMap[fileName]));
      }
    }
  }

  get isProcessing(): boolean {
    return this.csvSvc.parsing() || this.excelSvc.parsing() || this.isProcessingExcel;
  }

  isExcelFile(fileName: string): boolean {
    return fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls');
  }

  onFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.files = Array.from(input.files);
    this.filenameList = this.files.map(f => f.name);
    this.csvSvc.clear();
    this.excelSvc.clear();
    this.headersMap = {};
    this.rowsMap = {};
    this.keyColMap = {};
    this.selectedColsMap = {};
    this.sheetsMap = {};
    this.dataSource.data = this.files;
    setTimeout(() => this.table?.renderRows());
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

    this.files = Array.from(files);
    this.filenameList = this.files.map(f => f.name);
    this.csvSvc.clear();
    this.excelSvc.clear();
    this.headersMap = {};
    this.rowsMap = {};
    this.keyColMap = {};
    this.selectedColsMap = {};
    this.sheetsMap = {};
    this.dataSource.data = this.files;
    setTimeout(() => this.table?.renderRows());
  }

  parseAll(): void {
    if (this.files.length === 0) return;

    const csvFiles = this.files.filter(f => !this.isExcelFile(f.name));
    const excelFiles = this.files.filter(f => this.isExcelFile(f.name));

    if (csvFiles.length > 0) {
      this.csvSvc.parseFiles(csvFiles);
    }

    if (excelFiles.length > 0) {
      this.isProcessingExcel = true;
      this.excelSvc.parseFiles(excelFiles).finally(() => {
        this.isProcessingExcel = false;
      });
    }
  }

  removeFile(file: File): void {
    this.files = this.files.filter(f => f !== file);
    this.filenameList = this.files.map(f => f.name);
    this.dataSource.data = this.files;
    setTimeout(() => this.table?.renderRows());
  }

  toggleCol(fileName: string, col: string): void {
    const set = this.selectedColsMap[fileName];
    if (!set) return;
    if (set.has(col)) set.delete(col);
    else set.add(col);
  }

  exportSelected(fileName: string): void {
    const keyCol = this.keyColMap[fileName];
    const selected = Array.from(this.selectedColsMap[fileName] || []);
    if (!keyCol || selected.length === 0) return;
    const rows = this.rowsMap[fileName] || [];

    // Use the appropriate service based on file type
    const jsons = this.isExcelFile(fileName)
      ? this.excelSvc.buildJsons(rows, keyCol, selected)
      : this.csvSvc.buildJsons(rows, keyCol, selected);

    for (const col of selected) {
      const blob = new Blob([JSON.stringify(jsons[col], null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${this.sanitizeFilename(fileName)}_${this.sanitizeFilename(col)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  }

  reset(): void {
    this.files = [];
    this.filenameList = [];
    this.headersMap = {};
    this.rowsMap = {};
    this.keyColMap = {};
    this.selectedColsMap = {};
    this.sheetsMap = {};
    this.csvSvc.clear();
    this.excelSvc.clear();
    this.dataSource.data = this.files;
    setTimeout(() => this.table?.renderRows());
  }

  onReset(): void {
    this.reset();
  }

  formatSize(sizeInBytes: number | undefined): string {
    if (!sizeInBytes && sizeInBytes !== 0) return '';
    const kb = sizeInBytes / 1024;
    return kb.toFixed(2) + ' KB';
  }

  private sanitizeFilename(name: string) {
    return name.replace(/[\\/:*?"<>|]/g, '_');
  }
}
