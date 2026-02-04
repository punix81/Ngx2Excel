import { Injectable, signal, WritableSignal } from '@angular/core';
import * as ExcelJS from 'exceljs';

export interface ExcelSheetData {
  sheetName: string;
  rows: any[];
  headers: string[];
}

/**
 * Service to convert Excel files to JSON format
 */
@Injectable({ providedIn: 'root' })
export class ExcelToJsonConverterService {
  public readonly parsedResults: WritableSignal<Record<string, ExcelSheetData[]>> = signal({});
  public readonly parsing: WritableSignal<boolean> = signal(false);
  public readonly errors: WritableSignal<Record<string, string>> = signal({});

  /**
   * Parse Excel files and extract data from all sheets
   * @param files Excel files to parse
   */
  async parseFiles(files: File[]): Promise<void> {
    if (!files || files.length === 0) return;
    this.parsing.set(true);
    this.errors.set({});
    this.parsedResults.set({});

    for (const file of files) {
      await this.parseFile(file);
    }

    this.parsing.set(false);
  }

  /**
   * Parse a single Excel file
   * @param file Excel file to parse
   */
  private async parseFile(file: File): Promise<void> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const sheetsData: ExcelSheetData[] = [];

      // Parse each sheet in the workbook
      workbook.eachSheet((worksheet) => {
        const headers: string[] = [];
        const rows: any[] = [];

        let isFirstRow = true;
        worksheet.eachRow((row, rowNumber) => {
          const values = row.values as any[];

          // First row is headers
          if (isFirstRow) {
            isFirstRow = false;
            // Skip the first empty value (row.values includes index 0 as empty)
            headers.push(...(values.slice(1) || []));
          } else if (values && values.length > 1) {
            // Build row object with headers as keys
            const rowObj: Record<string, any> = {};
            headers.forEach((header, index) => {
              rowObj[header] = values[index + 1] ?? '';
            });
            rows.push(rowObj);
          }
        });

        if (headers.length > 0) {
          sheetsData.push({
            sheetName: worksheet.name,
            rows,
            headers
          });
        }
      });

      // Store parsed data
      this.parsedResults.update(prev => ({
        ...prev,
        [file.name]: sheetsData
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.errors.update(prev => ({
        ...prev,
        [file.name]: errorMessage
      }));
    }
  }

  /**
   * Clear all parsed results and errors
   */
  clear(): void {
    this.parsedResults.set({});
    this.errors.set({});
    this.parsing.set(false);
  }

  /**
   * Build JSON objects from parsed Excel data
   * @param rows Parsed rows
   * @param keyCol Column to use as key
   * @param cols Columns to include in output
   * @returns Map of column names to objects
   */
  buildJsons(rows: any[], keyCol: string, cols: string[]): Record<string, Record<string, any>> {
    const out: Record<string, Record<string, any>> = {};
    cols.forEach(col => {
      const map: Record<string, any> = {};
      rows.forEach(r => {
        const k = r[keyCol];
        if (k !== undefined && k !== null && String(k).trim() !== '') {
          map[String(k).trim()] = r[col] !== undefined ? r[col] : '';
        }
      });
      out[col] = map;
    });
    return out;
  }
}
