import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ConvertJsonToExcelComponent } from './convert-json-to-excel/convert-json-to-excel.component';
import { ConvertExcelToJsonComponent } from './convert-excel-to-json/convert-excel-to-json.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
    imports: [RouterModule, ConvertJsonToExcelComponent, ConvertExcelToJsonComponent, TranslateModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Ngx2Excel';
  currentLang = 'en';

  readonly version = environment.version;

  readonly currentYear = new Date().getFullYear();

  private readonly translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs(['en', 'fr']);
    this.translate.setDefaultLang('en');
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
