import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConvertJsonToExcelComponent } from './convert-json-to-excel/convert-json-to-excel.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConvertJsonToExcelComponent, TranslateModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Ngx2Excel2';
  currentLang = 'en';

  constructor(private translate: TranslateService) {
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

  ngOnInit(): void {
    // Initialisation supplémentaire si nécessaire
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang = lang;
  }
}
