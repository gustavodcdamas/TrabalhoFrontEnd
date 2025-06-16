// institucional.service.ts - VERSÃO FINAL SIMPLIFICADA
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { institucional } from '../../models/institucional.model';

@Injectable({
  providedIn: 'root'
})
export class institucionalService {
  private apiUrl = `${environment.apiUrl}/api/institucional`;

  constructor(private http: HttpClient) {}

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private getCsrfToken(): Observable<string> {
    console.log('🔑 Solicitando CSRF token...');
    
    return this.http.get<{ csrfToken: string }>(
      `${environment.apiUrl}/api/csrf-token`, 
      { withCredentials: true }
    ).pipe(
      switchMap(response => {
        console.log('✅ CSRF token recebido:', response.csrfToken);
        return of(response.csrfToken);
      }),
      catchError(error => {
        console.error('❌ Erro ao obter CSRF token:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: string): Observable<institucional> {
    return this.http.get<institucional>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Erro ao buscar institucional:', error);
        return throwError(() => error);
      })
    );
  }

  getAll(): Observable<institucional[]> {
    return this.http.get<institucional[]>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Erro ao buscar institucionais:', error);
        return of([]);
      })
    );
  }

  create(formData: FormData): Observable<institucional> {
    console.log('🚀 InstitucionalService.create() chamado');
    console.log('📦 FormData recebido:', formData);
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        console.log('🔑 CSRF Token obtido:', csrfToken);
        console.log('🔄 Dentro do switchMap, fazendo POST...');
        
        // ✅ OBTER TOKEN MANUALMENTE
        const authToken = localStorage.getItem('authToken') || 
                        sessionStorage.getItem('authToken');
        
        if (!authToken) {
          console.error('🚨 Token JWT não encontrado!');
          return throwError(() => new Error('Token de autenticação não encontrado'));
        }
        
        const headers = new HttpHeaders({
          'X-CSRF-Token': csrfToken,
          'Authorization': `Bearer ${authToken}` // ✅ ADICIONAR MANUALMENTE
        });

        console.log('📤 Enviando POST com headers:', {
          'X-CSRF-Token': csrfToken,
          'Authorization': `Bearer ${authToken.substring(0, 20)}...`
        });

        return this.http.post<institucional>(this.apiUrl, formData, {
          headers,
          withCredentials: true,
        });
      }),
      catchError(error => {
        console.error('❌ Erro detalhado ao criar institucional:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        return throwError(() => error);
      })
    );
  }

  update(id: string, formData: FormData): Observable<institucional> {
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const authToken = localStorage.getItem('authToken') || 
                        sessionStorage.getItem('authToken');
        
        if (!authToken) {
          console.error('🚨 Token JWT não encontrado!');
          return throwError(() => new Error('Token de autenticação não encontrado'));
        }
        
        const headers = new HttpHeaders({
          'X-CSRF-Token': csrfToken,
          'Authorization': `Bearer ${authToken}`
        });

        return this.http.patch<institucional>(`${this.apiUrl}/${id}`, formData, {
          headers,
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('Erro ao atualizar institucional:', error);
        return throwError(() => error);
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const authToken = localStorage.getItem('authToken') || 
                        sessionStorage.getItem('authToken');
        
        if (!authToken) {
          console.error('🚨 Token JWT não encontrado!');
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
        console.error('Erro ao excluir institucional:', error);
        return throwError(() => error);
      })
    );
  }

  uploadImage(file: File): Observable<{url: string}> {
    const formData = new FormData();
    formData.append('image', file);

    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const headers = new HttpHeaders({
          'X-CSRF-Token': csrfToken,
          ...(this.getAuthToken() && { 'Authorization': `Bearer ${this.getAuthToken()}` })
        });

        return this.http.post<{url: string}>(`${this.apiUrl}/upload-image`, formData, {
          headers,
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('Erro ao fazer upload da imagem:', error);
        return throwError(() => error);
      })
    );
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Erro ao buscar estatísticas:', error);
        return of({
          total: 0,
          ativos: 0,
          inativos: 0,
          recentes: 0
        });
      })
    );
  }
}