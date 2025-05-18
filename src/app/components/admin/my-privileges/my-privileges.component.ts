// my-privileges.component.ts (completo)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface User {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  nivelAcesso: 'admin' | 'manager' | 'editor' | 'user';
  status: 'active' | 'inactive';
  avatarUrl?: string;
  permissoes: {
    modulo: number;
    permissoes: number[];
  }[];
}

interface Modulo {
  id: number;
  nome: string;
  descricao: string;
  icone: string;
  permissoes: Permissao[];
}

interface Permissao {
  id: number;
  nome: string;
  descricao: string;
  concedida: boolean;
}

interface ActivityLog {
  id: number;
  tipo: 'login' | 'logout' | 'create' | 'edit' | 'delete';
  mensagem: string;
  data: Date;
}

@Component({
  selector: 'app-my-privileges',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './my-privileges.component.html',
  styleUrl: './my-privileges.component.css'
})
export class MyPrivilegesComponent implements OnInit {
  // Usuário atual
  currentUser: User;
  isAdmin: boolean = false;

  // Módulos do sistema
  modulos: Modulo[] = [];

  // Histórico de atividades
  activityLogs: ActivityLog[] = [];

  // Gerenciamento de usuários
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';

  // Modal de gerenciar usuários
  showGerenciarUsuariosModal: boolean = false;

  // Modal de editar permissões
  showEditarPermissoesModal: boolean = false;
  selectedUser: User | null = null;
  tempPermissoes: {
    modulo: number;
    permissoes: number[];
  }[] = [];

  // Modal de novo/editar usuário
  showUserFormModal: boolean = false;
  userForm: FormGroup;
  isEditMode: boolean = false;
  selectedUserId: number | null = null;

  constructor(private formBuilder: FormBuilder) {
    this.userForm = this.createUserForm();

    // Simular usuário atual
    this.currentUser = {
      id: 1,
      nome: 'Eddy Cusuma',
      email: 'eddy@cuei.com.br',
      cargo: 'Diretor de Design',
      nivelAcesso: 'admin',
      status: 'active',
      avatarUrl: 'assets/images/profile.jpg',
      permissoes: [
        { modulo: 1, permissoes: [1, 2, 3, 4, 5] },
        { modulo: 2, permissoes: [1, 2, 3, 4] },
        { modulo: 3, permissoes: [1, 2, 3] },
        { modulo: 4, permissoes: [1, 2] }
      ]
    };

    // Verificar se é administrador
    this.isAdmin = this.currentUser.nivelAcesso === 'admin';
  }

  ngOnInit(): void {
    // Carregar módulos do sistema
    this.modulos = [
      {
        id: 1,
        nome: 'Dashboard',
        descricao: 'Acesso ao painel de controle e métricas do sistema.',
        icone: 'fas fa-chart-line',
        permissoes: [
          { id: 1, nome: 'Visualizar Dashboard', descricao: 'Permite visualizar o painel de controle', concedida: true },
          { id: 2, nome: 'Exportar Relatórios', descricao: 'Permite exportar relatórios do sistema', concedida: true },
          { id: 3, nome: 'Configurar Widgets', descricao: 'Permite configurar widgets do dashboard', concedida: true },
          { id: 4, nome: 'Visualizar Métricas Financeiras', descricao: 'Permite visualizar métricas financeiras', concedida: true },
          { id: 5, nome: 'Visualizar Previsões', descricao: 'Permite visualizar previsões e tendências', concedida: true }
        ]
      },
      {
        id: 2,
        nome: 'Clientes',
        descricao: 'Gerenciamento de clientes e seus projetos associados.',
        icone: 'fas fa-users',
        permissoes: [
          { id: 1, nome: 'Visualizar Clientes', descricao: 'Permite visualizar a lista de clientes', concedida: true },
          { id: 2, nome: 'Adicionar Clientes', descricao: 'Permite adicionar novos clientes', concedida: true },
          { id: 3, nome: 'Editar Clientes', descricao: 'Permite editar clientes existentes', concedida: true },
          { id: 4, nome: 'Excluir Clientes', descricao: 'Permite excluir clientes do sistema', concedida: true }
        ]
      },
      {
        id: 3,
        nome: 'Contas',
        descricao: 'Gerenciamento de contas e cartões da empresa.',
        icone: 'fas fa-credit-card',
        permissoes: [
          { id: 1, nome: 'Visualizar Contas', descricao: 'Permite visualizar as contas', concedida: true },
          { id: 2, nome: 'Adicionar Contas', descricao: 'Permite adicionar novas contas', concedida: true },
          { id: 3, nome: 'Visualizar Transações', descricao: 'Permite visualizar transações', concedida: true }
        ]
      },
      {
        id: 4,
        nome: 'Serviços',
        descricao: 'Gerenciamento dos serviços oferecidos pela empresa.',
        icone: 'fas fa-briefcase',
        permissoes: [
          { id: 1, nome: 'Visualizar Serviços', descricao: 'Permite visualizar a lista de serviços', concedida: true },
          { id: 2, nome: 'Adicionar Serviços', descricao: 'Permite adicionar novos serviços', concedida: true }
        ]
      },
      {
        id: 5,
        nome: 'Compras',
        descricao: 'Gerenciamento de compras e despesas da empresa.',
        icone: 'fas fa-shopping-cart',
        permissoes: [
          { id: 1, nome: 'Visualizar Compras', descricao: 'Permite visualizar a lista de compras', concedida: false },
          { id: 2, nome: 'Adicionar Compras', descricao: 'Permite adicionar novas compras', concedida: false },
          { id: 3, nome: 'Aprovar Compras', descricao: 'Permite aprovar requisições de compra', concedida: false }
        ]
      },
      {
        id: 6,
        nome: 'IDVs',
        descricao: 'Gerenciamento de projetos de identidade visual.',
        icone: 'fas fa-palette',
        permissoes: [
          { id: 1, nome: 'Visualizar IDVs', descricao: 'Permite visualizar projetos de IDV', concedida: true },
          { id: 2, nome: 'Criar IDVs', descricao: 'Permite criar novos projetos de IDV', concedida: false },
          { id: 3, nome: 'Enviar Arquivos', descricao: 'Permite enviar arquivos para os projetos', concedida: false },
          { id: 4, nome: 'Aprovar IDVs', descricao: 'Permite aprovar projetos de IDV', concedida: false }
        ]
      },
      {
        id: 7,
        nome: 'Usuários',
        descricao: 'Gerenciamento de usuários e permissões do sistema.',
        icone: 'fas fa-user-shield',
        permissoes: [
          { id: 1, nome: 'Visualizar Usuários', descricao: 'Permite visualizar a lista de usuários', concedida: false },
          { id: 2, nome: 'Adicionar Usuários', descricao: 'Permite adicionar novos usuários', concedida: false },
          { id: 3, nome: 'Editar Usuários', descricao: 'Permite editar usuários existentes', concedida: false },
          { id: 4, nome: 'Gerenciar Permissões', descricao: 'Permite gerenciar permissões de usuários', concedida: false }
        ]
      },
      {
        id: 8,
        nome: 'Configurações',
        descricao: 'Configurações gerais do sistema e da conta.',
        icone: 'fas fa-cog',
        permissoes: [
          { id: 1, nome: 'Visualizar Configurações', descricao: 'Permite visualizar as configurações', concedida: true },
          { id: 2, nome: 'Editar Configurações', descricao: 'Permite editar configurações do sistema', concedida: false },
          { id: 3, nome: 'Gerenciar Backups', descricao: 'Permite gerenciar backups do sistema', concedida: false }
        ]
      }
    ];

    // Atualizar status das permissões baseado no usuário atual
    this.atualizarStatusPermissoes();

    // Carregar histórico de atividades
    this.activityLogs = [
      {
        id: 1,
        tipo: 'login',
        mensagem: 'Login realizado com sucesso',
        data: new Date(2025, 4, 17, 8, 30)
      },
      {
        id: 2,
        tipo: 'edit',
        mensagem: 'Editou o perfil do usuário "João Silva"',
        data: new Date(2025, 4, 16, 14, 45)
      },
      {
        id: 3,
        tipo: 'create',
        mensagem: 'Criou um novo projeto de IDV para "Café Aroma"',
        data: new Date(2025, 4, 15, 11, 20)
      },
      {
        id: 4,
        tipo: 'login',
        mensagem: 'Login realizado com sucesso',
        data: new Date(2025, 4, 15, 8, 15)
      },
      {
        id: 5,
        tipo: 'logout',
        mensagem: 'Logout do sistema',
        data: new Date(2025, 4, 14, 18, 30)
      }
    ];

    // Carregar usuários (apenas para admins)
    if (this.isAdmin) {
      this.users = [
        {
          id: 1,
          nome: 'Eddy Cusuma',
          email: 'eddy@cuei.com.br',
          cargo: 'Diretor de Design',
          nivelAcesso: 'admin',
          status: 'active',
          avatarUrl: 'assets/images/profile.jpg',
          permissoes: [
            { modulo: 1, permissoes: [1, 2, 3, 4, 5] },
            { modulo: 2, permissoes: [1, 2, 3, 4] },
            { modulo: 3, permissoes: [1, 2, 3] },
            { modulo: 4, permissoes: [1, 2] }
          ]
        },
        {
          id: 2,
          nome: 'Ana Silva',
          email: 'ana@cuei.com.br',
          cargo: 'Gerente de Marketing',
          nivelAcesso: 'manager',
          status: 'active',
          avatarUrl: 'assets/images/ana.jpg',
          permissoes: [
            { modulo: 1, permissoes: [1, 2, 3] },
            { modulo: 2, permissoes: [1, 2] },
            { modulo: 4, permissoes: [1, 2] }
          ]
        },
        {
          id: 3,
          nome: 'Lucas Ferreira',
          email: 'lucas@cuei.com.br',
          cargo: 'Designer',
          nivelAcesso: 'editor',
          status: 'active',
          avatarUrl: 'assets/images/lucas.jpg',
          permissoes: [
            { modulo: 1, permissoes: [1] },
            { modulo: 6, permissoes: [1, 2, 3] }
          ]
        },
        {
          id: 4,
          nome: 'Camila Santos',
          email: 'camila@cuei.com.br',
          cargo: 'Desenvolvedor Web',
          nivelAcesso: 'editor',
          status: 'active',
          permissoes: [
            { modulo: 1, permissoes: [1] },
            { modulo: 4, permissoes: [1] }
          ]
        },
        {
          id: 5,
          nome: 'Pedro Oliveira',
          email: 'pedro@cuei.com.br',
          cargo: 'Estagiário',
          nivelAcesso: 'user',
          status: 'inactive',
          permissoes: [
            { modulo: 1, permissoes: [1] },
            { modulo: 6, permissoes: [1] }
          ]
        }
      ];

      this.filteredUsers = [...this.users];
    }
  }

  // Método para atualizar status das permissões baseado no usuário atual
  atualizarStatusPermissoes(): void {
    this.modulos.forEach(modulo => {
      const permissoesUsuario = this.currentUser.permissoes.find(p => p.modulo === modulo.id);

      if (permissoesUsuario) {
        modulo.permissoes.forEach(permissao => {
          permissao.concedida = permissoesUsuario.permissoes.includes(permissao.id);
        });
      } else {
        // Se não encontrar registro para o módulo, todas as permissões são negadas
        modulo.permissoes.forEach(permissao => {
          permissao.concedida = false;
        });
      }
    });
  }

  // Verificar se usuário tem permissão para um módulo específico
  temPermissao(moduloId: number): boolean {
    const modulo = this.modulos.find(m => m.id === moduloId);
    if (!modulo) return false;

    // Se pelo menos uma permissão estiver concedida, o usuário tem acesso ao módulo
    return modulo.permissoes.some(p => p.concedida);
  }

  // Obter todas as permissões de um módulo
  getPermissoesModulo(moduloId: number): Permissao[] {
    const modulo = this.modulos.find(m => m.id === moduloId);
    return modulo ? modulo.permissoes : [];
  }

  // Obter ícone para tipo de atividade
  getActivityIcon(tipo: string): string {
    switch(tipo) {
      case 'login': return 'fas fa-sign-in-alt';
      case 'logout': return 'fas fa-sign-out-alt';
      case 'edit': return 'fas fa-edit';
      case 'create': return 'fas fa-plus';
      case 'delete': return 'fas fa-trash-alt';
      default: return 'fas fa-info-circle';
    }
  }

  // Obter label para status de usuário
  getStatusLabel(status: 'active' | 'inactive'): string {
    return status === 'active' ? 'Ativo' : 'Inativo';
  }

  // Obter label para nível de acesso
  getNivelAcessoLabel(nivel: 'admin' | 'manager' | 'editor' | 'user'): string {
    switch(nivel) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'editor': return 'Editor';
      case 'user': return 'Usuário';
      default: return '';
    }
  }

  // ==================
  // Gerenciar Usuários
  // ==================

  // Abrir modal de gerenciar usuários
  abrirModalGerenciarUsuarios(): void {
    this.showGerenciarUsuariosModal = true;
    this.searchTerm = '';
    this.filteredUsers = [...this.users];
  }

  // Fechar modal de gerenciar usuários
  fecharModalGerenciarUsuarios(): void {
    this.showGerenciarUsuariosModal = false;
  }

  // Pesquisar usuários
  searchUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.nome.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.cargo.toLowerCase().includes(term)
    );
  }

  // Toggle status do usuário (ativar/desativar)
  toggleUserStatus(userId: number): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = user.status === 'active' ? 'inactive' : 'active';

      // Atualizar lista filtrada
      this.filteredUsers = [...this.filteredUsers];

      const status = user.status === 'active' ? 'ativado' : 'desativado';
      alert(`Usuário "${user.nome}" foi ${status} com sucesso!`);
    }
  }

  // ==================
  // Formulário de Usuário
  // ==================

  // Criar formulário de usuário
  createUserForm(): FormGroup {
    return this.formBuilder.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      cargo: ['', Validators.required],
      nivelAcesso: ['user', Validators.required],
      avatarUrl: [''],
      status: ['active']
    });
  }

  // Abrir modal de novo usuário
  abrirModalNovoUsuario(): void {
    this.isEditMode = false;
    this.selectedUserId = null;

    // Resetar formulário
    this.userForm = this.createUserForm();

    this.showUserFormModal = true;
  }

  // Editar usuário
  editarUsuario(userId: number): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.isEditMode = true;
      this.selectedUserId = userId;

      // Criar novo formulário sem validador de senha para edição
      this.userForm = this.formBuilder.group({
        nome: [user.nome, Validators.required],
        email: [user.email, [Validators.required, Validators.email]],
        cargo: [user.cargo, Validators.required],
        nivelAcesso: [user.nivelAcesso, Validators.required],
        avatarUrl: [user.avatarUrl || ''],
        status: [user.status]
      });

      this.showUserFormModal = true;
    }
  }

  // Fechar modal de usuário
  fecharModalUsuario(): void {
    this.showUserFormModal = false;
  }

  // Salvar usuário
  salvarUsuario(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;

      if (this.isEditMode && this.selectedUserId) {
        // Atualizar usuário existente
        const index = this.users.findIndex(u => u.id === this.selectedUserId);
        if (index !== -1) {
          this.users[index] = {
            ...this.users[index],
            nome: formValue.nome,
            email: formValue.email,
            cargo: formValue.cargo,
            nivelAcesso: formValue.nivelAcesso,
            avatarUrl: formValue.avatarUrl,
            status: formValue.status
          };

          alert(`Usuário "${formValue.nome}" atualizado com sucesso!`);
        }
      } else {
        // Criar novo usuário
        const novoUsuario: User = {
          id: this.gerarNovoId(),
          nome: formValue.nome,
          email: formValue.email,
          cargo: formValue.cargo,
          nivelAcesso: formValue.nivelAcesso,
          avatarUrl: formValue.avatarUrl,
          status: 'active',
          permissoes: []
        };

        // Adicionar ao array de usuários
        this.users.unshift(novoUsuario);

        alert(`Usuário "${novoUsuario.nome}" criado com sucesso!`);
      }

      // Atualizar lista filtrada
      if (this.showGerenciarUsuariosModal) {
        this.searchUsers();
      }

      // Fechar modal
      this.fecharModalUsuario();
    } else {
      // Marcar campos como tocados para mostrar erros
      this.userForm.markAllAsTouched();
    }
  }

  // Método para verificar erro no formulário
  hasError(controlName: string, errorName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  // Método para gerar novo ID
  private gerarNovoId(): number {
    return this.users.length > 0
      ? Math.max(...this.users.map(user => user.id)) + 1
      : 1;
  }

  // ==================
  // Editar Permissões
  // ==================

  // Abrir modal de editar permissões
  editarPermissoes(userId: number): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.selectedUser = user;

      // Criar cópia das permissões para não alterar diretamente
      this.tempPermissoes = JSON.parse(JSON.stringify(user.permissoes));

      // Atualizar status das permissões no modelo
      this.atualizarStatusPermissoesUsuario();

      this.showEditarPermissoesModal = true;
    }
  }

  // Fechar modal de editar permissões
  fecharModalEditarPermissoes(): void {
    this.showEditarPermissoesModal = false;
    this.selectedUser = null;
  }

  // Atualizar status das permissões do usuário selecionado
  atualizarStatusPermissoesUsuario(): void {
    if (!this.selectedUser) return;

    this.modulos.forEach(modulo => {
      const permissoesUsuario = this.tempPermissoes.find(p => p.modulo === modulo.id);

      if (permissoesUsuario) {
        modulo.permissoes.forEach(permissao => {
          permissao.concedida = permissoesUsuario.permissoes.includes(permissao.id);
        });
      } else {
        // Se não encontrar registro para o módulo, todas as permissões são negadas
        modulo.permissoes.forEach(permissao => {
          permissao.concedida = false;
        });
      }
    });
  }

  // Verificar se todas as permissões do módulo estão marcadas
  isModuleChecked(moduloId: number): boolean {
    const modulo = this.modulos.find(m => m.id === moduloId);
    if (!modulo) return false;

    // Retorna true se todas as permissões estiverem concedidas
    return modulo.permissoes.every(p => p.concedida);
  }

  // Toggle todas as permissões de um módulo
  toggleModulePermissions(moduloId: number, event: any): void {
    const checked = event.target.checked;
    const modulo = this.modulos.find(m => m.id === moduloId);

    if (modulo) {
      // Atualizar todas as permissões do módulo
      modulo.permissoes.forEach(permissao => {
        permissao.concedida = checked;
      });

      // Atualizar o objeto tempPermissoes
      this.atualizarTempPermissoes(moduloId);
    }
  }

  // Toggle uma permissão específica
  togglePermission(moduloId: number, permissaoId: number, event: any): void {
    const checked = event.target.checked;
    const modulo = this.modulos.find(m => m.id === moduloId);

    if (modulo) {
      // Encontrar e atualizar a permissão específica
      const permissao = modulo.permissoes.find(p => p.id === permissaoId);
      if (permissao) {
        permissao.concedida = checked;
      }

      // Atualizar o objeto tempPermissoes
      this.atualizarTempPermissoes(moduloId);
    }
  }

  // Atualizar o objeto tempPermissoes com base nas permissões concedidas
  atualizarTempPermissoes(moduloId: number): void {
    const modulo = this.modulos.find(m => m.id === moduloId);
    if (!modulo) return;

    // Obter IDs das permissões concedidas
    const permissoesIds = modulo.permissoes
      .filter(p => p.concedida)
      .map(p => p.id);

    // Verificar se já existe um registro para o módulo
    const permissoesExistente = this.tempPermissoes.find(p => p.modulo === moduloId);

    if (permissoesExistente) {
      if (permissoesIds.length > 0) {
        // Atualizar permissões existentes
        permissoesExistente.permissoes = permissoesIds;
      } else {
        // Remover registro do módulo se não houver permissões
        const index = this.tempPermissoes.findIndex(p => p.modulo === moduloId);
        if (index !== -1) {
          this.tempPermissoes.splice(index, 1);
        }
      }
    } else if (permissoesIds.length > 0) {
      // Adicionar novo registro se não existir
      this.tempPermissoes.push({
        modulo: moduloId,
        permissoes: permissoesIds
      });
    }
  }

  // Salvar permissões do usuário
  salvarPermissoes(): void {
    if (!this.selectedUser) return;

    // Encontrar o usuário e atualizar permissões
    const user = this.users.find(u => u.id === this.selectedUser!.id);
    if (user) {
      user.permissoes = [...this.tempPermissoes];

      alert(`Permissões de "${user.nome}" atualizadas com sucesso!`);
      this.fecharModalEditarPermissoes();
    }
  }
}
