import { TestBed } from '@angular/core/testing';
import { ConvertJsonToExcelService } from './convert-json-to-excel.service';

type LocalConvertedFile = { fileData: Blob; fileName: string; fileExtension: string };

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

	it('should generate CSV format via createTranslationTable', async () => {
		const json = { test: { key: 'value' } } as Record<string, unknown>;
		const map = new Map<string, Record<string, unknown>>();
		map.set('test.json', json);

		const result = await (service as unknown as { createTranslationTable: (m: Map<string, Record<string, unknown>>, f: 'csv' | 'xlsx') => Promise<LocalConvertedFile> }).createTranslationTable(map, 'csv');

		expect(result).toBeDefined();
		expect(result.fileExtension).toBe('csv');
		expect(result.fileName).toContain('translations-');
		expect(result.fileData).toBeInstanceOf(Blob);
		expect(result.fileData.type).toBe('text/csv;charset=utf-8;');
	});

	it('should generate Excel (.xlsx) format via createTranslationTable', async () => {
		const json = { test: { key: 'value' } } as Record<string, unknown>;
		const map = new Map<string, Record<string, unknown>>();
		map.set('test.json', json);

		const result = await (service as unknown as { createTranslationTable: (m: Map<string, Record<string, unknown>>, f: 'csv' | 'xlsx') => Promise<LocalConvertedFile> }).createTranslationTable(map, 'xlsx');

		expect(result).toBeDefined();
		expect(result.fileExtension).toBe('xlsx');
		expect(result.fileName).toContain('translations-');
		expect(result.fileData).toBeInstanceOf(Blob);
		expect(result.fileData.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	});

	it('should flatten nested JSON objects', () => {
		const json = {
			app: {
				title: 'Test App',
				description: 'Test Description'
			},
			menu: {
				home: 'Home',
				about: 'About'
			}
		} as Record<string, unknown>;

		const flattenJson = (service as unknown as { flattenJson: (data: Record<string, unknown>) => Map<string, string> }).flattenJson;
		const result = flattenJson(json);

		expect(result.size).toBeGreaterThan(0);
		expect(result.get('app.title')).toBe('Test App');
		expect(result.get('app.description')).toBe('Test Description');
		expect(result.get('menu.home')).toBe('Home');
		expect(result.get('menu.about')).toBe('About');
	});

	it('should handle arrays in JSON', () => {
		const json = {
			items: ['item1', 'item2', 'item3']
		} as Record<string, unknown>;

		const flattenJson = (service as unknown as { flattenJson: (data: Record<string, unknown>) => Map<string, string> }).flattenJson;
		const result = flattenJson(json);

		expect(result.get('items')).toBe('["item1","item2","item3"]');
	});

	it('should process multiple files and merge keys', async () => {
		const json1 = { app: { title: 'App EN' } } as Record<string, unknown>;
		const json2 = { app: { title: 'App FR' } } as Record<string, unknown>;
		const map = new Map<string, Record<string, unknown>>();
		map.set('en.json', json1);
		map.set('fr.json', json2);

		const result = await (service as unknown as { createTranslationTable: (m: Map<string, Record<string, unknown>>, f: 'csv' | 'xlsx') => Promise<LocalConvertedFile> }).createTranslationTable(map, 'xlsx');

		expect(result).toBeDefined();
		expect(result.fileData.size).toBeGreaterThan(0);
	});
});
