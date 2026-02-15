export type TodoStatus = "PENDING" | "COMPLETED";

export interface Todo {
  id: number;
  name: string;
  description: string | null;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  name: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
