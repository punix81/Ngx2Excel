import { Injectable, WritableSignal, signal } from '@angular/core';
import { ConvertedJsonToExcelFile } from './converted-json-to-excel-file';

@Injectable({
  providedIn: 'root'
})
export class ConvertJsonToExcelService {

  readonly isProcessing: WritableSignal<boolean> = signal(false);
  readonly error: WritableSignal<string> = signal('');
  readonly success: WritableSignal<string> = signal('');
  readonly result: WritableSignal<ConvertedJsonToExcelFile | null> = signal(null);

  startMergeFiles(files: File[], outputFormat: 'xlsx' | 'csv' = 'xlsx'): void {
    this.isProcessing.set(false);
    this.error.set('');
    this.success.set('');
    this.result.set(null);

    if (!files || files.length === 0) {
      this.error.set('Aucun fichier sélectionné');
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
            try {
              const result = this.createTranslationTable(filesData, outputFormat);
              this.result.set(result);
              this.success.set(`Fichier ${outputFormat.toUpperCase()} généré avec succès!`);
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : String(err);
              this.error.set(`Erreur lors de la génération du fichier: ${errorMessage}`);
              this.result.set(null);
            } finally {
              this.isProcessing.set(false);
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.error.set(`Erreur lors de la lecture du fichier ${file.name}: ${errorMessage}`);
          this.isProcessing.set(false);
        }
      };

      reader.onerror = () => {
        this.error.set(`Erreur lors de la lecture du fichier ${file.name}`);
        this.isProcessing.set(false);
      };

      reader.readAsText(file);
    });
  }

  clearResult(): void {
    this.result.set(null);
    this.success.set('');
    this.error.set('');
  }

  downloadFile(convertedFile: ConvertedJsonToExcelFile): void {
    const url = window.URL.createObjectURL(convertedFile.fileData);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${convertedFile.fileName}.${convertedFile.fileExtension}`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private createTranslationTable(filesData: Map<string, unknown>, format: 'xlsx' | 'csv'): ConvertedJsonToExcelFile {
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
      const excelContent = this.generateExcelXML(headers, tableData);
      blob = new Blob([excelContent], {
        type: 'application/vnd.ms-excel;charset=utf-8;'
      });
      fileExtension = 'xls';
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `translations-${timestamp}`;

    return {
      fileData: blob,
      fileName: fileName,
      fileExtension: fileExtension as 'csv'
    };
  }

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

  private generateExcelXML(headers: string[], data: Record<string, string | undefined>[]): string {
    const escapeXML = (value: string | undefined): string => {
      if (value === null || value === undefined) {
        return '';
      }
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
    xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    xml += '<Worksheet ss:Name="Translations">\n';
    xml += '<Table>\n';

    xml += '<Row>\n';
    headers.forEach(header => {
      xml += `<Cell><Data ss:Type="String">${escapeXML(header)}</Data></Cell>\n`;
    });
    xml += '</Row>\n';

    data.forEach(row => {
      xml += '<Row>\n';
      headers.forEach(header => {
        const value = row[header];
        xml += `<Cell><Data ss:Type="String">${escapeXML(value)}</Data></Cell>\n`;
      });
      xml += '</Row>\n';
    });

    xml += '</Table>\n';
    xml += '</Worksheet>\n';
    xml += '</Workbook>';

    return xml;
  }

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
