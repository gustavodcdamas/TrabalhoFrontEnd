import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RateLimitGuard implements CanActivate {
  private attempts = new Map<string, number>();

  canActivate(): boolean {
    const ip = 'user-ip'; // Implemente a captura real do IP
    const attempts = this.attempts.get(ip) || 0;
    
    if (attempts > 5) {
      return false;
    }
    
    this.attempts.set(ip, attempts + 1);
    setTimeout(() => this.attempts.delete(ip), 60 * 60 * 1000); // Reset após 1 hora
    return true;
  }
}