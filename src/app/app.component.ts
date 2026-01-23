import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConvertJsonToExcelComponent } from './convert-json-to-excel/convert-json-to-excel.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

// Explicit Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConvertJsonToExcelComponent, TranslateModule, MatToolbarModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Ngx2Excel2';
  currentLang = 'en';

  // Prefer using inject() as recommended by @angular-eslint/prefer-inject
  private readonly translate = inject(TranslateService);

  constructor() {
    // Définir les langues disponibles
    this.translate.addLangs(['en', 'fr']);
    // Définir la langue par défaut
    this.translate.setDefaultLang('en');
    // Utiliser la langue du navigateur si disponible, sinon anglais
    const browserLang = this.translate.getBrowserLang();
    const langToUse = browserLang?.match(/en|fr/) ? browserLang : 'en';
    this.translate.use(langToUse);
    this.currentLang = langToUse;
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang = lang;
  }
}
