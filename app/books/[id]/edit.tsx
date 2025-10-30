import { useEffect, useState } from "react";
import { View } from "react-native";
import BookForm from "../../../components/BookForm";
import { getBook, updateBook } from "../../../service/api";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Book } from "../../../types/api";
import { useFlash } from "../../../context/FlashProvider";

export default function EditBook() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { show } = useFlash();
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
            show("Modifications enregistrées", "success");
            router.replace("/books" as any);
          } catch (e: any) {
            show("Erreur lors de l'enregistrement", "error");
          }
        }}
      />
    </View>
  );
}
