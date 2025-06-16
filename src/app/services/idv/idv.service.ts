// idv.service.ts - VERSÃO CORRIGIDA E COMPLETA
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { idv } from '../../models/idv.model';

@Injectable({
  providedIn: 'root'
})
export class IdvService {
  private apiUrl = `${environment.apiUrl}/api/idv`;

  constructor(private http: HttpClient) {}

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private getCsrfToken(): Observable<string> {
    console.log('🔑 IDV Service - Solicitando CSRF token...');
    
    return this.http.get<{ csrfToken: string }>(
      `${environment.apiUrl}/api/csrf-token`, 
      { withCredentials: true }
    ).pipe(
      switchMap(response => {
        console.log('✅ IDV Service - CSRF token recebido:', response.csrfToken);
        return of(response.csrfToken);
      }),
      catchError(error => {
        console.error('❌ IDV Service - Erro ao obter CSRF token:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: string): Observable<idv> {
    console.log('📥 IDV Service - Buscando IDV por ID:', id);
    return this.http.get<idv>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('❌ IDV Service - Erro ao buscar IDV:', error);
        return throwError(() => error);
      })
    );
  }

  getAll(): Observable<idv[]> {
    console.log('📥 IDV Service - Buscando todas as IDVs...');
    return this.http.get<idv[]>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('❌ IDV Service - Erro ao buscar IDVs:', error);
        return of([]);
      })
    );
  }

  create(formData: FormData): Observable<idv> {
    console.log('🚀 IDV Service - create() chamado');
    console.log('📦 IDV Service - FormData recebido:', formData);
    
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        console.log('🔑 IDV Service - CSRF Token obtido:', csrfToken);
        console.log('🔄 IDV Service - Fazendo POST...');
        
        // ✅ OBTER TOKEN MANUALMENTE
        const authToken = localStorage.getItem('authToken') || 
                        sessionStorage.getItem('authToken');
        
        if (!authToken) {
          console.error('🚨 IDV Service - Token JWT não encontrado!');
          return throwError(() => new Error('Token de autenticação não encontrado'));
        }
        
        const headers = new HttpHeaders({
          'X-CSRF-Token': csrfToken,
          'Authorization': `Bearer ${authToken}`
        });

        console.log('📤 IDV Service - Enviando POST com headers:', {
          'X-CSRF-Token': csrfToken,
          'Authorization': `Bearer ${authToken.substring(0, 20)}...`
        });

        return this.http.post<idv>(this.apiUrl, formData, {
          headers,
          withCredentials: true,
        });
      }),
      catchError(error => {
        console.error('❌ IDV Service - Erro detalhado ao criar IDV:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        return throwError(() => error);
      })
    );
  }

  update(id: string, formData: FormData): Observable<idv> {
    console.log('🔄 IDV Service - Atualizando IDV:', id);
    
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const authToken = localStorage.getItem('authToken') || 
                        sessionStorage.getItem('authToken');
        
        if (!authToken) {
          console.error('🚨 IDV Service - Token JWT não encontrado!');
          return throwError(() => new Error('Token de autenticação não encontrado'));
        }
        
        const headers = new HttpHeaders({
          'X-CSRF-Token': csrfToken,
          'Authorization': `Bearer ${authToken}`
        });

        console.log('📤 IDV Service - Enviando PATCH para:', `${this.apiUrl}/${id}`);

        return this.http.patch<idv>(`${this.apiUrl}/${id}`, formData, {
          headers,
          withCredentials: true
        });
      }),
      catchError(error => {
        console.error('❌ IDV Service - Erro ao atualizar IDV:', error);
        return throwError(() => error);
      })
    );
  }

  delete(id: string): Observable<void> {
    console.log('🗑️ IDV Service - Deletando IDV:', id);
    
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const authToken = localStorage.getItem('authToken') || 
                        sessionStorage.getItem('authToken');
        
        if (!authToken) {
          console.error('🚨 IDV Service - Token JWT não encontrado!');
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
        console.error('❌ IDV Service - Erro ao excluir IDV:', error);
        return throwError(() => error);
      })
    );
  }

  uploadImage(file: File): Observable<{url: string}> {
    console.log('📸 IDV Service - Upload de imagem iniciado');
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
        console.error('❌ IDV Service - Erro ao fazer upload da imagem:', error);
        return throwError(() => error);
      })
    );
  }

  getStats(): Observable<any> {
    console.log('📊 IDV Service - Buscando estatísticas...');
    return this.http.get<any>(`${this.apiUrl}/stats`, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('❌ IDV Service - Erro ao buscar estatísticas:', error);
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