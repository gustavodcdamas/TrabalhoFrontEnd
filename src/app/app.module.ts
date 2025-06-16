import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient, HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { MatIconModule } from '@angular/material/icon';
import { CacheInterceptor } from './core/interceptors/cache.interceptor';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { QuicklinkModule, QuicklinkStrategy } from 'ngx-quicklink';
import { provideClientHydration } from '@angular/platform-browser';
import { ApiUrlInterceptor } from './core/interceptors/http.interceptor';

@Injectable()
export class WithCredentialsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    req = req.clone({
      withCredentials: true
    });
    return next.handle(req);
  }
}

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        AuthInterceptor,
        MatDialogModule,
        MatIconModule,
        ReactiveFormsModule, // Para formulários reativos
        FormsModule, 
        MatButtonModule,
        MatDividerModule,
        RouterModule.forRoot(routes, { 
    preloadingStrategy: QuicklinkStrategy 
  })],
    providers: [
      {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiUrlInterceptor,
      multi: true
      },
      { provide: HTTP_INTERCEPTORS, useClass: WithCredentialsInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
      provideClientHydration()
    ]
})

export class AppModule {
}