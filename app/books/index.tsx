import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    Image,
    Platform,
} from "react-native";
import { getBooks, updateBook } from "../../utils/api";
import { Book } from "../../types/api";
import { useRouter, useFocusEffect } from "expo-router";
import FavoriteButton from "../../components/FavoriteButton";
import ReadButton from "../../components/ReadButton";

export default function BooksList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBooks();
      setBooks(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = async (itemId: number, current: boolean) => {
    setBooks((prev) => prev.map(b => b.id === itemId ? { ...b, favorite: !current } : b));
    try {
      await updateBook(itemId, { favorite: !current });
    } catch (e) {
      console.warn("toggle favorite failed", e);
      setBooks((prev) => prev.map(b => b.id === itemId ? { ...b, favorite: current } : b));
      throw e;
    }
  };

  const toggleRead = async (itemId: number, current: boolean) => {
    setBooks((prev) => prev.map(b => b.id === itemId ? { ...b, read: !current } : b));
    try {
      await updateBook(itemId, { read: !current });
    } catch (e) {
      console.warn("toggle read failed", e);
      setBooks((prev) => prev.map(b => b.id === itemId ? { ...b, read: current } : b));
      throw e;
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes livres</Text>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => router.push("/books/add" as any)}
        >
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={books.length === 0 ? styles.flatEmpty : undefined}
        data={books}
        keyExtractor={(i) => String(i.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push(`/books/${String(item.id)}` as any)}
          >
            {item.cover ? (
              <Image source={{ uri: item.cover }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <View style={styles.avatar}></View>
            )}

            <View style={styles.cardContent}>
              <Text style={styles.title} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {item.author} · {item.year}
              </Text>
            </View>

            <ReadButton
              value={Boolean(item.read)}
              onToggle={() => toggleRead(item.id as number, Boolean(item.read))}
              size={22}
              style={{ marginRight: 8 }}
            />

            <FavoriteButton
              value={Boolean(item.favorite)}
              onToggle={() => toggleFavorite(item.id as number, Boolean(item.favorite))}
              size={20}
            />

            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}><Text style={styles.emptyText}>Aucun livre — tirez vers le bas pour actualiser</Text></View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eceff3",
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f1724",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#007aff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007aff",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 22,
    lineHeight: 22,
    fontWeight: "700",
  },
  flatEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#007aff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#f3f4f6",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontWeight: "700",
    color: "#0f1724",
    fontSize: 16,
  },
  subtitle: {
    color: "#64748b",
    marginTop: 4,
    fontSize: 13,
  },
  chevron: {
    color: "#cbd5e1",
    fontSize: 22,
    marginLeft: 8,
  },
  empty: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#94a3b8",
  },
});