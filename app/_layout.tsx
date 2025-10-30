import React from "react";
import { Stack } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlashRoot } from "@/context/FlashProvider";
import { ThemeProvider, useTheme } from "@/context/theme";

export default function AppLayout() {
  return (
    <ThemeProvider>
      <FlashRoot>
        <InnerLayout />
      </FlashRoot>
    </ThemeProvider>
  );
}

function InnerLayout() {
  const router = useRouter();
  const { theme, mode, toggle } = useTheme();
  const styles = createStyles(theme);

  const LeftIcon = () => (
    <View style={styles.left}>
      <Feather name="book" size={20} color={theme.colors.primary} />
      <Text style={styles.leftText}>Ma bibliothèque</Text>
    </View>
  );

  const RightActions = () => {
    return (
      <View style={styles.right}>
        <TouchableOpacity
          style={styles.action}
          onPress={() => router.push("/")}
          accessibilityLabel="Accueil"
        >
          <Feather name="home" size={18} color={theme.colors.text} />
          <Text style={styles.actionText}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={() => router.push("/books" as any)}
          accessibilityLabel="Liste des livres"
        >
          <Feather name="list" size={18} color={theme.colors.text} />
          <Text style={styles.actionText}>Livres</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={() => {
            toggle().catch((e) => console.warn(e));
          }}
          accessibilityLabel="Basculer le thème"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name={mode === "dark" ? "sun" : "moon"} size={18} color={theme.colors.text} />
          <Text style={styles.actionText}>{mode === "dark" ? "Clair" : "Sombre"}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Stack
      screenOptions={{
        headerLeft: () => <LeftIcon />,
        headerRight: () => <RightActions />,
        headerTitle: "",
        headerStyle: {
          backgroundColor: theme.colors.background,
          ...Platform.select({
            ios: { shadowColor: "transparent" },
            android: { elevation: 0 },
          }),
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Accueil" }} />
      <Stack.Screen name="books/index" options={{ title: "Livres" }} />
      <Stack.Screen name="books/add" options={{ title: "Ajouter un livre" }} />
      <Stack.Screen name="books/[id]/edit" options={{ title: "Modifier le livre" }} />
      <Stack.Screen name="books/[id]" options={{ title: "Détails du livre" }} />
      <Stack.Screen name="books/[id]/notes/add" options={{ title: "Ajouter une note" }} />
    </Stack>
  );
}

function createStyles(theme: ReturnType<typeof useTheme> extends { theme: infer T } ? T : any) {
  return StyleSheet.create({
    left: {
      paddingLeft: 12,
      alignItems: "center",
      flexDirection: "row",
    },
    leftText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
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
      backgroundColor: theme.colors.card,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.03,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 1,
    },
    actionText: {
      marginLeft: 6,
      fontSize: 13,
      color: theme.colors.text,
      fontWeight: "600",
    },
  });
}