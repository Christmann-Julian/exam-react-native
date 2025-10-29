import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Platform,
  TextInput,
  ActivityIndicator
} from "react-native";
import { getBooks, updateBook } from "../../service/api";
import { Book } from "../../types/api";
import { FilterKey, SortKey } from "../../types/filter";
import { useRouter, useFocusEffect } from "expo-router";
import FavoriteButton from "../../components/FavoriteButton";
import ReadButton from "../../components/ReadButton";
import Dropdown from "../../components/Dropdown";
import { Feather } from "@expo/vector-icons";

export default function BooksList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortBy, setSortBy] = useState<SortKey>("title");

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
    setBooks((prev) => prev.map((b) => (b.id === itemId ? { ...b, favorite: !current } : b)));
    try {
      await updateBook(itemId, { favorite: !current });
    } catch (e) {
      console.warn("toggle favorite failed", e);
      setBooks((prev) => prev.map((b) => (b.id === itemId ? { ...b, favorite: current } : b)));
      throw e;
    }
  };

  const toggleRead = async (itemId: number, current: boolean) => {
    setBooks((prev) => prev.map((b) => (b.id === itemId ? { ...b, read: !current } : b)));
    try {
      await updateBook(itemId, { read: !current });
    } catch (e) {
      console.warn("toggle read failed", e);
      setBooks((prev) => prev.map((b) => (b.id === itemId ? { ...b, read: current } : b)));
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

  const displayedBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = books.slice();

    if (q) {
      list = list.filter((b) => {
        const name = (b.name || "").toLowerCase();
        const author = (b.author || "").toLowerCase();
        return name.includes(q) || author.includes(q);
      });
    }

    if (filter === "read") list = list.filter((b) => Boolean(b.read));
    else if (filter === "unread") list = list.filter((b) => !b.read);
    else if (filter === "fav") list = list.filter((b) => Boolean(b.favorite));

    list.sort((a, b) => {
      const key = sortBy === "title" ? "name" : sortBy === "author" ? "author" : "theme";
      const va = (a as any)[key] ?? "";
      const vb = (b as any)[key] ?? "";
      if (typeof va === "number" && typeof vb === "number") return va - vb;
      return String(va).localeCompare(String(vb), undefined, { sensitivity: "base" });
    });

    return list;
  }, [books, query, filter, sortBy]);

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes livres</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
           style={styles.statsButton}
           activeOpacity={0.8}
           onPress={() => router.push("/stats")}
           accessibilityLabel="Stats"
         >
           <Feather name="bar-chart-2" size={18} color="#fff" />
         </TouchableOpacity>
         <TouchableOpacity
           style={styles.addButton}
           activeOpacity={0.7}
           onPress={() => router.push("/books/add")}
           accessibilityLabel="Ajouter"
         >
           <Text style={styles.addButtonText}>＋</Text>
         </TouchableOpacity>
       </View>
      </View>

      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#94a3b8" />
          <TextInput
            placeholder="Rechercher titre / auteur..."
            placeholderTextColor="#9aa4b2"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x" size={16} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.dropdownRow}>
          <Dropdown<FilterKey>
            value={filter}
            options={[
              { key: "all", label: "Tous" },
              { key: "read", label: "Lus" },
              { key: "unread", label: "Non lus" },
              { key: "fav", label: "Favoris" },
            ]}
            onSelect={(k) => setFilter(k)}
          />

          <Dropdown<SortKey>
            value={sortBy}
            options={[
              { key: "title", label: "Titre" },
              { key: "author", label: "Auteur" },
              { key: "theme", label: "Thème" },
            ]}
            onSelect={(k) => setSortBy(k)}
          />
        </View>
      </View>

      {loading && books.length === 0 ? (
       <View style={styles.loaderContainer}>
         <ActivityIndicator size="large" color="#007aff" />
       </View>
     ) : (
       <FlatList
         contentContainerStyle={displayedBooks.length === 0 ? styles.flatEmpty : undefined}
         data={displayedBooks}
         keyExtractor={(i) => String(i.id)}
         refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
         renderItem={({ item }) => (
           <TouchableOpacity
             style={styles.card}
             activeOpacity={0.85}
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
                 {item.author} · {item.year} · {item.theme || "Sans thème"}
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
           <View style={styles.empty}>
             <Text style={styles.emptyText}>Aucun livre — tirez vers le bas pour actualiser</Text>
           </View>
         )}
       />
     )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    shadowColor: "#10b981",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    borderWidth: 1,
    borderColor: "#e6eef8",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0f1724",
    padding: 0,
  },

  dropdownRow: {
    flexDirection: "row",
    gap: 8,
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