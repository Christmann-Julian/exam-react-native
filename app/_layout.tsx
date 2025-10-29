import React from "react";
import { Stack } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlashRoot } from "@/service/FlashProvider";

export default function AppLayout() {
  const router = useRouter();

  const LeftIcon = () => (
    <View style={styles.left}>
      <Feather name="book" size={20} color="#007aff" />
      <Text style={styles.leftText}>Ma bibliothèque</Text>
    </View>
  );

  const RightActions = () => (
    <View style={styles.right}>
      <TouchableOpacity
        style={styles.action}
        onPress={() => router.push("/")}
        accessibilityLabel="Accueil"
      >
        <Feather name="home" size={18} color="#0f1724" />
        <Text style={styles.actionText}>Accueil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.action}
        onPress={() => router.push("/books" as any)}
        accessibilityLabel="Liste des livres"
      >
        <Feather name="list" size={18} color="#0f1724" />
        <Text style={styles.actionText}>Livres</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlashRoot>
      <Stack
        screenOptions={{
          headerLeft: () => <LeftIcon />,
          headerRight: () => <RightActions />,
          headerTitle: "",
          headerStyle: {
            backgroundColor: "#f6f7fb",
            ...Platform.select({
              ios: { shadowColor: "transparent" },
              android: { elevation: 0 },
            }),
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Accueil",
          }}
        />
        <Stack.Screen
          name="books/index"
          options={{
            title: "Livres",
          }}
        />
        <Stack.Screen name="books/add" options={{ title: "Ajouter un livre" }} />
        <Stack.Screen name="books/[id]/edit" options={{ title: "Modifier le livre" }} />
        <Stack.Screen name="books/[id]" options={{ title: "Détails du livre" }} />
        <Stack.Screen name="books/[id]/notes/add" options={{ title: "Ajouter une note" }} />
      </Stack>
    </FlashRoot>
  );
}

const styles = StyleSheet.create({
  left: {
    paddingLeft: 12,
    alignItems: "center",
    flexDirection: "row",
  },
  leftText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#0f1724",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eef2ff",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#0f1724",
    fontWeight: "600",
  },
});