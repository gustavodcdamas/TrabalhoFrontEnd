// setting.component.ts (completo)
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Configuracoes {
  aparencia: {
    tema: 'claro' | 'escuro' | 'sistema';
    corPrimaria: string;
    tamanhoFonte: string;
    animacoesReduzidas: boolean;
    modoCompacto: boolean;
  };
  notificacoes: {
    email: { id: number; nome: string; descricao: string; ativo: boolean }[];
    sistema: { id: number; nome: string; descricao: string; ativo: boolean }[];
    frequenciaResumo: 'diario' | 'semanal' | 'mensal' | 'nunca';
  };
  seguranca: {
    autenticacaoDuasEtapas: boolean;
    metodoVerificacao: 'sms' | 'app' | 'email';
    telefone: string;
  };
  sistema: {
    modoManutencao: boolean;
    registrosAuditoria: boolean;
    tempoSessao: number;
    frequenciaBackups: 'diario' | 'semanal' | 'mensal';
  };
}

interface Sessao {
  id: number;
  dispositivo: string;
  localizacao: string;
  ultimoAcesso: Date;
  atual: boolean;
}

interface Backup {
  id: number;
  nome: string;
  data: Date;
  tamanho: string;
}

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css'
})
export class SettingComponent implements OnInit {
  // Estado atual
  activeTab: 'perfil' | 'aparencia' | 'notificacoes' | 'seguranca' | 'sistema' = 'perfil';
  isAdmin: boolean = true;
  hasChanges: boolean = false;

  // Formulários
  perfilForm: FormGroup;
  senhaForm: FormGroup;
  empresaForm: FormGroup;

  // Estado dos formulários
  isPerfilFormDirty: boolean = false;
  isEmpresaFormDirty: boolean = false;

  // Imagem de perfil
  imagemPreview: string | null = null;

  // Configurações
  configuracoes: Configuracoes;

  // Cores primárias disponíveis
  coresPrimarias = [
    { valor: 'laranja', cor: '#ff6a00' },
    { valor: 'azul', cor: '#0d6efd' },
    { valor: 'verde', cor: '#28a745' },
    { valor: 'vermelho', cor: '#dc3545' },
    { valor: 'roxo', cor: '#6f42c1' },
    { valor: 'rosa', cor: '#e83e8c' },
    { valor: 'amarelo', cor: '#ffc107' },
    { valor: 'ciano', cor: '#17a2b8' }
  ];

  // Tamanhos de fonte disponíveis
  tamanhosFonte = [
    { valor: 'pequeno', nome: 'Pequeno', amostra: '12px' },
    { valor: 'normal', nome: 'Normal', amostra: '16px' },
    { valor: 'grande', nome: 'Grande', amostra: '20px' },
    { valor: 'muito-grande', nome: 'Muito Grande', amostra: '24px' }
  ];

  // Opções de notificação por e-mail
  opcoesNotificacaoEmail = [
    { id: 1, nome: 'Novos projetos', descricao: 'Receber notificações sobre novos projetos adicionados' },
    { id: 2, nome: 'Atualizações de projetos', descricao: 'Receber notificações quando um projeto for atualizado' },
    { id: 3, nome: 'Comentários', descricao: 'Receber notificações sobre novos comentários em seus projetos' },
    { id: 4, nome: 'Prazos', descricao: 'Receber lembretes sobre prazos de projetos' }
  ];

  // Opções de notificação no sistema
  opcoesNotificacaoSistema = [
    { id: 1, nome: 'Mensagens', descricao: 'Mostrar notificações para novas mensagens' },
    { id: 2, nome: 'Atualizações', descricao: 'Mostrar notificações para atualizações do sistema' },
    { id: 3, nome: 'Lembretes', descricao: 'Mostrar lembretes de tarefas e eventos' }
  ];

  // Sessões ativas
  sessoes: Sessao[] = [];

  // Backups
  backups: Backup[] = [];

  // Modal de restauração
  showRestauracaoModal: boolean = false;
  backupSelecionado: File | null = null;

  constructor(private formBuilder: FormBuilder) {
    // Inicializar formulários
    this.perfilForm = this.createPerfilForm();
    this.senhaForm = this.createSenhaForm();
    this.empresaForm = this.createEmpresaForm();

    // Inicializar configurações
    this.configuracoes = {
      aparencia: {
        tema: 'claro',
        corPrimaria: 'laranja',
        tamanhoFonte: 'normal',
        animacoesReduzidas: false,
        modoCompacto: false
      },
      notificacoes: {
        email: this.opcoesNotificacaoEmail.map(opcao => ({ ...opcao, ativo: true })),
        sistema: this.opcoesNotificacaoSistema.map(opcao => ({ ...opcao, ativo: true })),
        frequenciaResumo: 'semanal'
      },
      seguranca: {
        autenticacaoDuasEtapas: false,
        metodoVerificacao: 'sms',
        telefone: ''
      },
      sistema: {
        modoManutencao: false,
        registrosAuditoria: true,
        tempoSessao: 60,
        frequenciaBackups: 'diario'
      }
    };

    // Monitorar mudanças nos formulários
    this.perfilForm.valueChanges.subscribe(() => {
      this.isPerfilFormDirty = this.perfilForm.dirty;
      this.verificarMudancas();
    });

    this.empresaForm.valueChanges.subscribe(() => {
      this.isEmpresaFormDirty = this.empresaForm.dirty;
      this.verificarMudancas();
    });
  }

  ngOnInit(): void {
    // Carregar dados de sessões
    this.sessoes = [
      {
        id: 1,
        dispositivo: 'Windows Chrome',
        localizacao: 'Belo Horizonte, MG',
        ultimoAcesso: new Date(),
        atual: true
      },
      {
        id: 2,
        dispositivo: 'Android Chrome',
        localizacao: 'Belo Horizonte, MG',
        ultimoAcesso: new Date(new Date().setHours(new Date().getHours() - 2)),
        atual: false
      },
      {
        id: 3,
        dispositivo: 'MacOS Safari',
        localizacao: 'São Paulo, SP',
        ultimoAcesso: new Date(new Date().setDate(new Date().getDate() - 1)),
        atual: false
      }
    ];

    // Carregar dados de backups
    this.backups = [
      {
        id: 1,
        nome: 'Backup Diário Automático',
        data: new Date(new Date().setHours(3, 0, 0, 0)),
        tamanho: '45.7 MB'
      },
      {
        id: 2,
        nome: 'Backup Manual',
        data: new Date(new Date().setDate(new Date().getDate() - 1)),
        tamanho: '46.2 MB'
      },
      {
        id: 3,
        nome: 'Backup Diário Automático',
        data: new Date(new Date().setDate(new Date().getDate() - 2)),
        tamanho: '43.9 MB'
      }
    ];
  }

  // Criar formulário de perfil
  createPerfilForm(): FormGroup {
    return this.formBuilder.group({
      nome: ['Eddy Cusuma', Validators.required],
      email: ['eddy@cuei.com.br', [Validators.required, Validators.email]],
      cargo: ['Diretor de Design'],
      biografia: ['Profissional de design com mais de 10 anos de experiência em branding e identidades visuais. Especialista em design centrado no usuário e com passagem por grandes marcas.']
    });
  }

  // Criar formulário de senha
  createSenhaForm(): FormGroup {
    return this.formBuilder.group({
      senhaAtual: ['', Validators.required],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    }, { validators: this.senhasConferem });
  }

  // Criar formulário de empresa
  createEmpresaForm(): FormGroup {
    return this.formBuilder.group({
      nome: ['Cuei Design e Marketing Digital', Validators.required],
      cnpj: ['12.345.678/0001-90', Validators.required],
      email: ['contato@cuei.com.br', [Validators.required, Validators.email]],
      telefone: ['(31) 3333-4444', Validators.required],
      endereco: ['Av. Amazonas, 1234 - Centro\nBelo Horizonte - MG\nCEP: 30123-456']
    });
  }

  // Validador personalizado para verificar se as senhas conferem
  senhasConferem(group: FormGroup): { [key: string]: boolean } | null {
    const novaSenha = group.get('novaSenha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;

    return novaSenha === confirmarSenha ? null : { senhasNaoConferem: true };
  }

  // Verificar se há mudanças nas configurações
  verificarMudancas(): void {
    this.hasChanges = this.isPerfilFormDirty || this.isEmpresaFormDirty;
  }

  // Mudar aba
  changeTab(tab: 'perfil' | 'aparencia' | 'notificacoes' | 'seguranca' | 'sistema'): void {
    this.activeTab = tab;
  }

  // Métodos para gerenciar formulário de perfil
  resetarPerfilForm(): void {
    this.perfilForm.reset({
      nome: 'Eddy Cusuma',
      email: 'eddy@cuei.com.br',
      cargo: 'Diretor de Design',
      biografia: 'Profissional de design com mais de 10 anos de experiência em branding e identidades visuais. Especialista em design centrado no usuário e com passagem por grandes marcas.'
    });
    this.isPerfilFormDirty = false;
    this.verificarMudancas();
  }

  salvarPerfil(): void {
    if (this.perfilForm.valid) {
      // Aqui seria a lógica para salvar o perfil no servidor
      console.log('Perfil atualizado:', this.perfilForm.value);

      // Simular sucesso
      alert('Perfil atualizado com sucesso!');

      this.perfilForm.markAsPristine();
      this.isPerfilFormDirty = false;
      this.verificarMudancas();
    }
  }

  // Métodos para gerenciar o upload de imagem
  triggerFileInput(): void {
    const fileInput = document.querySelector('.profile-picture .file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onImagemSelecionada(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Criar URL para preview da imagem
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagemPreview = e.target.result;
        this.hasChanges = true;
      };
      reader.readAsDataURL(file);
    }
  }

  removerImagem(): void {
    this.imagemPreview = null;
    this.hasChanges = true;
  }

  // Métodos para aparência
  selecionarTema(tema: 'claro' | 'escuro' | 'sistema'): void {
    this.configuracoes.aparencia.tema = tema;
    this.hasChanges = true;
  }

  selecionarCorPrimaria(cor: string): void {
    this.configuracoes.aparencia.corPrimaria = cor;
    this.hasChanges = true;
  }

  selecionarTamanhoFonte(tamanho: string): void {
    this.configuracoes.aparencia.tamanhoFonte = tamanho;
    this.hasChanges = true;
  }

  // Métodos para segurança
  alterarSenha(): void {
    if (this.senhaForm.valid) {
      // Aqui seria a lógica para alterar a senha no servidor
      console.log('Senha alterada:', this.senhaForm.value);

      // Simular sucesso
      alert('Senha alterada com sucesso!');

      // Resetar formulário
      this.senhaForm.reset();
    }
  }

  // Métodos para sessões
  encerrarSessao(id: number): void {
    // Aqui seria a lógica para encerrar a sessão no servidor

    // Simular remoção da sessão
    this.sessoes = this.sessoes.filter(s => s.id !== id);
    alert('Sessão encerrada com sucesso!');
  }

  encerrarTodasSessoes(): void {
    if (confirm('Tem certeza que deseja encerrar todas as sessões? Você precisará fazer login novamente.')) {
      // Aqui seria a lógica para encerrar todas as sessões no servidor

      // Simular remoção das sessões (exceto a atual)
      this.sessoes = this.sessoes.filter(s => s.atual);
      alert('Todas as outras sessões foram encerradas com sucesso!');
    }
  }

  getDeviceIcon(dispositivo: string): string {
    if (dispositivo.includes('Android')) {
      return 'fas fa-mobile-alt';
    } else if (dispositivo.includes('Windows')) {
      return 'fas fa-desktop';
    } else if (dispositivo.includes('MacOS')) {
      return 'fas fa-laptop';
    } else if (dispositivo.includes('iOS')) {
      return 'fas fa-tablet-alt';
    } else {
      return 'fas fa-globe';
    }
  }

  // Métodos para formulário de empresa
  resetarEmpresaForm(): void {
    this.empresaForm.reset({
      nome: 'Cuei Design e Marketing Digital',
      cnpj: '12.345.678/0001-90',
      email: 'contato@cuei.com.br',
      telefone: '(31) 3333-4444',
      endereco: 'Av. Amazonas, 1234 - Centro\nBelo Horizonte - MG\nCEP: 30123-456'
    });
    this.isEmpresaFormDirty = false;
    this.verificarMudancas();
  }

  salvarEmpresa(): void {
    if (this.empresaForm.valid) {
      // Aqui seria a lógica para salvar os dados da empresa no servidor
      console.log('Dados da empresa atualizados:', this.empresaForm.value);

      // Simular sucesso
      alert('Dados da empresa atualizados com sucesso!');

      this.empresaForm.markAsPristine();
      this.isEmpresaFormDirty = false;
      this.verificarMudancas();
    }
  }

  // Métodos para backup e restauração
  realizarBackup(): void {
    // Aqui seria a lógica para realizar backup no servidor

    // Simular criação de backup
    const novoBackup = {
      id: this.backups.length + 1,
      nome: 'Backup Manual',
      data: new Date(),
      tamanho: '47.3 MB'
    };

    this.backups.unshift(novoBackup);
    alert('Backup realizado com sucesso!');
  }

  downloadBackup(id: number): void {
    const backup = this.backups.find(b => b.id === id);
    if (backup) {
      // Aqui seria a lógica para download do backup
      alert(`Download do backup "${backup.nome}" iniciado.`);
    }
  }

  restaurarBackup(id: number): void {
    const backup = this.backups.find(b => b.id === id);
    if (backup) {
      if (confirm(`Tem certeza que deseja restaurar o backup "${backup.nome}"? Todos os dados atuais serão substituídos.`)) {
        // Aqui seria a lógica para restaurar o backup
        alert(`Backup "${backup.nome}" restaurado com sucesso! O sistema será reiniciado.`);
      }
    }
  }

  abrirModalRestauracao(): void {
    this.showRestauracaoModal = true;
    this.backupSelecionado = null;
  }

  fecharModalRestauracao(): void {
    this.showRestauracaoModal = false;
  }

  onBackupSelecionado(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.backupSelecionado = file;
    }
  }

  confirmarRestauracao(): void {
    if (this.backupSelecionado) {
      if (confirm('Tem certeza que deseja restaurar este backup? Todos os dados atuais serão substituídos.')) {
        // Aqui seria a lógica para restaurar o backup
        alert(`Backup "${this.backupSelecionado.name}" restaurado com sucesso! O sistema será reiniciado.`);
        this.fecharModalRestauracao();
      }
    }
  }

  // Método para salvar todas as configurações
  salvarTodasConfiguracoes(): void {
    // Verificar se há formulários válidos e sujos
    if (this.isPerfilFormDirty && this.perfilForm.valid) {
      this.salvarPerfil();
    }

    if (this.isEmpresaFormDirty && this.empresaForm.valid) {
      this.salvarEmpresa();
    }

    // Salvar outras configurações
    console.log('Configurações salvas:', this.configuracoes);

    // Simular sucesso
    alert('Todas as configurações foram salvas com sucesso!');

    this.hasChanges = false;
  }

  // Método para verificar erros de validação nos formulários
  hasError(formGroup: FormGroup, controlName: string, errorName: string): boolean {
    const control = formGroup.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }
}
