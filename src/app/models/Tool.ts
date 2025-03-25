export interface Tool {
  id: number;
  name: string;
  description: string;
  statusId: number;
  createdAt?: Date;
  statusName?: string;
}

export interface BorrowTool {
  userId: number;
  toolId: number;
  borrowDate: string;
  dueDate: string;
}

export interface ReturnTool {
  userId: number;
  toolId: number;
  returnDate: string;
}
