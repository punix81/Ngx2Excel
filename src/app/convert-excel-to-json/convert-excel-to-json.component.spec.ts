import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ConvertExcelToJsonComponent } from './convert-excel-to-json.component';
import { ConvertCsvService } from './convert-excel-to-json.service';
import { provideAnimations } from '@angular/platform-browser/animations';

function waitFor(predicate: () => boolean, timeout = 5000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (predicate()) return resolve();
      if (Date.now() - start > timeout) return reject(new Error('Timeout waiting for predicate'));
      setTimeout(tick, 20);
    };
    tick();
  });
}

describe('ConvertExcelToJsonComponent', () => {
  let fixture: ComponentFixture<ConvertExcelToJsonComponent>;
  let component: ConvertExcelToJsonComponent;
  let service: ConvertCsvService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvertExcelToJsonComponent],
      providers: [ConvertCsvService, provideAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConvertExcelToJsonComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ConvertCsvService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should parse files and update UI maps', async () => {
    const csv = 'key,en,fr\nhello,Hello,Bonjour\nbye,Goodbye,Au revoir';
    const blob = new Blob([csv], { type: 'text/csv' });
    // @ts-ignore
    const file = new File([blob], 'ui-test.csv', { type: 'text/csv' });

    // simulate file selection
    component.files = [file];
    component.dataSource.data = [file];
    component.filenameList = [file.name];

    component.parseAll();

    // wait for service to populate parsedResults
    await waitFor(() => Object.keys(service.parsedResults()).length > 0);
    fixture.detectChanges();

    // wait until the component's maps are updated via effect
    await waitFor(() => !!component.headersMap['ui-test.csv']);

    // effects should have updated component state
    expect(component.filenameList).toContain('ui-test.csv');
    expect(component.headersMap['ui-test.csv']).toEqual(['key', 'en', 'fr']);
    expect(component.rowsMap['ui-test.csv'].length).toBe(2);
  });
});
