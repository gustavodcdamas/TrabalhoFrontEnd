import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="unauthorized-container">
      <h1>Acesso não autorizado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <button (click)="goBack()">Voltar</button>
      <button *ngIf="!authService.isLoggedIn()" (click)="login()">Login</button>
    </div>
  `,
  styleUrls: ['./unauthorized.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class UnauthorizedComponent {
  constructor(public authService: AuthService, private router: Router) {}

  goBack() {
    window.history.back();
  }

  login() {
    this.router.navigate(['/auth/login']);
  }
}