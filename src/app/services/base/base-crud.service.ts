// base-crud.service.ts - Serviço base CRUD usando o BaseService
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { BaseService } from './base.service';

export interface BaseEntity {
  id: string;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
  status?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface SearchParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export abstract class BaseCrudService<T extends BaseEntity> extends BaseService {
  protected abstract override apiEndpoint: string;
  
  // Estado reativo da entidade
  private entitiesSubject = new BehaviorSubject<T[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables públicos
  public entities$ = this.entitiesSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  // Cache simples
  private lastLoad: number = 0;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutos

  constructor(protected override http: HttpClient) {
    super(http);
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Carrega todas as entidades
   */
  loadEntities(forceReload: boolean = false): Observable<T[]> {
    const now = Date.now();
    const shouldUseCache = !forceReload && 
                          this.entitiesSubject.value.length > 0 && 
                          (now - this.lastLoad) < this.cacheTimeout;

    if (shouldUseCache) {
      console.log(`🚀 [${this.constructor.name}] Usando cache, dados carregados há ${Math.round((now - this.lastLoad) / 1000)}s`);
      return of(this.entitiesSubject.value);
    }

    console.log(`📥 [${this.constructor.name}] Carregando dados do servidor...`);
    this.setLoading(true);
    this.setError(null);

    return this.get<T[]>('')
      .pipe(
        tap(entities => {
          console.log(`✅ [${this.constructor.name}] ${entities.length} entidades carregadas`);
          this.entitiesSubject.next(entities);
          this.lastLoad = now;
        }),
        catchError(error => {
          console.error(`❌ [${this.constructor.name}] Erro ao carregar:`, error);
          this.handleLoadError('Erro ao carregar dados', error);
          return of([]);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Busca entidade por ID
   */
  getById(id: string): Observable<T | null> {
    console.log(`🔍 [${this.constructor.name}] Buscando entidade ID: ${id}`);
    
    // Primeiro tenta buscar no cache
    const cachedEntity = this.entitiesSubject.value.find(entity => entity.id === id);
    if (cachedEntity) {
      console.log(`✅ [${this.constructor.name}] Entidade encontrada no cache`);
      return of(cachedEntity);
    }

    // Se não encontrar no cache, busca no servidor
    return this.get<T>(`/${id}`)
      .pipe(
        tap(entity => console.log(`✅ [${this.constructor.name}] Entidade carregada do servidor:`, entity)),
        catchError(error => {
          console.error(`❌ [${this.constructor.name}] Erro ao buscar por ID:`, error);
          this.handleLoadError(`Erro ao buscar ${this.constructor.name}`, error);
          return of(null);
        })
      );
  }

  /**
   * Cria nova entidade
   */
  create(data: FormData | Partial<T>): Observable<T> {
    console.log(`📝 [${this.constructor.name}] Criando nova entidade...`);
    this.setLoading(true);
    this.setError(null);

    return this.post<T>('', data)
      .pipe(
        tap(newEntity => {
          console.log(`✅ [${this.constructor.name}] Entidade criada:`, newEntity);
          // Adiciona a nova entidade ao cache
          const current = this.entitiesSubject.value;
          this.entitiesSubject.next([newEntity, ...current]);
        }),
        catchError(error => {
          console.error(`❌ [${this.constructor.name}] Erro ao criar:`, error);
          this.handleLoadError('Erro ao criar', error);
          throw error;
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Atualiza entidade existente
   */
  update(id: string, data: FormData | Partial<T>): Observable<T> {
    console.log(`📝 [${this.constructor.name}] Atualizando entidade ID: ${id}`);
    this.setLoading(true);
    this.setError(null);

    return this.patch<T>(`/${id}`, data)
      .pipe(
        tap(updatedEntity => {
          console.log(`✅ [${this.constructor.name}] Entidade atualizada:`, updatedEntity);
          // Atualiza a entidade no cache
          const current = this.entitiesSubject.value;
          const index = current.findIndex(entity => entity.id === id);
          if (index !== -1) {
            current[index] = updatedEntity;
            this.entitiesSubject.next([...current]);
          }
        }),
        catchError(error => {
          console.error(`❌ [${this.constructor.name}] Erro ao atualizar:`, error);
          this.handleLoadError('Erro ao atualizar', error);
          throw error;
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Exclui entidade
   */
  delete(id: string): Observable<any> {
    console.log(`🗑️ [${this.constructor.name}] Excluindo entidade ID: ${id}`);
    this.setLoading(true);
    this.setError(null);

    return this.deleteRequest(`/${id}`)
      .pipe(
        tap(() => {
          console.log(`✅ [${this.constructor.name}] Entidade excluída com sucesso`);
          // Remove a entidade do cache
          const current = this.entitiesSubject.value;
          const filtered = current.filter(entity => entity.id !== id);
          this.entitiesSubject.next(filtered);
        }),
        catchError(error => {
          console.error(`❌ [${this.constructor.name}] Erro ao excluir:`, error);
          this.handleLoadError('Erro ao excluir', error);
          throw error;
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Busca entidades com parâmetros
   */
  search(params: SearchParams): Observable<T[]> {
    console.log(`🔍 [${this.constructor.name}] Buscando com parâmetros:`, params);
    
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    const endpoint = `/search?${httpParams.toString()}`;
    return this.get<T[]>(endpoint)
      .pipe(
        tap(results => console.log(`✅ [${this.constructor.name}] ${results.length} resultados encontrados`)),
        catchError(error => {
          console.error(`❌ [${this.constructor.name}] Erro na busca:`, error);
          this.handleLoadError('Erro na busca', error);
          return of([]);
        })
      );
  }

  /**
   * Invalidar cache
   */
  invalidateCache(): void {
    console.log(`🔄 [${this.constructor.name}] Cache invalidado`);
    this.lastLoad = 0;
    this.entitiesSubject.next([]);
  }

  /**
   * Recarregar dados
   */
  refresh(): Observable<T[]> {
    console.log(`🔄 [${this.constructor.name}] Recarregando dados...`);
    return this.loadEntities(true);
  }

  // ===== MÉTODOS PROTEGIDOS =====

  protected setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  protected setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  protected handleLoadError(message: string, error: any): void {
    let errorMessage = message;
    
    if (error?.message) {
      errorMessage = error.message;
    }
    
    this.setError(errorMessage);
  }

  // ===== GETTERS =====

  get currentEntities(): T[] {
    return this.entitiesSubject.value;
  }

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get currentError(): string | null {
    return this.errorSubject.value;
  }

  // ===== MÉTODOS COMPATIBILIDADE =====

  /**
   * Método para compatibilidade com código existente
   */
  getAll(): Observable<T[]> {
    return this.loadEntities();
  }
}