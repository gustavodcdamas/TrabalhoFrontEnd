import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';
import { wpp } from '../../models/wpp.model';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService extends BaseService {
  protected apiEndpoint = '/api/wpp';

  constructor(http: HttpClient) {
    super(http);
  }

  // ✅ GET - Público
  getAll(): Observable<wpp[]> {
    this.log('Buscando todos os WhatsApp templates');
    return this.get<wpp[]>('', false, false);
  }

  // ✅ GET por ID - Público
  getById(id: string): Observable<wpp> {
    this.log('Buscando WhatsApp template por ID', id);
    return this.get<wpp>(`/${id}`, false, false);
  }

  // ✅ POST - Protegido
  create(formData: FormData): Observable<wpp> {
    this.log('Criando WhatsApp template');
    return this.post<wpp>('', formData, true, true);
  }

  // ✅ DELETE - Protegido
  delete(id: string): Observable<void> {
    this.log('Deletando wpp', id);
    return this.deleteRequest<void>(`/${id}`, true, true);
  }
}