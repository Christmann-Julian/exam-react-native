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
import { getBook, deleteBook, updateBook, getNotes, getOpenLibraryEditionCount } from "../../service/api";
import { Book, Note } from "../../types/api";
import { Feather } from "@expo/vector-icons";
import FavoriteButton from "../../components/FavoriteButton";
import ReadButton from "../../components/ReadButton";
import { useFlash } from "../../context/FlashProvider";
import { useTheme } from "../../context/theme";

export default function BookDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { show } = useFlash();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const id = Number(params.id);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [editionCount, setEditionCount] = useState<number | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const loadBook = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const b = await getBook(id);
      setBook(b);
      try {
        const count = await getOpenLibraryEditionCount(b.name);
        setEditionCount(count);
      } catch (e) {
        console.warn("failed to fetch openlibrary edition count", e);
        setEditionCount(null);
      }
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
          <ActivityIndicator size="large" color={theme.colors.primary} />
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
              <Feather name="edit-2" size={18} color={theme.colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, styles.deleteBtn]}
              onPress={handleDelete}
              accessibilityLabel="Supprimer"
            >
              <Feather name="trash-2" size={18} color={theme.colors.card} />
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

          {editionCount != null ? (
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Nombre d'éditions: </Text>
              {editionCount}
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
            <ActivityIndicator color={theme.colors.primary} />
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

function createStyles(theme: ReturnType<typeof useTheme> extends { theme: infer T } ? T : any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: 16 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyText: { color: theme.colors.muted },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    title: { fontSize: 22, fontWeight: "800", color: theme.colors.text, flex: 1 },
    headerActions: { flexDirection: "row", marginLeft: 12 },
    iconBtn: {
      backgroundColor: theme.colors.card,
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
      backgroundColor: theme.colors.danger,
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
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    meta: {
      backgroundColor: theme.colors.card,
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
    metaLine: { marginBottom: 8, color: theme.colors.text },
    metaLabel: { color: theme.colors.text, fontWeight: "700" },
    row: { flexDirection: "row", marginTop: 8 },
    badge: {
      backgroundColor: theme.colors.soft,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      marginRight: 8,
    },
    favBadge: { backgroundColor: theme.colors.card },
    badgeText: { color: theme.colors.text, fontWeight: "700" },
    favBadgeText: { color: theme.colors.accent },
    smallHint: { color: theme.colors.muted, marginTop: 6, fontSize: 12 },
    notesHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.text },
    addNoteBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
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
      backgroundColor: theme.colors.card,
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
      color: theme.colors.muted,
      fontSize: 12,
      marginBottom: 6,
    },
    noteContent: {
      color: theme.colors.text,
      fontSize: 14,
    },
  });
}