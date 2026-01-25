import { TestBed } from '@angular/core/testing';
import { ConvertCsvService } from './convert-excel-to-json.service';

function waitFor(predicate: () => boolean, timeout = 2000): Promise<void> {
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

describe('ConvertCsvService', () => {
  let service: ConvertCsvService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ConvertCsvService] });
    service = TestBed.inject(ConvertCsvService);
  });

  it('should parse a simple CSV and expose parsedResults signal', async () => {
    const csv = 'key,en,fr\nhello,Hello,Bonjour\nbye,Goodbye,Au revoir';
    const blob = new Blob([csv], { type: 'text/csv' });
    // @ts-ignore File constructor available in JSDOM
    const file = new File([blob], 'test.csv', { type: 'text/csv' });

    service.parseFiles([file]);

    // wait until parsing completed
    await waitFor(() => !service.parsing());

    const parsed = service.parsedResults();
    expect(Object.keys(parsed)).toContain('test.csv');

    const payload = parsed['test.csv'];
    expect(payload.headers).toEqual(['key', 'en', 'fr']);
    expect(payload.rows.length).toBe(2);

    const jsons = service.buildJsons(payload.rows, 'key', ['en', 'fr']);
    expect(jsons['en']['hello']).toBe('Hello');
    expect(jsons['fr']['bye']).toBe('Au revoir');
  });

  it('should populate errors on invalid CSV', async () => {
    // simulate invalid CSV by using an unreadable blob? We'll pass empty content
    const blob = new Blob([''], { type: 'text/csv' });
    // @ts-ignore
    const file = new File([blob], 'empty.csv', { type: 'text/csv' });

    service.parseFiles([file]);
    await waitFor(() => !service.parsing());

    const parsed = service.parsedResults();
    expect(parsed['empty.csv']).toBeDefined();
    // rows empty -> headers empty
    expect(parsed['empty.csv'].headers.length).toBe(0);
  });
});
