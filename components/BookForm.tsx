import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Alert,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { Book } from "../types/api";
import type { BookFormProps } from "../types/props";
import Star from "./Star";


export default function BookForm({
  initial = {},
  onSubmit,
  submitLabel = "Enregistrer",
}: BookFormProps) {
  const [name, setName] = useState(initial.name || "");
  const [author, setAuthor] = useState(initial.author || "");
  const [editor, setEditor] = useState(initial.editor || "");
  const [theme, setTheme] = useState(initial.theme ?? "");
  const [year, setYear] = useState(initial.year ? String(initial.year) : "");
  const [read, setRead] = useState(Boolean(initial.read));
  const [favorite, setFavorite] = useState(Boolean(initial.favorite));
  const [rating, setRating] = useState<number | null>(
    initial.rating != null ? initial.rating : null
  );
  const [coverUri, setCoverUri] = useState<string | null>(
    initial.cover ?? null
  );
  const [loading, setLoading] = useState(false);

  const requestPermissionIfNeeded = async () => {
    if (Platform.OS === "web") return true;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "Permission d'accéder aux photos refusée.");
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const ok = await requestPermissionIfNeeded();
    if (!ok) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      let uri: string | undefined;
      if (!result.canceled && (result as any).assets && (result as any).assets.length) {
        uri = (result as any).assets[0].uri;
      } else if (!(result as any).cancelled && (result as any).uri) {
        uri = (result as any).uri;
      } else if ((result as any).uri) {
        uri = (result as any).uri;
      }

      if (uri) {
        setCoverUri(uri);
      }
    } catch (e: any) {
      console.warn("image pick error", e);
      Alert.alert("Erreur", "Impossible de sélectionner l'image.");
    }
  };

  const removeImage = () => {
    setCoverUri(null);
  };

  const submit = async () => {
    if (!name.trim() || !author.trim() || !editor.trim() || !year.trim()) {
      Alert.alert("Champs requis", "Titre, Auteur, Éditeur et Année sont requis.");
      return;
    }

    const payload: Partial<Book> = {
      name: name.trim(),
      author: author.trim(),
      editor: editor.trim(),
      theme: theme.trim() || null,
      year: Number(year),
      read,
      favorite,
      rating: rating == null ? null : Number(rating),
      cover: coverUri ?? null,
    };

    try {
      setLoading(true);
      await onSubmit(payload);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.label}>Image de couverture</Text>
        {coverUri ? (
          <View style={styles.previewRow}>
            <Image source={{ uri: coverUri }} style={styles.preview} />
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.previewBtn} onPress={pickImage}>
                <Text style={styles.previewBtnText}>Changer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.previewBtn, styles.removeBtn]} onPress={removeImage}>
                <Text style={[styles.previewBtnText, styles.removeBtnText]}>Retirer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
            <Text style={styles.imagePickerText}>Ajouter une image</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Titre</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex. Dune"
          placeholderTextColor="#9aa4b2"
          returnKeyType="next"
        />

        <Text style={styles.label}>Auteur</Text>
        <TextInput
          style={styles.input}
          value={author}
          onChangeText={setAuthor}
          placeholder="Ex. Frank Herbert"
          placeholderTextColor="#9aa4b2"
          returnKeyType="next"
        />

        <Text style={styles.label}>Éditeur</Text>
        <TextInput
          style={styles.input}
          value={editor}
          onChangeText={setEditor}
          placeholder="Ex. Chilton Books"
          placeholderTextColor="#9aa4b2"
          returnKeyType="next"
        />

        <Text style={styles.label}>Thème</Text>
        <TextInput
          style={styles.input}
          value={theme}
          onChangeText={setTheme}
          placeholder="Ex. Science-fiction"
          placeholderTextColor="#9aa4b2"
          returnKeyType="next"
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Année</Text>
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={(v) => setYear(v.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
              placeholder="1965"
              placeholderTextColor="#9aa4b2"
              returnKeyType="done"
            />
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Note</Text>
            <Star value={rating} onChange={setRating} />
            <Text style={styles.smallHint}>
              {rating == null ? "Aucune note" : `${rating} / 5`}
            </Text>
          </View>
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Lu</Text>
            <Switch
              value={read}
              onValueChange={setRead}
              thumbColor={Platform.OS === "android" ? (read ? "#007aff" : "#f4f3f4") : undefined}
            />
          </View>

          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Favori</Text>
            <Switch
              value={favorite}
              onValueChange={setFavorite}
              thumbColor={Platform.OS === "android" ? (favorite ? "#ffb400" : "#f4f3f4") : undefined}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={submit}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{submitLabel}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f6f7fb",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  imagePicker: {
    backgroundColor: "#eef2ff",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 12,
  },
  imagePickerText: {
    color: "#4338ca",
    fontWeight: "700",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  preview: {
    width: 84,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f3f4f6",
  },
  previewActions: {
    flex: 1,
    justifyContent: "center",
  },
  previewBtn: {
    backgroundColor: "#007aff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  previewBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  removeBtn: {
    backgroundColor: "#ef4444",
  },
  removeBtnText: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e6eef8",
    backgroundColor: "#fbfdff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontSize: 15,
    color: "#0f1724",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  col: {
    flex: 1,
  },
  smallHint: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 6,
  },
  switchRow: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 16,
  },
  switchItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  switchLabel: {
    marginRight: 8,
    color: "#475569",
    fontWeight: "600",
  },
  button: {
    marginTop: 18,
    backgroundColor: "#007aff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});