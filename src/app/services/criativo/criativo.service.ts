// criativos.service.ts - VERSÃO FINAL SIMPLIFICADA
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { criativos } from '../../models/criativos.model';

@Injectable({
  providedIn: 'root'
})
export class CriativosService {
  private apiUrl = `${environment.apiUrl}/api/criativos`;

  constructor(private http: HttpClient) {}

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private getCsrfToken(): Observable<string> {
    console.log('🔑 Criativos Service - Solicitando CSRF token...');
    
    return this.http.get<{ csrfToken: string }>(
      `${environment.apiUrl}/api/csrf-token`, 
      { withCredentials: true }
    ).pipe(
      switchMap(response => {
        console.log('✅ Criativos Service - CSRF token recebido:', response.csrfToken);
        return of(response.csrfToken);
      }),
      catchError(error => {
        console.error('❌ Criativos Service - Erro ao obter CSRF token:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: string): Observable<criativos> {
    console.log('📥 Criativos Service - Buscando criativo por ID:', id);
    return this.http.get<criativos>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('❌ Criativos Service - Erro ao buscar criativo:', error);
        return throwError(() => error);
      })
    );
  }

  getAll(): Observable<criativos[]> {
    console.log('📥 Criativos Service - Buscando todos os criativos...');
    return this.http.get<criativos[]>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('❌ Criativos Service - Erro ao buscar criativos:', error);
        return of([]);
      })
    );
  }

  create(formData: FormData): Observable<criativos> {
    console.log('🚀 Criativos Service - create() chamado');
    console.log('📦 Criativos Service - FormData recebido:', formData);
    
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        console.log('🔑 Criativos Service - CSRF Token obtido:', csrfToken);
        console.log('🔄 Criativos Service - Fazendo POST...');
        
        // ✅ OBTER TOKEN MANUALMENTE
        const authToken = localStorage.getItem('authToken') || 
                        sessionStorage.getItem('authToken');
        
        if (!authToken) {
          console.error('🚨 Criativos Service - Token JWT não encontrado!');
          return throwError(() => new Error('Token de autenticação não encontrado'));
        }
        
        const headers = new HttpHeaders({
          'X-CSRF-Token': csrfToken,
          'Authorization': `Bearer ${authToken}`
        });

        console.log('📤 Criativos Service - Enviando POST com headers:', {
          'X-CSRF-Token': csrfToken,
          'Authorization': `Bearer ${authToken.substring(0, 20)}...`
        });

        return this.http.post<criativos>(this.apiUrl, formData, {
          headers,
          withCredentials: true,
        });
      }),
      catchError(error => {
        console.error('❌ Criativos Service - Erro detalhado ao criar criativo:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        return throwError(() => error);
      })
    );
  }

  update(id: string, formData: FormData): Observable<criativos> {
    console.log('🔄 Criativos Service - Atualizando criativo:', id);
    
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const authToken = localStorage.getItem('authToken') || 
                        sessionStorage.getItem('authToken');
        
        if (!authToken) {
          console.error('🚨 Criativos Service - Token JWT não encontrado!');
          return throwError(() => new Error('Token de autenticação não encontrado'));
        }
        
        const headers = new HttpHeaders({
          'X-CSRF-Token': csrfToken,
          'Authorization': `Bearer ${authToken}`
        });

        console.log('📤 Criativos Service - Enviando PATCH para:', `${this.apiUrl}/${id}`);

        return this.http.patch<criativos>(`${this.apiUrl}/${id}`, formData, {
          headers,
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('❌ Criativos Service - Erro ao atualizar criativo:', error);
        return throwError(() => error);
      })
    );
  }

  delete(id: string): Observable<void> {
    console.log('🗑️ Criativos Service - Deletando criativo:', id);
    
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const authToken = localStorage.getItem('authToken') || 
                        sessionStorage.getItem('authToken');
        
        if (!authToken) {
          console.error('🚨 Criativos Service - Token JWT não encontrado!');
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
        console.error('❌ Criativos Service - Erro ao excluir criativo:', error);
        return throwError(() => error);
      })
    );
  }

  uploadImage(file: File): Observable<{url: string}> {
    console.log('📸 Criativos Service - Upload de imagem iniciado');
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
        console.error('❌ Criativos Service - Erro ao fazer upload da imagem:', error);
        return throwError(() => error);
      })
    );
  }

  getStats(): Observable<any> {
    console.log('📊 Criativos Service - Buscando estatísticas...');
    return this.http.get<any>(`${this.apiUrl}/stats`, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('❌ Criativos Service - Erro ao buscar estatísticas:', error);
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