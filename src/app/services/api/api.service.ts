import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      errorMessage = `Código: ${error.status}\nMensagem: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Método genérico com retry e timeout
  public request<T>(method: string, endpoint: string, data?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    return this.http.request<T>(method, url, { body: data })
      .pipe(
        timeout(environment.timeout),
        retry(environment.retryAttempts),
        catchError(this.handleError)
      );
  }

  // Métodos específicos
  get<T>(endpoint: string): Observable<T> {
    return this.request<T>('GET', endpoint);
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.request<T>('POST', endpoint, data);
  }
}