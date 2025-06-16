import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { endereco } from '../../models/endereco.model';

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private viaCepUrl = 'https://viacep.com.br/ws/'; // URL direta, mais confiável

  constructor(private http: HttpClient) { 
    console.log('🏗️ CepService inicializado');
  }

  getEnderecoByCep(cep: string): Observable<endereco> {
    console.log('🔍 CepService.getEnderecoByCep chamado com CEP:', cep);
    
    // Limpar CEP
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      console.error('❌ CEP deve ter exatamente 8 dígitos:', cepLimpo);
      return throwError(() => new Error('CEP deve ter 8 dígitos'));
    }
    
    const url = `${this.viaCepUrl}${cepLimpo}/json/`;
    console.log('🌐 Fazendo requisição para:', url);
    
    return this.http.get<endereco>(url).pipe(
      map((response) => {
        console.log('📨 Resposta bruta da ViaCEP:', response);
        
        // ViaCEP retorna { erro: true } quando CEP não existe
        if (response.erro) {
          console.error('❌ CEP não encontrado');
          throw new Error('CEP não encontrado');
        }
        
        console.log('✅ CEP encontrado:', {
          cep: response.cep,
          logradouro: response.logradouro,
          bairro: response.bairro,
          cidade: response.localidade, // ⚠️ ViaCEP usa 'localidade'
          estado: response.uf
        });
        
        return response;
      }),
      catchError((error) => {
        console.error('💥 Erro na requisição ViaCEP:', error);
        return throwError(() => new Error('Erro ao buscar CEP'));
      })
    );
  }
}