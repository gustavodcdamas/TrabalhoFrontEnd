// compras.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Compra {
  id: number;
  item: string;
  categoria: string;
  data: Date;
  valor: number;
  status: 'pending' | 'processing' | 'completed';
  icone: string;
}

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.css'
})
export class ComprasComponent implements OnInit {
  compras: Compra[] = [];
  filteredCompras: Compra[] = [];
  searchTerm: string = '';
  currentFilter: 'all' | 'pending' | 'processing' | 'completed' = 'all';

  constructor() { }

  ngOnInit(): void {
    // Simular dados de compras
    this.compras = [
      {
        id: 1001,
        item: 'Design de Logo',
        categoria: 'Design',
        data: new Date(2025, 3, 15),
        valor: 599,
        status: 'completed',
        icone: 'design-icon.svg'
      },
      {
        id: 1002,
        item: 'Campanha de Marketing Digital',
        categoria: 'Marketing',
        data: new Date(2025, 4, 2),
        valor: 1499,
        status: 'processing',
        icone: 'campaign-icon.svg'
      },
      {
        id: 1003,
        item: 'Desenvolvimento de Website',
        categoria: 'Web',
        data: new Date(2025, 4, 10),
        valor: 2499,
        status: 'pending',
        icone: 'web-icon.svg'
      },
      {
        id: 1004,
        item: 'Gestão de Redes Sociais (Maio)',
        categoria: 'Marketing',
        data: new Date(2025, 4, 1),
        valor: 899,
        status: 'processing',
        icone: 'social-icon.svg'
      },
      {
        id: 1005,
        item: 'Design de Cartão de Visita',
        categoria: 'Design',
        data: new Date(2025, 3, 20),
        valor: 199,
        status: 'completed',
        icone: 'print-icon.svg'
      },
      {
        id: 1006,
        item: 'SEO - Otimização de Site',
        categoria: 'Web',
        data: new Date(2025, 4, 15),
        valor: 799,
        status: 'pending',
        icone: 'seo-icon.svg'
      }
    ];

    this.filteredCompras = [...this.compras];
  }

  // Métodos para filtrar compras
  filterCompras(filter: 'all' | 'pending' | 'processing' | 'completed'): void {
    this.currentFilter = filter;

    if (filter === 'all') {
      this.filteredCompras = [...this.compras];
    } else {
      this.filteredCompras = this.compras.filter(compra => compra.status === filter);
    }

    // Aplicar também o termo de pesquisa, se houver
    if (this.searchTerm) {
      this.applySearch();
    }
  }

  // Método para buscar compras
  searchCompras(term: string): void {
    this.searchTerm = term;
    this.applySearch();
  }

  private applySearch(): void {
    // Primeiro filtra por status
    let result = this.currentFilter === 'all'
      ? [...this.compras]
      : this.compras.filter(compra => compra.status === this.currentFilter);

    // Depois aplica o termo de busca
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(compra =>
        compra.item.toLowerCase().includes(term) ||
        compra.categoria.toLowerCase().includes(term) ||
        compra.id.toString().includes(term)
      );
    }

    this.filteredCompras = result;
  }

  // Métodos para dashboard
  getComprasByStatus(status: 'pending' | 'processing' | 'completed'): number {
    return this.compras.filter(compra => compra.status === status).length;
  }

  getTotalGasto(): number {
    return this.compras.reduce((total, compra) => total + compra.valor, 0);
  }

  // Método para obter label do status
  getStatusLabel(status: 'pending' | 'processing' | 'completed'): string {
    switch(status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Em Processamento';
      case 'completed': return 'Concluída';
      default: return '';
    }
  }

  // Métodos para ações
  novaCompra(): void {
    alert('Funcionalidade de criar nova compra será implementada!');
  }

  editarCompra(id: number): void {
    alert(`Editar compra com ID: ${id}`);
  }

  verDetalhesCompra(id: number): void {
    alert(`Ver detalhes da compra com ID: ${id}`);
  }

  cancelarCompra(id: number): void {
    if (confirm(`Tem certeza que deseja cancelar a compra #${id}?`)) {
      alert(`Compra #${id} cancelada com sucesso!`);
    }
  }

  downloadComprovante(id: number): void {
    alert(`Download do comprovante da compra #${id} iniciado.`);
  }

  // Método para formatação de moeda
  formatCurrency(value: number): string {
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  }
}
