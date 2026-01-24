import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {provideTranslateService} from "@ngx-translate/core";
import { routes } from './app.routes';
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
      provideTranslateService({
          loader: provideTranslateHttpLoader({
              prefix: 'assets/i18n/',
              suffix: '.json'
          }),
          fallbackLang: 'en',
          lang: 'en'
      })
  ]
};
