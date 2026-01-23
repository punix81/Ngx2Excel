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

	it('should set error when no files are provided', () => {
		service.startMergeFiles([], 'xlsx');
		expect(service.error()).toBe('Aucun fichier sélectionné');
	});

	it('should generate CSV format via createTranslationTable', () => {
		const json = { test: { key: 'value' } };
		const map = new Map<string, any>();
		map.set('test.json', json);

		const result = (service as any).createTranslationTable(map, 'csv');

		expect(result).toBeDefined();
		expect(result.fileExtension).toBe('csv');
		expect(result.fileName).toContain('translations-');
		expect(result.fileData).toBeInstanceOf(Blob);
	});

	it('should generate Excel (.xls) format via createTranslationTable', () => {
		const json = { test: { key: 'value' } };
		const map = new Map<string, any>();
		map.set('test.json', json);

		const result = (service as any).createTranslationTable(map, 'xlsx');

		expect(result).toBeDefined();
		expect(result.fileExtension).toBe('xls');
		expect(result.fileName).toContain('translations-');
		expect(result.fileData).toBeInstanceOf(Blob);
	});
});
