import { Book, Note } from "../types/api";

export const BASE_URL = "http://localhost:3000";

const json = async (r: Response) => {
  const text = await r.text();
  try {
    return JSON.parse(text || "null");
  } catch {
    return text;
  }
};

export async function getBooks(): Promise<Book[]> {
  const res = await fetch(`${BASE_URL}/books`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return json(res);
}

export async function getBook(id: number): Promise<Book> {
  const res = await fetch(`${BASE_URL}/books/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return json(res);
}

export async function createBook(payload: Partial<Book>): Promise<Book> {
  const res = await fetch(`${BASE_URL}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return json(res);
}

export async function updateBook(id: number, payload: Partial<Book>): Promise<Book> {
  const res = await fetch(`${BASE_URL}/books/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return json(res);
}

export async function deleteBook(id: number): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/books/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return json(res);
}

export async function getNotes(bookId: number): Promise<Note[]> {
  const res = await fetch(`${BASE_URL}/books/${bookId}/notes`);
  if (!res.ok) throw new Error(await res.text());
  return json(res);
}

export async function createNote(bookId: number, content: string): Promise<Note> {
  const res = await fetch(`${BASE_URL}/books/${bookId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await res.text());
  return json(res);
}