import { CreateTodoRequest, PaginatedResponse, Todo } from "./types";

// Spring Boot 3.2+ nests pagination metadata under a "page" key
interface SpringBootPageResponse<T> {
  content: T[];
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

// Normalizes Spring Boot 3.2+ nested page format to flat format
function normalizePage<T>(raw: SpringBootPageResponse<T>): PaginatedResponse<T> {
  if (raw.page) {
    // Spring Boot 3.2+ format: metadata nested under "page"
    return {
      content: raw.content,
      totalPages: raw.page.totalPages,
      totalElements: raw.page.totalElements,
      number: raw.page.number,
      size: raw.page.size,
      first: raw.page.number === 0,
      last: raw.page.number >= raw.page.totalPages - 1,
      empty: raw.content.length === 0,
    };
  }
  // Older Spring Boot format: flat structure
  return {
    content: raw.content,
    totalPages: raw.totalPages ?? 0,
    totalElements: raw.totalElements ?? 0,
    number: raw.number ?? 0,
    size: raw.size ?? 0,
    first: raw.first ?? true,
    last: raw.last ?? true,
    empty: raw.empty ?? raw.content.length === 0,
  };
}

export async function fetchTodos(
  page: number = 0,
  size: number = 5,
  sort: string = "name"
): Promise<PaginatedResponse<Todo>> {
  const res = await fetch(`${BASE_URL}?page=${page}&size=${size}&sort=${sort}`);
  const raw = await handleResponse<SpringBootPageResponse<Todo>>(res);
  return normalizePage(raw);
}

export async function createTodo(data: CreateTodoRequest): Promise<Todo> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Todo>(res);
}

export async function updateTodo(id: number, data: CreateTodoRequest): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Todo>(res);
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error("Failed to delete todo");
  }
}

export async function completeTodo(id: number): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/${id}/complete`, { method: "PATCH" });
  return handleResponse<Todo>(res);
}

export async function reopenTodo(id: number): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/${id}/re-open`, { method: "PATCH" });
  return handleResponse<Todo>(res);
}
