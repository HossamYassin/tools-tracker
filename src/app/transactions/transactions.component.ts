import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransactionsTableComponent } from '../transactions-table/transactions-table.component';

@Component({
  selector: 'app-home',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  standalone: true,
  imports: [FormsModule, TransactionsTableComponent, RouterModule],
})
export class TransactionsComponent {
  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
