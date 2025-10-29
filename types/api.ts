export type Book = {
  id?: number;
  name: string;
  author: string;
  editor: string;
  year: number;
  read?: boolean;
  favorite?: boolean;
  rating?: number | null;
  cover?: string | null;
  theme?: string | null;
};

export type Note = {
  id?: number;
  bookId: number;
  content: string;
  dateISO: string;
};

export type PendingOp =
  | { type: "create"; payload: Partial<Book>; tempId: number; ts: number }
  | { type: "update"; id: number; payload: Partial<Book>; ts: number }
  | { type: "delete"; id: number; ts: number };