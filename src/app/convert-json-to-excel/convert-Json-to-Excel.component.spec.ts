import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { ConvertJsonToExcelComponent } from './convert-json-to-excel.component';
import { ConvertJsonToExcelService } from './convert-json-to-excel.service';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';

// Mock TranslateLoader
class MockTranslateLoader implements TranslateLoader {
	getTranslation() {
		return of({});
	}
}

describe('ConvertJsonToExcelComponent', () => {
	let component: ConvertJsonToExcelComponent;
	let fixture: ComponentFixture<ConvertJsonToExcelComponent>;
	let service: ConvertJsonToExcelService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				ConvertJsonToExcelComponent,
				TranslateModule.forRoot({
					loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
				})
			],
			providers: [ConvertJsonToExcelService]
		}).compileComponents();

		fixture = TestBed.createComponent(ConvertJsonToExcelComponent);
		component = fixture.componentInstance;
		service = TestBed.inject(ConvertJsonToExcelService);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with default values', () => {
		expect(component.selectedFiles).toEqual([]);
		expect(component.isProcessing).toBe(false);
		expect(component.outputFormat).toBe('xlsx');
	});

	it('should reset component state', () => {
		component.selectedFiles = [new File(['test'], 'test.json')];
		// set service signals instead of component getters
		service.error.set('error');
		service.success.set('success');
		component.outputFormat = 'csv';

		component.reset();

		expect(component.selectedFiles).toEqual([]);
		expect(component.errorMessage).toBe('');
		expect(component.serviceSuccessMessage).toBe('');
		expect(component.outputFormat).toBe('xlsx');
	});
});
