import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { getBook, deleteBook, updateBook, getNotes } from "../../utils/api";
import { Book, Note } from "../../types/api";
import { Feather } from "@expo/vector-icons";
import FavoriteButton from "../../components/FavoriteButton";
import ReadButton from "../../components/ReadButton";
import { useFlash } from "../../utils/FlashProvider";

export default function BookDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { show } = useFlash();
  const id = Number(params.id);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);

  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const loadBook = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const b = await getBook(id);
      setBook(b);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadNotes = useCallback(async () => {
    if (!id) return;
    setLoadingNotes(true);
    try {
      const n = await getNotes(id);
      setNotes(n || []);
    } catch (e) {
      console.warn("load notes failed", e);
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  }, [id]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const handleDelete = async () => {
    if (!id) return;
    if (Platform.OS === "web") {
      const ok = window.confirm("Voulez-vous supprimer ce livre ?");
      if (!ok) return;
      try {
        await deleteBook(id);
        show("Livre supprimé", "success");
        router.replace("/books" as any);
      } catch (e: any) {
        show("Erreur lors de la suppression du livre", "error");
      }
      return;
    }

    Alert.alert("Supprimer", "Voulez-vous supprimer ce livre ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBook(id);
            router.replace("/books" as any);
          } catch (e: any) {
            Alert.alert("Erreur", e?.message || String(e));
          }
        },
      },
    ]);
  };

  const handleToggleFavorite = async (next: boolean) => {
    if (!book) return;
    setBook({ ...book, favorite: next });
    try {
      await updateBook(id, { favorite: next });
    } catch (e) {
      console.warn("favorite toggle failed", e);
      setBook({ ...book, favorite: !next });
      throw e;
    }
  };

  const handleToggleRead = async (next: boolean) => {
    if (!book) return;
    setBook({ ...book, read: next });
    try {
      await updateBook(id, { read: next });
    } catch (e) {
      console.warn("read toggle failed", e);
      setBook({ ...book, read: !next });
      throw e;
    }
  };

  if (loading) {
    return (
      <View style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Livre introuvable</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{book.name}</Text>
          <View style={styles.headerActions}>
            <FavoriteButton value={Boolean(book.favorite)} onToggle={handleToggleFavorite} size={18} />
            <ReadButton value={Boolean(book.read)} onToggle={handleToggleRead} size={18} style={{ marginLeft: 8 }} />
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push(`/books/${id}/edit` as any)}
              accessibilityLabel="Modifier"
            >
              <Feather name="edit-2" size={18} color="#0f1724" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, styles.deleteBtn]}
              onPress={handleDelete}
              accessibilityLabel="Supprimer"
            >
              <Feather name="trash-2" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {book.cover ? (
          <Image source={{ uri: book.cover }} style={styles.cover} />
        ) : (
          <View style={styles.coverPlaceholder}></View>
        )}

        <View style={styles.meta}>
          <Text style={styles.metaLine}>
            <Text style={styles.metaLabel}>Auteur: </Text>
            {book.author}
          </Text>

          <Text style={styles.metaLine}>
            <Text style={styles.metaLabel}>Éditeur: </Text>
            {book.editor}
          </Text>

          <Text style={styles.metaLine}>
            <Text style={styles.metaLabel}>Année: </Text>
            {book.year}
          </Text>

          {book.theme ? (
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Thème: </Text>
              {book.theme}
            </Text>
          ) : null}

          <View style={styles.row}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{book.read ? "Lu" : "Non lu"}</Text>
            </View>
            <View style={[styles.badge, book.favorite && styles.favBadge]}>
              <Text style={[styles.badgeText, book.favorite && styles.favBadgeText]}>
                {book.favorite ? "Favori" : "—"}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 16 }} />

        <View style={styles.notesHeader}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TouchableOpacity
            style={styles.addNoteBtn}
            onPress={() => router.push(`/books/${id}/notes/add` as any)}
            accessibilityLabel="Ajouter une note"
          >
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.addNoteText}>Ajouter une note</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notesContainer}>
          {loadingNotes ? (
            <ActivityIndicator />
          ) : notes.length === 0 ? (
            <Text style={styles.emptyText}>Aucune note pour ce livre</Text>
          ) : (
            <FlatList
              data={notes}
              keyExtractor={(n) => String(n.id)}
              renderItem={({ item }) => (
                <View style={styles.noteCard}>
                  <Text style={styles.noteDate}>
                    {new Date(item.dateISO).toLocaleString()}
                  </Text>
                  <Text style={styles.noteContent}>{item.content}</Text>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f7fb" },
  container: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#94a3b8" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#0f1724", flex: 1 },
  headerActions: { flexDirection: "row", marginLeft: 12 },
  iconBtn: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
  },
  cover: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
  },
  coverPlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#007aff",
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  metaLine: { marginBottom: 8, color: "#334155" },
  metaLabel: { color: "#475569", fontWeight: "700" },
  row: { flexDirection: "row", marginTop: 8 },
  badge: {
    backgroundColor: "#e6eef8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
  },
  favBadge: { backgroundColor: "#fff7ed" },
  badgeText: { color: "#475569", fontWeight: "700" },
  favBadgeText: { color: "#ff8b00" },
  smallHint: { color: "#94a3b8", marginTop: 6, fontSize: 12 },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#0f1724" },
  addNoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007aff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  addNoteText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "700",
  },
  notesContainer: {
    marginBottom: 24,
  },
  noteCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: { elevation: 1 },
    }),
  },
  noteDate: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 6,
  },
  noteContent: {
    color: "#334155",
    fontSize: 14,
  },
});