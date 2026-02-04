import { Injectable, WritableSignal, signal } from '@angular/core';
import { ConvertedJsonToExcelFile } from '../models/converted-file.model';
import * as ExcelJS from 'exceljs';

/**
 * Service for converting JSON files to Excel/CSV format
 * Merges multiple translation JSON files into a single Excel/CSV document
 */
@Injectable({
  providedIn: 'root'
})
export class JsonToExcelService {

  readonly isProcessing: WritableSignal<boolean> = signal(false);
  readonly error: WritableSignal<string> = signal('');
  readonly success: WritableSignal<string> = signal('');
  readonly result: WritableSignal<ConvertedJsonToExcelFile | null> = signal(null);

  /**
   * Start merging multiple JSON files
   * @param files JSON files to merge
   * @param outputFormat Output format (xlsx or csv)
   */
  startMergeFiles(files: File[], outputFormat: 'xlsx' | 'csv' = 'xlsx'): void {
    this.isProcessing.set(false);
    this.error.set('');
    this.success.set('');
    this.result.set(null);

    if (!files || files.length === 0) {
      this.error.set('No files selected');
      return;
    }

    this.isProcessing.set(true);

    const filesData: Map<string, unknown> = new Map();
    let filesProcessed = 0;

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const txt = (e.target as FileReader).result as string;
          const jsonData = JSON.parse(txt) as Record<string, unknown>;

          filesData.set(file.name, jsonData);
          filesProcessed++;

          if (filesProcessed === files.length) {
            this.createTranslationTable(filesData, outputFormat)
              .then(result => {
                this.result.set(result);
                this.success.set(`File ${outputFormat.toUpperCase()} generated successfully!`);
              })
              .catch(err => {
                const errorMessage = err instanceof Error ? err.message : String(err);
                this.error.set(`Error generating file: ${errorMessage}`);
                this.result.set(null);
              })
              .finally(() => {
                this.isProcessing.set(false);
              });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.error.set(`Error reading file ${file.name}: ${errorMessage}`);
          this.isProcessing.set(false);
        }
      };

      reader.onerror = () => {
        this.error.set(`Error reading file ${file.name}`);
        this.isProcessing.set(false);
      };

      reader.readAsText(file);
    });
  }

  /**
   * Clear the current result
   */
  clearResult(): void {
    this.result.set(null);
    this.success.set('');
    this.error.set('');
  }

  /**
   * Trigger file download
   * @param convertedFile File to download
   */
  downloadFile(convertedFile: ConvertedJsonToExcelFile): void {
    const url = window.URL.createObjectURL(convertedFile.fileData);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${convertedFile.fileName}.${convertedFile.fileExtension}`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Create a translation table from merged JSON files
   * @param filesData Map of filename to JSON data
   * @param format Output format
   * @returns Promise with converted file
   */
  private async createTranslationTable(filesData: Map<string, unknown>, format: 'xlsx' | 'csv'): Promise<ConvertedJsonToExcelFile> {
    const allKeys = new Set<string>();
    const flattenedFiles = new Map<string, Map<string, string>>();

    filesData.forEach((data, fileName) => {
      const flatData = this.flattenJson(data as Record<string, unknown>);
      flattenedFiles.set(fileName, flatData);

      flatData.forEach((_, key) => {
        allKeys.add(key);
      });
    });

    const sortedKeys = Array.from(allKeys).sort();

    const tableData: Record<string, string | undefined>[] = [];
    const headers = ['key', ...Array.from(filesData.keys())];

    sortedKeys.forEach(key => {
      const row: Record<string, string | undefined> = { key: key } as Record<string, string | undefined>;

      filesData.forEach((_, fileName) => {
        const flatData = flattenedFiles.get(fileName);
        row[fileName] = flatData?.get(key) || '';
      });

      tableData.push(row);
    });

    let blob: Blob;
    let fileExtension: string;

    if (format === 'csv') {
      const csvContent = this.generateCSV(headers, tableData);
      blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      fileExtension = 'csv';
    } else {
      // Generate a proper .xlsx file with ExcelJS
      const buffer = await this.generateExcelWithExcelJS(headers, tableData);
      blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      fileExtension = 'xlsx';
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `translations-${timestamp}`;

    return {
      fileData: blob,
      fileName: fileName,
      fileExtension: fileExtension as 'csv' | 'xlsx'
    };
  }

  /**
   * Generate CSV content
   * @param headers Column headers
   * @param data Data rows
   * @returns CSV content string
   */
  private generateCSV(headers: string[], data: Record<string, string | undefined>[]): string {
    const escapeCSV = (value: string | undefined): string => {
      if (value === null || value === undefined) {
        return '';
      }
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    };

    const headerLine = headers.map(escapeCSV).join(',');

    const dataLines = data.map(row => {
      return headers.map(header => escapeCSV(row[header])).join(',');
    });

    return [headerLine, ...dataLines].join('\n');
  }

  /**
   * Generate Excel file using ExcelJS
   * @param headers Column headers
   * @param data Data rows
   * @returns Promise with ArrayBuffer
   */
  private async generateExcelWithExcelJS(headers: string[], data: Record<string, string | undefined>[]): Promise<ArrayBuffer> {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Ngx2Excel';
    workbook.created = new Date();

    // Add a worksheet
    const worksheet = workbook.addWorksheet('Translations');

    // Add headers with style
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };

    // Add data
    data.forEach(row => {
      const rowValues = headers.map(header => row[header] || '');
      worksheet.addRow(rowValues);
    });

    // Auto-adjust column widths
    worksheet.columns.forEach((column, index) => {
      let maxLength = headers[index].length;
      data.forEach(row => {
        const value = row[headers[index]];
        if (value) {
          const length = String(value).length;
          if (length > maxLength) {
            maxLength = length;
          }
        }
      });

      // Limit max width to 50 characters
      column.width = Math.min(maxLength + 2, 50);
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ArrayBuffer;
  }

  /**
   * Flatten nested JSON object
   * @param data JSON data to flatten
   * @param prefix Key prefix for nested properties
   * @returns Map of flattened keys to values
   */
  private flattenJson(data: Record<string, unknown>, prefix: string = ''): Map<string, string> {
    const result = new Map<string, string>();

    const flatten = (current: unknown, currentPrefix: string): void => {
      if (typeof current !== 'object' || current === null) {
        return;
      }

      const obj = current as Record<string, unknown>;

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          const newKey = currentPrefix ? `${currentPrefix}.${key}` : key;

          if (value && typeof value === 'object' && !Array.isArray(value)) {
            flatten(value, newKey);
          } else if (Array.isArray(value)) {
            result.set(newKey, JSON.stringify(value));
          } else {
            result.set(newKey, (value ?? '') as string);
          }
        }
      }
    };

    flatten(data, prefix);
    return result;
  }
}
