import { Component, inject } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import { ConvertJsonToExcelComponent } from './convert-json-to-excel/convert-json-to-excel.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

// Explicit Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {MatCard, MatCardContent} from "@angular/material/card";

@Component({
  selector: 'app-root',
  standalone: true,
    imports: [RouterOutlet, ConvertJsonToExcelComponent, TranslateModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatCardContent, MatCard, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Ngx2Excel2';
  currentLang = 'en';

  // Version (synchronisée avec package.json)
  readonly version = '0.0.0';

  // Année courante exposée au template pour éviter expressions complexes dans le HTML
  readonly currentYear = new Date().getFullYear();

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
