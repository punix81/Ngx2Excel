import { Component, effect, inject, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExcelToJsonService } from '../../services/excel-to-json.service';
import { MatTableModule, MatTableDataSource, MatTable } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';

/**
 * Component to convert Excel/CSV files to JSON format
 * Allows selecting files, parsing, and exporting as JSON per column
 *
 * @example
 * <ngx2excel-excel-to-json></ngx2excel-excel-to-json>
 */
@Component({
  selector: 'ngx2excel-excel-to-json',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule, MatCheckboxModule, MatInputModule],
  templateUrl: './excel-to-json.component.html',
  styleUrls: ['./excel-to-json.component.scss']
})
export class ExcelToJsonComponent {
  /** Emitted when files are parsed successfully */
  @Output() filesParsed = new EventEmitter<Record<string, { rows: any[]; headers: string[] }>>();

  /** Emitted when JSON export is initiated */
  @Output() jsonExported = new EventEmitter<{ fileName: string; data: Record<string, any> }>();

  /** Emitted on error */
  @Output() error = new EventEmitter<string>();

  files: File[] = [];
  dataSource: MatTableDataSource<File> = new MatTableDataSource<File>(this.files);
  @ViewChild(MatTable) table?: MatTable<File>;
  filenameList: string[] = [];
  headersMap: Record<string, string[]> = {};
  rowsMap: Record<string, any[]> = {};
  keyColMap: Record<string, string> = {};
  selectedColsMap: Record<string, Set<string>> = {};
  displayedColumns: string[] = ['name', 'size', 'actions'];
  isDragging = false;

  private readonly svc = inject(ExcelToJsonService);

  constructor() {
    // react to parsed results from service
    effect(() => {
      const parsed = this.svc.parsedResults();
      // update local maps when service parsedResults changes
      this.headersMap = {};
      this.rowsMap = {};
      this.keyColMap = {};
      this.selectedColsMap = {};
      this.filenameList = [];

      for (const [fileName, payload] of Object.entries(parsed)) {
        this.filenameList.push(fileName);
        this.rowsMap[fileName] = payload.rows;
        this.headersMap[fileName] = payload.headers;
        this.keyColMap[fileName] = payload.headers.includes('key') ? 'key' : (payload.headers[0] || '');
        this.selectedColsMap[fileName] = new Set(payload.headers.filter(h => h !== this.keyColMap[fileName]));
      }

      if (Object.keys(parsed).length > 0) {
        this.filesParsed.emit(parsed);
      }
    });

    // keep table rendering in sync
    effect(() => {
      const _p = this.svc.parsing();
      setTimeout(() => this.table?.renderRows());
    });
  }

  get isProcessing(): boolean {
    return this.svc.parsing();
  }

  onFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.files = Array.from(input.files);
    this.filenameList = this.files.map(f => f.name);
    this.svc.clear();
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
    this.svc.clear();
    this.dataSource.data = this.files;
    setTimeout(() => this.table?.renderRows());
  }

  parseAll(): void {
    if (this.files.length === 0) return;
    this.svc.parseFiles(this.files);
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
    if (!keyCol || selected.length === 0) {
      this.error.emit('Please select a key column and at least one column to export');
      return;
    }
    const rows = this.rowsMap[fileName] || [];
    const jsons = this.svc.buildJsons(rows, keyCol, selected);
    for (const col of selected) {
      const blob = new Blob([JSON.stringify(jsons[col], null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${this.sanitizeFilename(fileName)}_${this.sanitizeFilename(col)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);

      this.jsonExported.emit({
        fileName: fileName,
        data: jsons[col]
      });
    }
  }

  reset(): void {
    this.files = [];
    this.filenameList = [];
    this.svc.clear();
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
