import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();
  const img = require("../assets/images/biblio.jpg");

  return (
    <View style={styles.safe}>
      <View style={styles.container}>
        <Image source={img} style={styles.image} resizeMode="cover" />
        <Text style={styles.title}>Bienvenue dans ma bibliothèque</Text>
        <Text style={styles.subtitle}>
          Parcourez, ajoutez et modifiez vos livres facilement.
        </Text>

        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.85}
          onPress={() => router.push("/books" as any)}
        >
          <Text style={styles.ctaText}>Voir mes livres</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 400,
    borderRadius: 14,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f1724",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  cta: {
    backgroundColor: "#007aff",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    minWidth: 180,
    alignItems: "center",
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});