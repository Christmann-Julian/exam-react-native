import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, ScrollView } from "react-native";
import { getBooks } from "../service/api";
import { Book } from "../types/api";
import { PieChart, ProgressChart } from "react-native-chart-kit";
import { useFocusEffect, useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

export default function BooksStats() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBooks();
      setBooks(data);
    } catch (e) {
      console.warn("load stats failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(16,185,129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(71,85,105, ${opacity})`,
    style: {
      borderRadius: 8,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#10b981",
    },
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const total = books.length;
  const readCount = books.filter((b) => Boolean(b.read)).length;
  const unreadCount = total - readCount;

  const ratings = books.map((b) => (b.rating == null ? null : Number(b.rating))).filter((r) => r != null) as number[];
  const avgRating = ratings.length ? ratings.reduce((s, v) => s + v, 0) / ratings.length : 0;
  const avgNormalized = Math.min(Math.max(avgRating / 5, 0), 1);

  const pieData = [
    {
      name: "Lus",
      count: readCount,
      color: "#10b981",
      legendFontColor: "#0f1724",
      legendFontSize: 12,
    },
    {
      name: "Non lus",
      count: unreadCount,
      color: "#64748b",
      legendFontColor: "#0f1724",
      legendFontSize: 12,
    },
  ].filter((d) => d.count > 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Statistiques</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lecture</Text>
        {total === 0 ? (
          <Text style={styles.hint}>Aucun livre</Text>
        ) : (
          <>
            <PieChart
              data={pieData.map((p) => ({ name: p.name, population: p.count, color: p.color, legendFontColor: p.legendFontColor, legendFontSize: p.legendFontSize }))}
              width={Math.min(screenWidth - 48, 420)}
              height={180}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              chartConfig={chartConfig}
              absolute
            />
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#10b981" }]}>{readCount}</Text>
                <Text style={styles.statLabel}>Lus</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#64748b" }]}>{unreadCount}</Text>
                <Text style={styles.statLabel}>Non lus</Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Moyenne des notes</Text>
        {ratings.length === 0 ? (
          <Text style={styles.hint}>Aucune note</Text>
        ) : (
          <>
            <ProgressChart
              data={{ data: [avgNormalized] }}
              width={Math.min(screenWidth - 48, 420)}
              height={140}
              strokeWidth={12}
              radius={60}
              chartConfig={chartConfig}
              hideLegend
            />
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{avgRating.toFixed(2)} / 5</Text>
                <Text style={styles.statLabel}>Moyenne</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{ratings.length}</Text>
                <Text style={styles.statLabel}>Notes</Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f6f7fb",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: {     
    fontSize: 20,
    fontWeight: "700",
    color: "#0f1724",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  cardTitle: { fontWeight: "700", color: "#0f1724", marginBottom: 8 },
  hint: { color: "#94a3b8" },
  statsRow: { flexDirection: "row", marginTop: 8, width: "100%", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "800", color: "#0f1724" },
  statLabel: { color: "#64748b", fontWeight: "700" },
});