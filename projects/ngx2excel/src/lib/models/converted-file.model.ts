/**
 * Model for converted JSON to Excel file
 */
export interface ConvertedJsonToExcelFile {
  fileData: Blob;
  fileName: string;
  fileExtension: 'csv' | 'xlsx';
}
