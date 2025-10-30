import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createNote } from "../../../../service/api";
import { useFlash } from "../../../../context/FlashProvider";
import { useTheme } from "../../../../context/theme";

export default function AddNotes() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { show } = useFlash();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const id = Number(params.id);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!content.trim()) {
      Alert.alert("Erreur", "Le contenu de la note est requis.");
      return;
    }
    try {
      setLoading(true);
      await createNote(id, content.trim());
      show("Note ajoutée", "success");
      router.back();
    } catch (e: any) {
      show("Erreur lors de l'ajout de la note", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Ajouter une note</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={6}
          placeholder="Écris ta note ici..."
          placeholderTextColor={theme.colors.muted}
          value={content}
          onChangeText={setContent}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={submit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ajouter</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme> extends { theme: infer T } ? T : any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: 16 },
    title: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: theme.colors.text },
    input: {
      backgroundColor: theme.colors.card,
      borderRadius: 10,
      padding: 12,
      minHeight: 140,
      textAlignVertical: "top",
      marginBottom: 12,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.03,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
        },
        android: { elevation: 1 },
      }),
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: "#fff", fontWeight: "700" },
  });
}