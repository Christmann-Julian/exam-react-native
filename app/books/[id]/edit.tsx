import { useEffect, useState } from "react";
import { View, Alert } from "react-native";
import BookForm from "../../../components/BookForm";
import { getBook, updateBook, deleteBook } from "../../../utils/api";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Book } from "../../../types/api";

export default function EditBook() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = Number(params.id);
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const b = await getBook(id);
        setBook(b);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [id]);

  if (!book) return <View />;

  return (
    <View style={{ flex: 1 }}>
      <BookForm
        initial={book}
        submitLabel="Enregistrer"
        onSubmit={async (payload) => {
          try {
            await updateBook(id, payload);
            router.back();
          } catch (e: any) {
            Alert.alert("Erreur", e?.message || String(e));
          }
        }}
      />
    </View>
  );
}
