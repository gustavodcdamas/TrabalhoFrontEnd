import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import 'zone.js';

const updatedConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(withInterceptorsFromDi()) // Configuração completa do HttpClient
  ]
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
