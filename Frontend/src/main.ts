import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

import { APP_VERSION, APP_BUILD_DATE } from './app/core/constants/version.constant';

registerLocaleData(localeFr, 'fr');
console.info(`%c🚀 EventManager App Version: ${APP_VERSION} (Build: ${APP_BUILD_DATE})`, 'color: #2563eb; font-weight: bold; font-size: 13px;');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
