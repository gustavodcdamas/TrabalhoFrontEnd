import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { User, UserRole } from '../../models/user.model';

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    isSuperAdmin: boolean;
    isAdmin: boolean;
    isClient: boolean;
  };
}

interface UpdateUserResponse {
  message: string;
  user: User;
}

interface RegisterDto {
  firstName: string; 
  lastName: string;   
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  public csrfToken: string | null = null;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {
    const user = this.loadUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
    this.initializeCsrfToken();
  }

  private loadUserFromStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Error parsing user data', e);
      return null;
    }
  }

  clearAuthState(): void {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  private initializeCsrfToken(): void {
    this.getCsrfToken().subscribe({
      next: (token) => {
        console.log('CSRF token initialized:', token ? 'success' : 'failed');
      },
      error: (err) => {
        console.warn('Failed to initialize CSRF token:', err);
      }
    });
  }

  public getCsrfToken(): Observable<string> {
    if (this.csrfToken) {
      return of(this.csrfToken);
    }
    
    console.log('🔑 Solicitando CSRF token...');
    
    return this.http.get<{ csrfToken: string }>(
      `${environment.apiUrl}/api/csrf-token`, 
      { withCredentials: true }
    ).pipe(
      map(response => {
        console.log('✅ CSRF token recebido:', response.csrfToken);
        this.csrfToken = response.csrfToken;
        return this.csrfToken;
      }),
      catchError(error => {
        console.error('❌ Erro ao obter CSRF token:', error);
        // Se falhar, retornar string vazia para continuar sem CSRF
        this.csrfToken = '';
        return of('');
      })
    );
  }

  private getAuthHeaders(): Observable<HttpHeaders> {
    const token = this.token;
    
    return this.getCsrfToken().pipe(
      map(csrfToken => {
        const headers: any = {
          'Content-Type': 'application/json'
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        if (csrfToken) {
          headers['X-CSRF-Token'] = csrfToken; // Corrigido o nome do header
        }

        return new HttpHeaders(headers);
      })
    );
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    const user = this.currentUserValue;
    if (user?.token) {
      return user.token;
    }
    
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      return storedToken;
    }
    
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        return currentUser.token || null;
      } catch (e) {
        console.error('Erro ao parsear currentUser:', e);
      }
    }
    
    return null;
  }

  private saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  login(email: string, password: string): Observable<User> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, 
          { email, password }, 
          { headers, withCredentials: true }
        ).pipe(
          map(response => {
            const user: User = {
              id: response.user.id,
              email: response.user.email,
              firstName: '',
              lastName: '',
              role: response.user.role,
              isSuperAdmin: response.user.isSuperAdmin,
              isAdmin: response.user.isAdmin,
              isClient: response.user.isClient,
              token: response.access_token,
              username: '',
              cpf: ''
            };

            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authToken', response.access_token);
            sessionStorage.setItem('authToken', response.access_token);
            
            this.currentUserSubject.next(user);
            
            console.log('✅ Login realizado com sucesso:', {
              userId: user.id,
              email: user.email,
              tokenSaved: !!response.access_token
            });
            
            return user;
          }),
          catchError(err => {
            console.error('Erro ao fazer login:', err);
            return throwError(() => err);
          })
        );
      })
    );
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<{exists: boolean}>(`${environment.apiUrl}/api/auth/check-email?email=${encodeURIComponent(email)}`)
      .pipe(map(response => response.exists));
  }

  register(registerData: RegisterDto): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.post(`${environment.apiUrl}/api/auth/register`, registerData, {
          headers,
          withCredentials: true
        }).pipe(
          catchError(error => {
            if (error.status === 409) {
              error.error.message = error.error.message || 'Este e-mail já está cadastrado';
            }
            return throwError(() => error);
          })
        );
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserValue;
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUserValue;
    return roles.some(role => user?.role === role);
  }

  private getDecodedToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error decoding JWT token:', e);
      return null;
    }
  }

  isTokenExpired(): boolean {
    const token = this.token;
    if (!token) return true;

    const decoded = this.getDecodedToken(token);
    if (!decoded) return true;

    const now = Date.now() / 1000;
    return decoded.exp < now;
  }

  getTokenExpirationDate(): Date | null {
    const token = this.token;
    if (!token) return null;

    const decoded = this.getDecodedToken(token);
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
  }

  isLoggedIn(): boolean {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return false;

    try {
      const user: User = JSON.parse(userJson);

      if (!user || !user.token || this.isTokenExpired()) {
        this.logout();
        return false;
      }

      if (!this.currentUserValue) {
        this.currentUserSubject.next(user);
      }

      return true;
    } catch (e) {
      console.error('Erro ao verificar estado de login:', e);
      this.logout();
      return false;
    }
  }

  isAdmin(): boolean {
    return this.currentUserValue?.isAdmin || false;
  }

  validarCepComApiCorreios(cep: string, endereco: any): Observable<boolean> {
    return this.http.get(`https://viacep.com.br/ws/${cep}/json/`)
      .pipe(
        map((response: any) => {
          return response.logradouro === endereco.logradouro &&
                response.bairro === endereco.bairro &&
                response.localidade === endereco.cidade &&
                response.uf === endereco.estado;
        }),
        catchError(() => of(false))
      );
  }

  isSuperAdmin(): boolean {
    return this.currentUserValue?.isSuperAdmin || false;
  }

  findByResetPasswordExpiresGreaterThan(date: Date): Observable<User[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<User[]>(`${environment.apiUrl}/api/users/reset-expires`, {
          headers,
          params: { date: date.toISOString() }
        }).pipe(
          catchError(error => {
            console.error('Error fetching users by reset expiration:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  updateUser(id: string, userData: Partial<User>): Observable<UpdateUserResponse> {
    console.log('🔄 Atualizando usuário:', { id, userData });
    
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        console.log('📝 Headers enviados:', headers);
        
        return this.http.patch<UpdateUserResponse>(`${environment.apiUrl}/api/users/${id}`, userData, { 
          headers,
          withCredentials: true 
        }).pipe(
          tap(response => {
            console.log('✅ Resposta do servidor:', response);
            
            // Atualizar usuário local se for o usuário atual
            const currentUser = this.currentUserValue;
            if (currentUser && currentUser.id === id && response.user) {
              const mergedUser = { ...currentUser, ...response.user };
              this.currentUserSubject.next(mergedUser);
              localStorage.setItem('currentUser', JSON.stringify(mergedUser));
            }
          }),
          catchError(error => {
            console.error('❌ Error updating user:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  findOneByEmail(email: string, includePassword = false): Observable<User> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<User>(`${environment.apiUrl}/api/users/email/${encodeURIComponent(email)}`, {
          headers,
          params: { includePassword: includePassword.toString() }
        });
      })
    );
  }

  validateResetToken(token: string): Observable<boolean> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.post<boolean>(`${environment.apiUrl}/api/auth/validate-reset-token`, 
          { token }, 
          { headers }
        );
      })
    );
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.post<void>(
          `${environment.apiUrl}/api/auth/request-reset-password`, 
          { email },
          { headers }
        );
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.post<void>(`${environment.apiUrl}/api/auth/reset-password`, {
          token,
          newPassword
        }, { headers });
      })
    );
  }

  getUserById(id: string): Observable<User | null> {
    console.log('👤 Buscando usuário por ID:', id);
    
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        console.log('📝 Headers para busca:', headers);
        
        return this.http.get<User>(`${environment.apiUrl}/api/users/${id}`, { 
          headers,
          withCredentials: true 
        }).pipe(
          tap(user => console.log('✅ Usuário encontrado:', user)),
          catchError(error => {
            console.error('❌ Erro ao buscar usuário:', error);
            return of(null);
          })
        );
      })
    );
  }

  // Novo método para deletar conta
  requestAccountDeletion(email: string): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.post(`${environment.apiUrl}/api/auth/request-account-deletion`, 
          { email }, 
          { headers, withCredentials: true }
        );
      })
    );
  }

  // Método para confirmar exclusão da conta
  confirmAccountDeletion(token: string): Observable<boolean> {
    return this.http.get<{ success: boolean }>(`${environment.apiUrl}/api/auth/confirm-account-deletion?token=${token}`)
      .pipe(
        map(response => response.success),
        catchError(() => of(false))
      );
  }
}