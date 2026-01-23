import { TestBed } from '@angular/core/testing';
import { ConvertJsonToExcelService } from './convert-json-to-excel.service';

describe('ConvertJsonToExcelService', () => {
	let service: ConvertJsonToExcelService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ConvertJsonToExcelService]
		});
		service = TestBed.inject(ConvertJsonToExcelService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should reject when no files are provided', async () => {
		await expect(service.mergeJsonToExcel([], 'xlsx')).rejects.toThrow('Aucun fichier sélectionné');
	});

	it('should generate CSV format', async () => {
		const jsonContent = JSON.stringify({ test: { key: 'value' } });
		const file = new File([jsonContent], 'test.json', { type: 'application/json' });

		const result = await service.mergeJsonToExcel([file], 'csv');

		expect(result).toBeDefined();
		expect(result.fileExtension).toBe('csv');
		expect(result.fileName).toContain('translations-');
		expect(result.fileData).toBeInstanceOf(Blob);
	});

	it('should generate Excel format', async () => {
		const jsonContent = JSON.stringify({ test: { key: 'value' } });
		const file = new File([jsonContent], 'test.json', { type: 'application/json' });

		const result = await service.mergeJsonToExcel([file], 'xlsx');

		expect(result).toBeDefined();
		expect(result.fileExtension).toBe('xls');
		expect(result.fileName).toContain('translations-');
		expect(result.fileData).toBeInstanceOf(Blob);
	});
});
