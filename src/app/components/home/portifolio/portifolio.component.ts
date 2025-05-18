// projetos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projetos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './portifolio.component.html',
  styleUrls: ['./portifolio.component.css']
})
export class PortifolioComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Qualquer lógica de inicialização, como carregamento de dados
  }

  // Método para lidar com o botão de orçamento
  solicitarOrcamento(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/contato'], { queryParams: { orcamento: 'true' } });
  }

  // Se você precisar adicionar mais métodos para interatividade, adicione aqui
}
