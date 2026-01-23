import { Injectable, WritableSignal, signal } from '@angular/core';
import { ConvertedJsonToExcelFile } from './converted-json-to-excel-file';

@Injectable({
  providedIn: 'root'
})
export class ConvertJsonToExcelService {

  // Signals representing the processing state and results
  readonly isProcessing: WritableSignal<boolean> = signal(false);
  readonly error: WritableSignal<string> = signal('');
  readonly success: WritableSignal<string> = signal('');
  readonly result: WritableSignal<ConvertedJsonToExcelFile | null> = signal(null);

  /**
   * Démarre la fusion des fichiers JSON en un fichier Excel ou CSV.
   * Ne renvoie rien : les résultats et l'état sont exposés via des Signals.
   */
  startMergeFiles(files: File[], outputFormat: 'xlsx' | 'csv' = 'xlsx'): void {
    // Reset signals
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

          // Stocker les données avec le nom du fichier
          filesData.set(file.name, jsonData);
          filesProcessed++;

          // Quand tous les fichiers sont traités
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

  /**
   * Efface le résultat courant (utile après téléchargement)
   */
  clearResult(): void {
    this.result.set(null);
    this.success.set('');
    this.error.set('');
  }

  /**
   * Télécharge le fichier généré
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
   * Crée une table de traduction avec les clés et les valeurs de chaque fichier
   */
  private createTranslationTable(filesData: Map<string, unknown>, format: 'xlsx' | 'csv'): ConvertedJsonToExcelFile {
    // Collecter toutes les clés uniques de tous les fichiers
    const allKeys = new Set<string>();
    const flattenedFiles = new Map<string, Map<string, string>>();

    // Aplatir chaque fichier JSON et collecter les clés
    filesData.forEach((data, fileName) => {
      const flatData = this.flattenJson(data as Record<string, unknown>);
      flattenedFiles.set(fileName, flatData);

      flatData.forEach((_, key) => {
        allKeys.add(key);
      });
    });

    // Trier les clés alphabétiquement
    const sortedKeys = Array.from(allKeys).sort();

    // Créer les données du tableau
    const tableData: Record<string, string | undefined>[] = [];
    const headers = ['key', ...Array.from(filesData.keys())];

    sortedKeys.forEach(key => {
      const row: Record<string, string | undefined> = { key: key } as Record<string, string | undefined>;

      // Ajouter la valeur de chaque fichier pour cette clé
      filesData.forEach((_, fileName) => {
        const flatData = flattenedFiles.get(fileName);
        row[fileName] = flatData?.get(key) || '';
      });

      tableData.push(row);
    });

    // Générer le fichier selon le format
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

  /**
   * Génère un fichier CSV à partir des données
   */
  private generateCSV(headers: string[], data: Record<string, string | undefined>[]): string {
    // Fonction pour échapper les valeurs CSV
    const escapeCSV = (value: string | undefined): string => {
      if (value === null || value === undefined) {
        return '';
      }
      const strValue = String(value);
      // Si la valeur contient des virgules, guillemets ou sauts de ligne, l'entourer de guillemets
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    };

    // Créer la ligne d'en-tête
    const headerLine = headers.map(escapeCSV).join(',');

    // Créer les lignes de données
    const dataLines = data.map(row => {
      return headers.map(header => escapeCSV(row[header])).join(',');
    });

    return [headerLine, ...dataLines].join('\n');
  }

  /**
   * Génère un fichier Excel au format XML (compatible Excel 2003+)
   */
  private generateExcelXML(headers: string[], data: Record<string, string | undefined>[]): string {
    // Fonction pour échapper les caractères XML
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

    // Ajouter les en-têtes
    xml += '<Row>\n';
    headers.forEach(header => {
      xml += `<Cell><Data ss:Type="String">${escapeXML(header)}</Data></Cell>\n`;
    });
    xml += '</Row>\n';

    // Ajouter les données
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

  /**
   * Aplatit un objet JSON en Map avec clés et valeurs
   * Exemple: {welcome: {title: "Hello"}} => Map("welcome.title" => "Hello")
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
            // Objet imbriqué: continuer à aplatir
            flatten(value, newKey);
          } else if (Array.isArray(value)) {
            // Tableau: convertir en JSON string
            result.set(newKey, JSON.stringify(value));
          } else {
            // Valeur simple: ajouter directement
            result.set(newKey, (value ?? '') as string);
          }
        }
      }
    };

    flatten(data, prefix);
    return result;
  }
}
