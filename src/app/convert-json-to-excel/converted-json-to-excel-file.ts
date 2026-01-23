export interface ConvertedJsonToExcelFile {
	fileData: Blob;
	fileName: string;
	fileExtension: 'csv' | 'xlsx';
}
