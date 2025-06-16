// landing-page.service.ts - VERSÃO FINAL CORRIGIDA
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { landing } from '../../models/landing.model';

@Injectable({
  providedIn: 'root'
})
export class landingService {
  private apiUrl = `${environment.apiUrl}/api/landing`;

  constructor(private http: HttpClient) {}

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  private getCsrfToken(): Observable<string> {
    console.log('🔑 Solicitando CSRF token para landing pages...');
    
    return this.http.get<{ csrfToken: string }>(
      `${environment.apiUrl}/api/csrf-token`, 
      { withCredentials: true }
    ).pipe(
      switchMap(response => {
        console.log('✅ CSRF token recebido para landing pages:', response.csrfToken);
        return of(response.csrfToken);
      }),
      catchError(error => {
        console.error('❌ Erro ao obter CSRF token para landing pages:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: string): Observable<landing> {
    return this.http.get<landing>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Erro ao buscar landing page:', error);
        return throwError(() => error);
      })
    );
  }

  getAll(): Observable<landing[]> {
    return this.http.get<landing[]>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Erro ao buscar landing pages:', error);
        return of([]);
      })
    );
  }

  create(formData: FormData): Observable<landing> {
    console.log('🚀 landingService.create() chamado');
    console.log('📦 FormData recebido:', formData);
    
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        console.log('🔑 CSRF Token obtido:', csrfToken);
        console.log('🔄 Dentro do switchMap, fazendo POST para landing pages...');
        
        const authToken = this.getAuthToken();
        
        if (!authToken) {
          console.error('🚨 Token JWT não encontrado para landing pages!');
          return throwError(() => new Error('Token de autenticação não encontrado'));
        }
        
        const headers = new HttpHeaders({
          'X-CSRF-Token': csrfToken,
          'Authorization': `Bearer ${authToken}`
        });

        console.log('📤 Enviando POST para landing pages com headers:', {
          'X-CSRF-Token': csrfToken,
          'Authorization': `Bearer ${authToken.substring(0, 20)}...`
        });

        return this.http.post<landing>(this.apiUrl, formData, {
          headers,
          withCredentials: true,
        });
      }),
      catchError(error => {
        console.error('❌ Erro detalhado ao criar landing page:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        return throwError(() => error);
      })
    );
  }

  update(id: string, formData: FormData): Observable<landing> {
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const authToken = this.getAuthToken();
        
        if (!authToken) {
          console.error('🚨 Token JWT não encontrado para update de landing page!');
          return throwError(() => new Error('Token de autenticação não encontrado'));
        }
        
        const headers = new HttpHeaders({
          'X-CSRF-Token': csrfToken,
          'Authorization': `Bearer ${authToken}`
        });

        return this.http.patch<landing>(`${this.apiUrl}/${id}`, formData, {
          headers,
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('Erro ao atualizar landing page:', error);
        return throwError(() => error);
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const authToken = this.getAuthToken();
        
        if (!authToken) {
          console.error('🚨 Token JWT não encontrado para delete de landing page!');
          return throwError(() => new Error('Token de autenticação não encontrado'));
        }
        
        const headers = new HttpHeaders({
          'X-CSRF-Token': csrfToken,
          'Authorization': `Bearer ${authToken}`
        });

        return this.http.delete<void>(`${this.apiUrl}/${id}`, {
          headers,
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('Erro ao excluir landing page:', error);
        return throwError(() => error);
      })
    );
  }

  uploadImage(file: File): Observable<{url: string}> {
    const formData = new FormData();
    formData.append('image', file);

    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const authToken = this.getAuthToken();
        
        const headers = new HttpHeaders({
          'X-CSRF-Token': csrfToken,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        });

        return this.http.post<{url: string}>(`${this.apiUrl}/upload-image`, formData, {
          headers,
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('Erro ao fazer upload da imagem para landing page:', error);
        return throwError(() => error);
      })
    );
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Erro ao buscar estatísticas de landing pages:', error);
        return of({
          total: 0,
          ativos: 0,
          inativos: 0,
          recentes: 0
        });
      })
    );
  }

  search(term: string, limit: number = 10): Observable<landing[]> {
    const params = {
      search: term,
      limit: limit.toString()
    };

    return this.http.get<landing[]>(`${this.apiUrl}/search`, {
      params,
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Erro ao buscar landing pages:', error);
        return of([]);
      })
    );
  }
}