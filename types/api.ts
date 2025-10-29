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
