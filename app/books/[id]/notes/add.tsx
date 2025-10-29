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
import { createNote } from "../../../../utils/api";

export default function AddNotes() {
  const params = useLocalSearchParams();
  const router = useRouter();
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
      router.back();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || String(e));
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
          placeholderTextColor="#9aa4b2"
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f7fb" },
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: "#0f1724" },
  input: {
    backgroundColor: "#fff",
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
    backgroundColor: "#007aff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "700" },
});