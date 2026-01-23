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
		component.errorMessage = 'error';
		component.successMessage = 'success';
		component.outputFormat = 'csv';

		component.reset();

		expect(component.selectedFiles).toEqual([]);
		expect(component.errorMessage).toBe('');
		expect(component.successMessage).toBe('');
		expect(component.outputFormat).toBe('xlsx');
	});
});
