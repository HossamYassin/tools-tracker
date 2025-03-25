import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolsService } from '../services/toolsServices';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { jwtDecode } from 'jwt-decode';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { ToolsTransactions } from '../models/ToolsTransactions';
import { BorrowTool, Tool } from '../models/Tool';

@Component({
  selector: 'app-transactions-table',
  templateUrl: './transactions-table.component.html',
  styleUrl: './transactions-table.component.css',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbDatepickerModule],
})
export class TransactionsTableComponent {
  toolsTransactions: ToolsTransactions[] = [];
  transactions: any[] = [];
  selectedTool: any = null;
  borrowForm: FormGroup;
  returnForm: FormGroup;
  currentPage = 1;
  itemsPerPage = 5;
  selectedToolId: number | null = null;
  userId: number = 0;

  private toolsService = inject(ToolsService);
  private modalService = inject(NgbModal);
  private fb = inject(FormBuilder);

  statusOptions = [
    { id: 1, name: 'Available' },
    { id: 2, name: 'Borrowed' },
  ];

  constructor() {
    this.borrowForm = this.fb.group({
      userId: ['', Validators.required],
      toolId: ['', Validators.required],
      borrowDate: ['', Validators.required],
      dueDate: ['', Validators.required],
    });

    this.returnForm = this.fb.group({
      userId: ['', Validators.required],
      toolId: ['', Validators.required],
      returnDate: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.extractUserIdFromToken();
    this.loadToolsTransactions();
  }

  loadToolsTransactions() {
    this.toolsService.geToolsTransactions().subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (
          response &&
          response.status === 'success' &&
          Array.isArray(response.data)
        ) {
          this.toolsTransactions = response.data;
        } else {
          console.error('Unexpected API response structure', response);
          this.toolsTransactions = [];
        }
      },
      error: (error) => {
        console.error('Error fetching patients:', error);
        this.toolsTransactions = [];
      },
    });
  }

  openBorrowToolModal(content: any, tool: any): void {
    this.borrowForm.setValue({
      userId: 1,
      toolId: tool.toolId,
      borrowDate: null,
      dueDate: null,
    });
    this.modalService.open(content, { centered: true });
  }

  borrowTool(modal: any): void {
    if (this.borrowForm.invalid) return;

    const borrowTool: BorrowTool = this.borrowForm.value;
    borrowTool.userId = this.userId;

    const rawDate: NgbDateStruct = this.borrowForm.value.borrowDate;
    console.log(rawDate);
    const formattedDate = this.convertDateToISO(rawDate);
    borrowTool.borrowDate = formattedDate;
    console.log(borrowTool.borrowDate);

    const duerawDate: NgbDateStruct = this.borrowForm.value.dueDate;
    const dueformattedDate = this.convertDateToISO(duerawDate);
    borrowTool.dueDate = dueformattedDate;

    this.toolsService.borrowTool(borrowTool).subscribe(
      () => {
        Swal.fire('Success', 'Tool borrowed successfully!', 'success');
        this.loadToolsTransactions();
        modal.close();
      },
      () => {
        Swal.fire('Error', 'Failed to borrow tool.', 'error');
      }
    );
  }

  openReturnModal(content: any, tool: any) {
    this.selectedToolId = tool.toolId;

    // Patch form with existing data
    this.returnForm.patchValue({
      userId: this.userId,
      toolId: tool.toolId,
      returnDate: null,
    });

    this.modalService.open(content, { centered: true });
  }

  returnTool(modal: any) {
    if (this.returnForm.valid && this.selectedToolId) {
      const formValue = this.returnForm.value;
      const returnTool = {
        toolId: this.selectedToolId,
        userId: formValue.userId,
        returnDate: formValue.returnDate,
      };

      const rawDate: NgbDateStruct = this.returnForm.value.returnDate;
      const formattedDate = this.convertDateToISO(rawDate);
      returnTool.returnDate = formattedDate;

      this.toolsService.returnTool(returnTool).subscribe(
        () => {
          Swal.fire('Success', 'Tool returned successfully!', 'success');
          this.loadToolsTransactions();
          modal.close();
        },
        () => {
          Swal.fire('Error', 'Failed to return tool.', 'error');
        }
      );
    }
  }

  convertDateToISO(ngbDate: NgbDateStruct | null | undefined): string {
    if (
      !ngbDate ||
      ngbDate.year === undefined ||
      ngbDate.month === undefined ||
      ngbDate.day === undefined
    ) {
      return ''; // Return an empty string if ngbDate is invalid
    }

    const date = new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day + 1);

    if (isNaN(date.getTime())) {
      return ''; // Handle invalid date cases
    }

    return date.toISOString(); // Returns only YYYY-MM-DD
  }

  Math = Math;

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.toolsTransactions.length / this.itemsPerPage);
  }

  extractUserIdFromToken(): void {
    const token = localStorage.getItem('token'); // Get JWT token from local storage

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.userId = decodedToken?.nameid; // "nameid" is the ClaimTypes.NameIdentifier
        console.log('Extracted User ID:', this.userId);
      } catch (error) {
        console.error('Error decoding token', error);
      }
    }
  }
}
