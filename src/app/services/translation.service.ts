import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly STORAGE_KEY = 'app-language';
  private readonly DEFAULT_LANG = 'en';
  private readonly AVAILABLE_LANGS = ['en', 'fr'];

  private readonly translate = inject(TranslateService);

  constructor() {
    this.initializeTranslation();
  }

  private initializeTranslation(): void {
    this.translate.addLangs(this.AVAILABLE_LANGS);
    this.translate.setDefaultLang(this.DEFAULT_LANG);

    const savedLang = this.getSavedLanguage();
    if (savedLang && this.AVAILABLE_LANGS.includes(savedLang)) {
      this.translate.use(savedLang);
    } else {
      const browserLang = this.translate.getBrowserLang();
      const langToUse = browserLang && this.AVAILABLE_LANGS.includes(browserLang)
        ? browserLang
        : this.DEFAULT_LANG;
      this.setLanguage(langToUse);
    }
  }

  setLanguage(lang: string): void {
    if (this.AVAILABLE_LANGS.includes(lang)) {
      this.translate.use(lang);
      this.saveLanguage(lang);
    }
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.DEFAULT_LANG;
  }

  getAvailableLanguages(): string[] {
    return [...this.AVAILABLE_LANGS];
  }

  instant(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params as Record<string, unknown> | undefined);
  }

  get(key: string, params?: Record<string, unknown>): Observable<string> {
    return this.translate.get(key, params as Record<string, unknown> | undefined);
  }

  getMultiple(keys: string[]): Observable<Record<string, string>> {
    return this.translate.get(keys) as Observable<Record<string, string>>;
  }

  private saveLanguage(lang: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Could not save language preference', e);
    }
  }

  private getSavedLanguage(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('Could not retrieve language preference', e);
      return null;
    }
  }

  reloadLang(lang?: string): Observable<Record<string, unknown>> {
    const langToReload = lang || this.getCurrentLanguage();
    return this.translate.reloadLang(langToReload) as Observable<Record<string, unknown>>;
  }

  hasTranslation(key: string): boolean {
    const translation = this.translate.instant(key);
    return translation !== key;
  }
}
