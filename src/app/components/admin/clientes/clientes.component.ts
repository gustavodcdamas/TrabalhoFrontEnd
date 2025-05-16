// clientes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  status: 'ativo' | 'inativo';
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  currentPage: number = 1;
  totalPages: number = 3;

  constructor() { }

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    // Simula carregamento de dados de uma API
    this.clientes = [
      {
        id: 1,
        nome: 'João Silva',
        email: 'joao.silva@exemplo.com',
        telefone: '(11) 98765-4321',
        status: 'ativo'
      },
      {
        id: 2,
        nome: 'Maria Oliveira',
        email: 'maria.oliveira@exemplo.com',
        telefone: '(21) 98765-4321',
        status: 'ativo'
      },
      {
        id: 3,
        nome: 'Carlos Santos',
        email: 'carlos.santos@exemplo.com',
        telefone: '(31) 98765-4321',
        status: 'inativo'
      }
    ];
  }

  addCliente(): void {
    // Implementar lógica para adicionar cliente
    console.log('Adicionar cliente');
  }

  editCliente(id: number): void {
    // Implementar lógica para editar cliente
    console.log('Editar cliente', id);
  }

  deleteCliente(id: number): void {
    // Implementar lógica para excluir cliente
    console.log('Excluir cliente', id);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
