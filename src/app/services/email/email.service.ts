import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';
import { email } from '../../models/email.model';

interface ContactFormData {
  email: string;
  whatsapp: string;
  message: string;
}

interface ProposalFormData {
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService extends BaseService {
  protected apiEndpoint = '/api/email';

  constructor(http: HttpClient) {
    super(http);
  }

  // ✅ Envio de formulários - sem autenticação mas com CSRF
  sendContactForm(data: ContactFormData): Observable<{ message: string }> {
    this.log('Enviando formulário de contato');
    return this.post<{ message: string }>('', data, false, true);
  }

  sendProposalRequest(data: ProposalFormData): Observable<{ message: string }> {
    this.log('Enviando solicitação de proposta');
    return this.post<{ message: string }>('/proposal', data, false, true);
  }
}