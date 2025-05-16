// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaces para os dados
interface Card {
  cardHolder: string;
  balance: number;
  cardNumber: string;
  validThru: string;
  isActive?: boolean;
}

interface Transaction {
  id: string;
  description: string;
  type: 'Shopping' | 'Transfer' | 'Service';
  cardLastFour: string;
  date: string;
  amount: number;
  isIncome: boolean;
}

interface ExpenseData {
  month: string;
  amount: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  userName: string = 'Nome';
  cards: Card[] = [];
  transactions: Transaction[] = [];
  expenseData: ExpenseData[] = [];
  activeTab: 'all' | 'income' | 'expense' = 'all';
  currentPage: number = 1;
  totalPages: number = 4;

  constructor() { }

  ngOnInit(): void {
    this.loadCards();
    this.loadTransactions();
    this.loadExpenseData();
  }

  loadCards(): void {
    // Simula carregamento de dados de uma API
    this.cards = [
      {
        cardHolder: 'Eddy Cusuma',
        balance: 5756,
        cardNumber: '3778 **** **** 1234',
        validThru: '12/22',
        isActive: true
      },
      {
        cardHolder: 'Eddy Cusuma',
        balance: 5756,
        cardNumber: '3778 **** **** 1234',
        validThru: '12/22',
        isActive: false
      }
    ];
  }

  loadTransactions(): void {
    // Simula carregamento de dados de uma API
    this.transactions = [
      {
        id: '#12548796',
        description: 'Spotify Subscription',
        type: 'Shopping',
        cardLastFour: '1234',
        date: '28 Jan, 12.30 AM',
        amount: 2500,
        isIncome: false
      },
      {
        id: '#12548796',
        description: 'Freepik Sales',
        type: 'Transfer',
        cardLastFour: '1234',
        date: '25 Jan, 10.40 PM',
        amount: 750,
        isIncome: true
      },
      {
        id: '#12548796',
        description: 'Mobile Service',
        type: 'Service',
        cardLastFour: '1234',
        date: '20 Jan, 10.40 PM',
        amount: 150,
        isIncome: false
      },
      {
        id: '#12548796',
        description: 'Wilson',
        type: 'Transfer',
        cardLastFour: '1234',
        date: '15 Jan, 03.29 PM',
        amount: 1050,
        isIncome: false
      },
      {
        id: '#12548796',
        description: 'Emilly',
        type: 'Transfer',
        cardLastFour: '1234',
        date: '14 Jan, 10.40 PM',
        amount: 840,
        isIncome: true
      }
    ];
  }

  loadExpenseData(): void {
    // Simula carregamento de dados de uma API
    this.expenseData = [
      { month: 'Aug', amount: 7500 },
      { month: 'Sep', amount: 10000 },
      { month: 'Oct', amount: 8500 },
      { month: 'Nov', amount: 9000 },
      { month: 'Dec', amount: 12500 },
      { month: 'Jan', amount: 7000 }
    ];
  }

  setActiveTab(tab: 'all' | 'income' | 'expense'): void {
    this.activeTab = tab;
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

  getFilteredTransactions(): Transaction[] {
    switch (this.activeTab) {
      case 'income':
        return this.transactions.filter(t => t.isIncome);
      case 'expense':
        return this.transactions.filter(t => !t.isIncome);
      default:
        return this.transactions;
    }
  }

  // Método auxiliar para calcular a altura da barra no gráfico
  getBarHeight(amount: number): string {
    const maxAmount = 12500; // Valor máximo do gráfico
    const percentage = (amount / maxAmount) * 100;
    return `${percentage}%`;
  }
}
