import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { UserRole } from '../../models/user.model';
import { User } from '../../models/user.model';

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

interface RegisterDto {
  firstName: string; 
  lastName: string;   
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
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
    this.getCsrfToken().subscribe();
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

  public getCsrfToken(): Observable<string> {
    // ✅ Se já tem token em cache, retornar
    if (this.csrfToken) {
      console.log('🔄 Usando CSRF token do cache:', this.csrfToken);
      return of(this.csrfToken);
    }
    
    console.log('🔑 Solicitando novo CSRF token...');
    
    return this.http.get<{ csrfToken: string }>(
      `${environment.apiUrl}/api/csrf-token`, 
      { 
        withCredentials: true,
        // ✅ IMPORTANTE: não enviar headers Authorization para essa rota
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(
      map(response => {
        console.log('✅ CSRF token recebido:', response.csrfToken);
        this.csrfToken = response.csrfToken;
        
        // ✅ OPCIONAL: Salvar também no cookie/localStorage para backup
        if (typeof document !== 'undefined') {
          document.cookie = `XSRF-TOKEN=${this.csrfToken}; path=/; SameSite=Lax`;
        }
        
        return this.csrfToken;
      }),
      catchError(error => {
        console.error('❌ Erro ao obter CSRF token:', error);
        // ✅ Limpar token inválido
        this.csrfToken = null;
        return throwError(() => error);
      })
    );
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    // ✅ Primeiro, tentar pegar do usuário atual
    const user = this.currentUserValue;
    if (user?.token) {
      return user.token;
    }
    
    // ✅ Fallback: tentar do localStorage
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      return storedToken;
    }
    
    // ✅ Último fallback: tentar extrair do currentUser
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        return currentUser.token || null;
      } catch (e) {
        console.error('Erro ao parsear currentUser:', e);
      }
    }
    
    console.warn('🚨 Nenhum token JWT encontrado!');
    return null;
  }

  // Adicione também este método para salvar o token separadamente
  private saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<{exists: boolean}>(`${environment.apiUrl}/api/auth/check-email?email=${encodeURIComponent(email)}`)
      .pipe(map(response => response.exists));
  }

  register(registerData: RegisterDto): Observable<any> {
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        });

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
    localStorage.removeItem('authToken'); // ✅ Limpar token
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

  isTokenExpired(): boolean {
    const token = this.token;
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica o payload do JWT
      const now = Date.now() / 1000; // Tempo atual em segundos
      return payload.exp < now; // Retorna true se o token já expirou
    } catch (e) {
      console.error('Erro ao verificar token JWT:', e);
      return true;
    }
  }

  isLoggedIn(): boolean {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return false;

    try {
      const user: User = JSON.parse(userJson);

      if (!user || !user.token || this.isTokenExpired()) {
        this.logout(); // Remove o usuário do localStorage se o token estiver expirado
        return false;
      }

      // Atualiza o BehaviorSubject se ele estiver vazio
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

  isSuperAdmin(): boolean {
    return this.currentUserValue?.isSuperAdmin || false;
  }

  requestPasswordReset(email: string): Observable<any> {
    console.log('🔥 [AUTH SERVICE] Iniciando requestPasswordReset...');
    console.log('🔥 [AUTH SERVICE] Email:', email);
    
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        });

        // ✅ CORRIGIDO: Estrutura correta - apenas email
        const payload = {
          email: email
        };
        
        console.log('🔥 [AUTH SERVICE] Request Reset Payload:', JSON.stringify(payload, null, 2));
        console.log('🔥 [AUTH SERVICE] URL:', `${this.apiUrl}/api/auth/request-reset-password`);

        return this.http.post(`${this.apiUrl}/api/auth/request-reset-password`, 
          payload, 
          { 
            headers, 
            withCredentials: true 
          }
        ).pipe(
          catchError(error => {
            console.error('🔥 [AUTH SERVICE] Erro no request reset:', error);
            console.error('🔥 [AUTH SERVICE] Error details:', error.error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  resetPassword(token: string, newPassword: string, confirmPassword?: string): Observable<any> {
    console.log('🔥 [AUTH SERVICE] Iniciando resetPassword...');
    console.log('🔥 [AUTH SERVICE] Token:', token ? '[PRESENTE]' : '[AUSENTE]');
    console.log('🔥 [AUTH SERVICE] newPassword:', newPassword ? `${newPassword.length} chars` : '[AUSENTE]');
    console.log('🔥 [AUTH SERVICE] confirmPassword:', confirmPassword ? `${confirmPassword.length} chars` : '[AUSENTE]');
    
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        console.log('🔥 [AUTH SERVICE] CSRF Token obtido:', csrfToken);
        
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        });

        // ✅ CORRIGIDO: Estrutura correta com todos os campos obrigatórios
        const payload = {
          token: token,                                    // ✅ Campo obrigatório
          newPassword: newPassword,                        // ✅ Campo obrigatório  
          confirmPassword: confirmPassword || newPassword  // ✅ Campo obrigatório
        };
        
        console.log('🔥 [AUTH SERVICE] Reset Password Payload:', JSON.stringify(payload, null, 2));
        console.log('🔥 [AUTH SERVICE] URL:', `${this.apiUrl}/api/auth/reset-password`);
        
        return this.http.post(`${this.apiUrl}/api/auth/reset-password`, 
          payload, 
          { 
            headers, 
            withCredentials: true 
          }
        ).pipe(
          catchError(error => {
            console.error('🔥 [AUTH SERVICE] Erro no reset password:', error);
            console.error('🔥 [AUTH SERVICE] Status:', error.status);
            console.error('🔥 [AUTH SERVICE] Error details:', error.error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  validateResetToken(token: string): Observable<boolean> {
    console.log('🔥 [AUTH SERVICE] Validating token...');
    
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        });

        // ✅ CORRIGIDO: Estrutura correta - apenas token
        const payload = {
          token: token
        };

        console.log('🔥 [AUTH SERVICE] Validate Token Payload:', JSON.stringify(payload, null, 2));

        return this.http.post<boolean>(`${this.apiUrl}/api/auth/validate-reset-token`, 
          payload, 
          { 
            headers, 
            withCredentials: true 
          }
        ).pipe(
          catchError(error => {
            console.error('🔥 [AUTH SERVICE] Erro ao validar token:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  isResetTokenUsed(token: string): Observable<boolean> {
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        });

        // ✅ CORRIGIDO: Estrutura correta - apenas token
        const payload = {
          token: token
        };

        console.log('🔥 [AUTH SERVICE] Is Token Used Payload:', JSON.stringify(payload, null, 2));

        return this.http.post<boolean>(`${this.apiUrl}/api/auth/is-reset-token-used`, 
          payload, 
          { 
            headers, 
            withCredentials: true 
          }
        ).pipe(
          catchError(error => {
            console.error('🔥 [AUTH SERVICE] Erro ao verificar token usado:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  redirectToUserArea(user?: User): void {
    const currentUser = user || this.currentUserValue;
    
    if (!currentUser) {
      console.warn('Nenhum usuário encontrado para redirecionamento');
      this.router.navigate(['/']);
      return;
    }

    console.log('Redirecionando usuário:', currentUser.email, 'Role:', currentUser.role);

    switch (currentUser.role) {
      case UserRole.CLIENT:
        console.log('✅ Redirecionando CLIENTE para /cliente');
        this.router.navigate(['/cliente']);
        break;
        
      case UserRole.ADMIN:
        console.log('✅ Redirecionando ADMIN para /admin');
        this.router.navigate(['/admin']);
        break;
        
      case UserRole.SUPER_ADMIN:
        console.log('✅ Redirecionando SUPER_ADMIN para /admin');
        this.router.navigate(['/admin']); // ou /super-admin se quiser área separada
        break;
        
      default:
        console.warn('❌ Role não reconhecido:', currentUser.role);
        this.router.navigate(['/']);
        break;
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        });

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

            // ✅ SALVAR EM MÚLTIPLOS LOCAIS PARA GARANTIR
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authToken', response.access_token);
            sessionStorage.setItem('authToken', response.access_token);
            
            this.currentUserSubject.next(user);
            
            console.log('✅ Login realizado com sucesso:', {
              userId: user.id,
              email: user.email,
              role: user.role,
              tokenSaved: !!response.access_token
            });
            
            return user;
          }),
          catchError(err => {
            console.error('❌ Erro ao fazer login:', err);
            return throwError(() => err);
          })
        );
      })
    );
  }
    
}