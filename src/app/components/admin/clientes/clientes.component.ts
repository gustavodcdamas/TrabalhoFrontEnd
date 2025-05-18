import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  searchTerm: string = '';

  clienteForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  currentClienteId: number | null = null;

  constructor(private fb: FormBuilder) {
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/)]],
      status: ['ativo', Validators.required]
    });
  }

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
      },
      {
        id: 4,
        nome: 'Ana Costa',
        email: 'ana.costa@exemplo.com',
        telefone: '(41) 98765-4321',
        status: 'ativo'
      },
      {
        id: 5,
        nome: 'Paulo Mendes',
        email: 'paulo.mendes@exemplo.com',
        telefone: '(51) 98765-4321',
        status: 'ativo'
      },
      {
        id: 6,
        nome: 'Fernanda Lima',
        email: 'fernanda.lima@exemplo.com',
        telefone: '(61) 98765-4321',
        status: 'inativo'
      }
    ];

    this.filteredClientes = [...this.clientes];
    this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredClientes.length / this.itemsPerPage);
  }

  getPaginatedClientes(): Cliente[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredClientes.slice(startIndex, endIndex);
  }

  searchClientes(): void {
    if (!this.searchTerm.trim()) {
      this.filteredClientes = [...this.clientes];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredClientes = this.clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(term) ||
        cliente.email.toLowerCase().includes(term) ||
        cliente.telefone.includes(term)
      );
    }
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentClienteId = null;
    this.clienteForm.reset({status: 'ativo'});
    this.showModal = true;
  }

  openEditModal(cliente: Cliente): void {
    this.isEditing = true;
    this.currentClienteId = cliente.id;
    this.clienteForm.setValue({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      status: cliente.status
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveCliente(): void {
    if (this.clienteForm.invalid) {
      this.markFormGroupTouched(this.clienteForm);
      return;
    }

    const formValues = this.clienteForm.value;

    if (this.isEditing && this.currentClienteId) {
      // Atualizar cliente existente
      const index = this.clientes.findIndex(c => c.id === this.currentClienteId);
      if (index !== -1) {
        this.clientes[index] = {
          ...this.clientes[index],
          nome: formValues.nome,
          email: formValues.email,
          telefone: formValues.telefone,
          status: formValues.status
        };
      }
    } else {
      // Adicionar novo cliente
      const newId = Math.max(0, ...this.clientes.map(c => c.id)) + 1;
      const newCliente: Cliente = {
        id: newId,
        nome: formValues.nome,
        email: formValues.email,
        telefone: formValues.telefone,
        status: formValues.status
      };

      this.clientes.unshift(newCliente);
    }

    // Atualizar lista filtrada e fechar modal
    this.searchClientes();
    this.closeModal();
  }

  deleteCliente(id: number): void {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.clientes = this.clientes.filter(c => c.id !== id);
      this.searchClientes();
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  getPages(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
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

  // Formatar telefone enquanto o usuário digita
  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length <= 11) {
      let formattedValue = '';

      if (value.length > 0) {
        formattedValue += '(' + value.substring(0, 2);
      }
      if (value.length > 2) {
        formattedValue += ') ' + value.substring(2, 7);
      }
      if (value.length > 7) {
        formattedValue += '-' + value.substring(7, 11);
      }

      this.clienteForm.patchValue({
        telefone: formattedValue
      }, {emitEvent: false});
    }
  }
}
