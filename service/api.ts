import { Book, Note, PendingOp } from "../types/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "http://localhost:3000";

const json = async (r: Response) => {
    const text = await r.text();
    try {
        return JSON.parse(text || "null");
    } catch {
        return text;
    }
};

const BOOKS_CACHE_KEY = "books_cache_v1";
const PENDING_OPS_KEY = "books_pending_v1";

export async function saveBooksToStorage(books: Book[]): Promise<void> {
    try {
        await AsyncStorage.setItem(BOOKS_CACHE_KEY, JSON.stringify(books));
    } catch (e) {
        console.warn("saveBooksToStorage failed", e);
    }
}

export async function loadBooksFromStorage(): Promise<Book[]> {
    try {
        const raw = await AsyncStorage.getItem(BOOKS_CACHE_KEY);
        return raw ? (JSON.parse(raw) as Book[]) : [];
    } catch (e) {
        console.warn("loadBooksFromStorage failed", e);
        return [];
    }
}

async function readPendingOps(): Promise<PendingOp[]> {
    try {
        const raw = await AsyncStorage.getItem(PENDING_OPS_KEY);
        return raw ? (JSON.parse(raw) as PendingOp[]) : [];
    } catch (e) {
        console.warn("readPendingOps failed", e);
        return [];
    }
}

async function writePendingOps(ops: PendingOp[]): Promise<void> {
    try {
        await AsyncStorage.setItem(PENDING_OPS_KEY, JSON.stringify(ops));
    } catch (e) {
        console.warn("writePendingOps failed", e);
    }
}

export async function enqueuePendingOp(op: PendingOp): Promise<void> {
    const ops = await readPendingOps();
    ops.push(op);
    await writePendingOps(ops);
}

async function createBookOnline(payload: Partial<Book>): Promise<Book> {
    const res = await fetch(`${BASE_URL}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return json(res);
}

async function updateBookOnline(id: number, payload: Partial<Book>): Promise<Book> {
    const res = await fetch(`${BASE_URL}/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return json(res);
}

async function deleteBookOnline(id: number): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/books/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    return json(res);
}

export async function getBooks(): Promise<Book[]> {
    try {
        const res = await fetch(`${BASE_URL}/books`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const books = await json(res);
        saveBooksToStorage(books).catch(() => {});
        return books;
    } catch (e) {
        console.warn("getBooks failed, returning local cache", e);
        return loadBooksFromStorage();
    }
}

export async function getBook(id: number): Promise<Book> {
    try {
        const res = await fetch(`${BASE_URL}/books/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const b = await json(res);
        loadBooksFromStorage()
            .then(async (cache) => {
                const idx = cache.findIndex((x) => x.id === id);
                if (idx >= 0) {
                    cache[idx] = b;
                } else {
                    cache.push(b);
                }
                await saveBooksToStorage(cache);
            })
            .catch(() => {});
        return b;
    } catch (e) {
        console.warn(`getBook(${id}) failed, trying local cache`, e);
        const cache = await loadBooksFromStorage();
        const local = cache.find((x) => x.id === id);
        if (local) return local;
        throw e;
    }
}

export async function createBook(payload: Partial<Book>): Promise<Book> {
    try {
        const book = await createBookOnline(payload);
        const cache = await loadBooksFromStorage();
        await saveBooksToStorage([...cache, book]);
        return book;
    } catch (e) {
        const tempId = -Date.now();
        const tempBook: Book = {
            id: tempId,
            name: payload.name ?? "",
            author: payload.author ?? "",
            editor: payload.editor ?? "",
            year: payload.year ?? 0,
            read: payload.read ?? false,
            favorite: payload.favorite ?? false,
            rating: payload.rating ?? null,
            cover: payload.cover ?? null,
            theme: payload.theme ?? null,
            ...(payload as Partial<Book>),
        } as Book;
        await enqueuePendingOp({ type: "create", payload, tempId, ts: Date.now() });
        const cache = await loadBooksFromStorage();
        await saveBooksToStorage([...cache, tempBook]);
        return tempBook;
    }
}

export async function updateBook(id: number, payload: Partial<Book>): Promise<Book> {
    try {
        const book = await updateBookOnline(id, payload);
        const cache = await loadBooksFromStorage();
        const idx = cache.findIndex((b) => b.id === id);
        if (idx >= 0) cache[idx] = book;
        else cache.push(book);
        await saveBooksToStorage(cache);
        return book;
    } catch (e) {
        await enqueuePendingOp({ type: "update", id, payload, ts: Date.now() });
        const cache = await loadBooksFromStorage();
        const idx = cache.findIndex((b) => b.id === id);
        const updated = { ...(cache[idx] ?? ({ id } as Book)), ...(payload as any) } as Book;
        if (idx >= 0) cache[idx] = updated;
        else cache.push(updated);
        await saveBooksToStorage(cache);
        return updated;
    }
}

export async function deleteBook(id: number): Promise<{ message: string }> {
    try {
        const res = await deleteBookOnline(id);
        const cache = await loadBooksFromStorage();
        const next = cache.filter((b) => b.id !== id);
        await saveBooksToStorage(next);
        return res;
    } catch (e) {
        await enqueuePendingOp({ type: "delete", id, ts: Date.now() });
        const cache = await loadBooksFromStorage();
        const next = cache.filter((b) => b.id !== id);
        await saveBooksToStorage(next);
        return { message: "deleted_offline" };
    }
}

export async function getNotes(bookId: number): Promise<Note[]> {
    try {
        const res = await fetch(`${BASE_URL}/books/${bookId}/notes`);
        if (!res.ok) throw new Error(await res.text());
        return json(res);
    } catch (e) {
        console.warn(`getNotes(${bookId}) failed, returning empty list`, e);
        return [];
    }
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

export async function flushPendingOperations(): Promise<void> {
    const ops = await readPendingOps();
    if (!ops.length) return;

    let cache = await loadBooksFromStorage();
    const remaining: PendingOp[] = [];

    for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        try {
            if (op.type === "create") {
                const created = await createBookOnline(op.payload);
                const idx = cache.findIndex((b) => b.id === op.tempId);
                if (idx >= 0) {
                    cache[idx] = created;
                } else {
                    cache.push(created);
                }
            } else if (op.type === "update") {
                const updated = await updateBookOnline(op.id, op.payload);
                const idx = cache.findIndex((b) => b.id === updated.id);
                if (idx >= 0) cache[idx] = updated;
                else cache.push(updated);
            } else if (op.type === "delete") {
                await deleteBookOnline(op.id);
                cache = cache.filter((b) => b.id !== op.id);
            }
        } catch (e) {
            for (let j = i; j < ops.length; j++) remaining.push(ops[j]);
            break;
        }
    }

    await saveBooksToStorage(cache);
    await writePendingOps(remaining);
}

export async function initBooksSync(): Promise<Book[]> {
    const local = await loadBooksFromStorage();

    try {
        const remote = await getBooks();
        await saveBooksToStorage(remote);
        return remote;
    } catch {
        return local;
    }
}

export async function getOpenLibraryEditionCount(title: string): Promise<number | null> {
    try {
        const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`);
        if (!res.ok) return null;
        const data = await res.json();
        const count =
            (data?.docs && data.docs.length > 0 && data.docs[0].edition_count != null)
                ? Number(data.docs[0].edition_count)
                : Number(data?.numFound ?? 0);
        return Number.isFinite(count) ? count : null;
    } catch (e) {
        console.warn("getOpenLibraryEditionCount failed", e);
        return null;
    }
}