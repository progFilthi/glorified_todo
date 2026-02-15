import { CreateTodoRequest, PaginatedResponse, Todo } from "./types";

const PROD_URL = "https://glorified-todo.vercel.app/api/todos";
const DEV_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/todos";

// Auto-detect: use prod URL on Vercel, dev URL locally
const BASE_URL = process.env.NODE_ENV === "production" ? PROD_URL : DEV_URL;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchTodos(
  page: number = 0,
  size: number = 5,
  sort: string = "name"
): Promise<PaginatedResponse<Todo>> {
  const res = await fetch(`${BASE_URL}?page=${page}&size=${size}&sort=${sort}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = await handleResponse(res);

  // Normalize Spring Boot 3.2+ nested "page" format to flat PaginatedResponse
  if (raw.page) {
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

  return raw as PaginatedResponse<Todo>;
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
