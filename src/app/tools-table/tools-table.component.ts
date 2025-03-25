import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolsService } from '../services/toolsServices';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { ToolsTransactions } from '../models/ToolsTransactions';
import { Tool } from '../models/Tool';
import { Transaction } from '../models/Transactions';

@Component({
  selector: 'app-tools-table',
  templateUrl: './tools-table.component.html',
  styleUrl: './tools-table.component.css',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbDatepickerModule],
})
export class ToolsTableComponent {
  toolsTransactions: ToolsTransactions[] = [];
  tools: Tool[] = [];
  transactions: any[] = [];
  selectedTool: any = null;
  toolsForm: FormGroup;
  currentPage = 1;
  itemsPerPage = 5;
  selectedToolId: number | null = null;

  private toolsService = inject(ToolsService);
  private modalService = inject(NgbModal);
  private fb = inject(FormBuilder);

  statusOptions = [
    { id: 1, name: 'Available' },
    { id: 2, name: 'Borrowed' },
  ];

  constructor() {
    this.toolsForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      statusId: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadTools();
  }

  loadTools() {
    this.toolsService.getTools().subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (
          response &&
          response.status === 'success' &&
          Array.isArray(response.data)
        ) {
          this.tools = response.data;
        } else {
          console.error('Unexpected API response structure', response);
          this.tools = [];
        }
      },
      error: (error) => {
        console.error('Error fetching patients:', error);
        this.tools = [];
      },
    });
  }

  openTransactionsModal(content: any, tool: any) {
    this.selectedTool = tool;
    this.toolsService.getTransactionsByToolId(tool.id).subscribe({
      next: (response) => {
        console.log('transactions API Response:', response); // Debugging
        if (
          response &&
          response.status === 'success' &&
          Array.isArray(response.data)
        ) {
          this.transactions = response.data;
        } else {
          console.error('Unexpected API response structure', response);
          this.transactions = [];
        }
        this.modalService.open(content, {
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
        });
      },
      error: (error) => {
        console.error('Error fetching appointments:', error);
        this.transactions = [];
      },
    });
  }

  openAddToolModal(content: any): void {
    this.toolsForm.setValue({
      name: '',
      description: '',
      statusId: null,
    });
    this.modalService.open(content, { centered: true });
  }

  saveTool(modal: any): void {
    if (this.toolsForm.invalid) return;

    const newTool: Tool = this.toolsForm.value;
    newTool.id = 0;

    this.toolsService.addTool(newTool).subscribe(
      () => {
        Swal.fire('Success', 'Tool added successfully!', 'success');
        this.loadTools();
        modal.close();
      },
      () => {
        Swal.fire('Error', 'Failed to add patient.', 'error');
      }
    );
  }

  openEditModal(content: any, tool: any) {
    this.selectedToolId = tool.id;
    // Patch form with existing data
    this.toolsForm.patchValue({
      name: tool.name,
      description: tool.description,
      statusId: tool.statusId,
    });

    this.modalService.open(content, { centered: true });
  }

  updateTool(modal: any) {
    if (this.toolsForm.valid && this.selectedToolId) {
      const formValue = this.toolsForm.value;
      const updatedTool = {
        id: this.selectedToolId,
        name: formValue.name,
        description: formValue.description,
        statusId: formValue.statusId,
      };

      this.toolsService.updateTool(updatedTool).subscribe(
        () => {
          Swal.fire('Success', 'Tool updated successfully!', 'success');
          this.loadTools();
          modal.close();
        },
        () => {
          Swal.fire('Error', 'Failed to add tool.', 'error');
        }
      );
    }
  }

  confirmDelete(toolId: number, content: any): void {
    this.modalService.open(content, { centered: true }).result.then(
      (result) => {
        if (result === 'confirm') {
          this.deleteTool(toolId);
        }
      },
      (dismissed) => {}
    );
  }

  deleteTool(toolId: number): void {
    this.toolsService.deleteTool(toolId).subscribe(() => {
      this.tools = this.tools.filter((p) => p.id !== toolId);
    });
  }

  convertDateToISO(ngbDate: NgbDateStruct): string {
    if (!ngbDate) return '';

    const date = new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
    return date.toISOString(); // Convert to ISO format
  }

  Math = Math;

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.tools.length / this.itemsPerPage);
  }
}
