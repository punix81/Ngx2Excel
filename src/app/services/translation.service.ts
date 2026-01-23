import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

/**
 * Service pour gérer les traductions de l'application
 * Fournit des méthodes utilitaires pour simplifier l'utilisation de ngx-translate
 */
@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly STORAGE_KEY = 'app-language';
  private readonly DEFAULT_LANG = 'en';
  private readonly AVAILABLE_LANGS = ['en', 'fr'];

  // prefer inject() over constructor injection
  private readonly translate = inject(TranslateService);

  constructor() {
    this.initializeTranslation();
  }

  /**
   * Initialise le service de traduction
   * Détecte et applique la langue sauvegardée ou celle du navigateur
   */
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

  /**
   * Change la langue de l'application
   * @param lang Code de la langue (ex: 'en', 'fr')
   */
  setLanguage(lang: string): void {
    if (this.AVAILABLE_LANGS.includes(lang)) {
      this.translate.use(lang);
      this.saveLanguage(lang);
    }
  }

  /**
   * Retourne la langue actuellement utilisée
   */
  getCurrentLanguage(): string {
    return this.translate.currentLang || this.DEFAULT_LANG;
  }

  /**
   * Retourne la liste des langues disponibles
   */
  getAvailableLanguages(): string[] {
    return [...this.AVAILABLE_LANGS];
  }

  /**
   * Traduit une clé de manière synchrone
   * @param key Clé de traduction
   * @param params Paramètres d'interpolation (optionnel)
   */
  instant(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params as Record<string, unknown> | undefined);
  }

  /**
   * Traduit une clé de manière asynchrone
   * @param key Clé de traduction
   * @param params Paramètres d'interpolation (optionnel)
   */
  get(key: string, params?: Record<string, unknown>): Observable<string> {
    return this.translate.get(key, params as Record<string, unknown> | undefined);
  }

  /**
   * Traduit plusieurs clés à la fois
   * @param keys Tableau de clés de traduction
   */
  getMultiple(keys: string[]): Observable<Record<string, string>> {
    return this.translate.get(keys) as Observable<Record<string, string>>;
  }

  /**
   * Sauvegarde la langue dans le localStorage
   */
  private saveLanguage(lang: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Could not save language preference', e);
    }
  }

  /**
   * Récupère la langue sauvegardée depuis le localStorage
   */
  private getSavedLanguage(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('Could not retrieve language preference', e);
      return null;
    }
  }

  /**
   * Recharge les traductions pour la langue courante
   */
  reloadLang(lang?: string): Observable<Record<string, unknown>> {
    const langToReload = lang || this.getCurrentLanguage();
    return this.translate.reloadLang(langToReload) as Observable<Record<string, unknown>>;
  }

  /**
   * Vérifie si une clé de traduction existe
   * @param key Clé de traduction
   */
  hasTranslation(key: string): boolean {
    const translation = this.translate.instant(key);
    return translation !== key;
  }
}
