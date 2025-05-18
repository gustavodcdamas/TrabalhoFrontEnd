// contas.component.ts atualizado
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Conta {
  id: number;
  titulo: string;
  numero: string;
  titular: string;
  validade: string;
  saldo: number;
  status: 'active' | 'inactive' | 'pending';
}

@Component({
  selector: 'app-contas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contas.component.html',
  styleUrl: './contas.component.css'
})
export class ContasComponent implements OnInit {
  contas: Conta[] = [];
  filteredContas: Conta[] = [];
  searchTerm: string = '';
  currentFilter: 'all' | 'active' | 'inactive' | 'pending' = 'all';

  // Modal e Formulário
  showNovaContaModal: boolean = false;
  contaForm: FormGroup;

  // Paginação
  itemsPerPage: number = 6;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private formBuilder: FormBuilder) {
    this.contaForm = this.createContaForm();
  }

  ngOnInit(): void {
    // Simular dados de contas
    this.contas = [
      {
        id: 1,
        titulo: 'Conta Principal',
        numero: '3778 **** **** 1234',
        titular: 'Eddy Cusuma',
        validade: '12/22',
        saldo: 5756,
        status: 'active'
      },
      {
        id: 2,
        titulo: 'Conta Secundária',
        numero: '4556 **** **** 7890',
        titular: 'Eddy Cusuma',
        validade: '09/23',
        saldo: 2134,
        status: 'inactive'
      },
      {
        id: 3,
        titulo: 'Nova Conta',
        numero: '6678 **** **** 5432',
        titular: 'Eddy Cusuma',
        validade: '04/24',
        saldo: 0,
        status: 'pending'
      },
      {
        id: 4,
        titulo: 'Conta Empresarial',
        numero: '5432 **** **** 8765',
        titular: 'Eddy Cusuma',
        validade: '10/25',
        saldo: 12500,
        status: 'active'
      },
      {
        id: 5,
        titulo: 'Conta Poupança',
        numero: '9876 **** **** 5432',
        titular: 'Eddy Cusuma',
        validade: '07/23',
        saldo: 8750,
        status: 'active'
      },
      {
        id: 6,
        titulo: 'Conta Internacional',
        numero: '1234 **** **** 9876',
        titular: 'Eddy Cusuma',
        validade: '11/24',
        saldo: 3250,
        status: 'inactive'
      },
      {
        id: 7,
        titulo: 'Conta Digital',
        numero: '2468 **** **** 1357',
        titular: 'Eddy Cusuma',
        validade: '05/26',
        saldo: 945,
        status: 'pending'
      }
    ];

    this.applyFiltersAndPagination();
  }

  // Método para criar o formulário
  createContaForm(): FormGroup {
    return this.formBuilder.group({
      titulo: ['', Validators.required],
      numero: ['', [Validators.required, Validators.pattern(/^\d{4} \d{4} \d{4} \d{4}$/)]],
      titular: ['', Validators.required],
      validade: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      saldo: [0, Validators.min(0)],
      status: ['active', Validators.required]
    });
  }

  // Métodos para filtrar contas
  filterContas(filter: 'all' | 'active' | 'inactive' | 'pending'): void {
    this.currentFilter = filter;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o filtro
    this.applyFiltersAndPagination();
  }

  // Método para buscar contas
  searchContas(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1; // Resetar para a primeira página ao buscar
    this.applyFiltersAndPagination();
  }

  // Aplicar filtros e paginação
  private applyFiltersAndPagination(): void {
    // Aplicar filtros
    let result = [...this.contas];

    // Filtrar por status
    if (this.currentFilter !== 'all') {
      result = result.filter(conta => conta.status === this.currentFilter);
    }

    // Aplicar o termo de busca
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(conta =>
        conta.titulo.toLowerCase().includes(term) ||
        conta.numero.toLowerCase().includes(term) ||
        conta.titular.toLowerCase().includes(term)
      );
    }

    // Calcular total de páginas
    this.totalPages = Math.ceil(result.length / this.itemsPerPage);

    // Aplicar paginação
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredContas = result.slice(startIndex, endIndex);
  }

  // Método para obter um array para a paginação
  getPaginationArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Método para trocar de página
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.applyFiltersAndPagination();
  }

  // Métodos para o modal
  abrirModalNovaConta(): void {
    this.contaForm.reset({
      status: 'active',
      saldo: 0
    });
    this.showNovaContaModal = true;
  }

  fecharModalNovaConta(): void {
    this.showNovaContaModal = false;
  }

  salvarNovaConta(): void {
    if (this.contaForm.valid) {
      const formValue = this.contaForm.value;

      // Criar nova conta
      const novaConta: Conta = {
        id: this.gerarNovoId(),
        titulo: formValue.titulo,
        numero: formValue.numero,
        titular: formValue.titular,
        validade: formValue.validade,
        saldo: formValue.saldo,
        status: formValue.status
      };

      // Adicionar ao array de contas
      this.contas.unshift(novaConta);

      // Fechar o modal e atualizar a visualização
      this.fecharModalNovaConta();
      this.applyFiltersAndPagination();

      // Notificar o usuário
      alert(`Conta "${novaConta.titulo}" criada com sucesso!`);
    } else {
      // Marcar campos como tocados para mostrar erros
      this.contaForm.markAllAsTouched();
    }
  }

  // Método para gerar novo ID
  private gerarNovoId(): number {
    return this.contas.length > 0
      ? Math.max(...this.contas.map(conta => conta.id)) + 1
      : 1;
  }

  // Método para verificar erro no formulário
  hasError(controlName: string, errorName: string): boolean {
    const control = this.contaForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  // Método para obter label do status
  getStatusLabel(status: 'active' | 'inactive' | 'pending'): string {
    switch(status) {
      case 'active': return 'Ativa';
      case 'inactive': return 'Inativa';
      case 'pending': return 'Pendente';
      default: return '';
    }
  }

  // Métodos para ações nos cartões
  editarConta(id: number): void {
    const conta = this.contas.find(c => c.id === id);
    if (conta) {
      this.contaForm.setValue({
        titulo: conta.titulo,
        numero: conta.numero,
        titular: conta.titular,
        validade: conta.validade,
        saldo: conta.saldo,
        status: conta.status
      });
      this.showNovaContaModal = true;
    }
  }

  verDetalhesConta(id: number): void {
    const conta = this.contas.find(c => c.id === id);
    if (conta) {
      alert(`Detalhes da Conta:\nID: ${conta.id}\nTítulo: ${conta.titulo}\nTitular: ${conta.titular}\nSaldo: ${this.formatCurrency(conta.saldo)}`);
    }
  }

  ativarConta(id: number): void {
    const conta = this.contas.find(c => c.id === id);
    if (conta && (conta.status === 'inactive' || conta.status === 'pending')) {
      conta.status = 'active';
      this.applyFiltersAndPagination();
      alert(`A conta "${conta.titulo}" foi ativada com sucesso!`);
    }
  }

  desativarConta(id: number): void {
    const conta = this.contas.find(c => c.id === id);
    if (conta && conta.status === 'active') {
      if (confirm(`Tem certeza que deseja desativar a conta "${conta.titulo}"?`)) {
        conta.status = 'inactive';
        this.applyFiltersAndPagination();
        alert(`A conta "${conta.titulo}" foi desativada com sucesso!`);
      }
    }
  }

  // Método para formatação de moeda
  formatCurrency(value: number): string {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  }
}
