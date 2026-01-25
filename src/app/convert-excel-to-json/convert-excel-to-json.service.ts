import { Injectable, signal, WritableSignal } from '@angular/core';
import Papa from 'papaparse';

@Injectable({ providedIn: 'root' })
export class ConvertCsvService {
  // map filename -> { rows, headers }
  public readonly parsedResults: WritableSignal<Record<string, { rows: any[]; headers: string[] }>> = signal({});
  public readonly parsing: WritableSignal<boolean> = signal(false);
  public readonly errors: WritableSignal<Record<string, any>> = signal({});

  parseFiles(files: File[]): void {
    if (!files || files.length === 0) return;
    this.parsing.set(true);
    this.errors.set({});
    this.parsedResults.set({});

    let remaining = files.length;

    const doneOne = (fileName: string) => {
      remaining -= 1;
      if (remaining <= 0) {
        this.parsing.set(false);
      }
    };

    for (const f of files) {
      this.parseFile(f, () => doneOne(f.name));
    }
  }

  private parseFile(file: File, onDone: () => void): void {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results: import('papaparse').ParseResult<Record<string, string>>) => {
            const rows = results.data as any[];
            const headers = rows.length ? Object.keys(rows[0]) : [];
            this.parsedResults.update(prev => ({ ...prev, [file.name]: { rows, headers } }));
            onDone();
          },
          error: (err: any) => {
            this.errors.update(prev => ({ ...prev, [file.name]: err }));
            onDone();
          }
        });
      };
      reader.onerror = (e) => {
        this.errors.update(prev => ({ ...prev, [file.name]: e }));
        onDone();
      };
      reader.readAsText(file);
    } catch (err) {
      this.errors.update(prev => ({ ...prev, [file.name]: err }));
      onDone();
    }
  }

  clear(): void {
    this.parsedResults.set({});
    this.errors.set({});
    this.parsing.set(false);
  }

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
