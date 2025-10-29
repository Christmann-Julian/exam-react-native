import { useRouter } from "expo-router";
import { View } from "react-native";
import { useFlash } from "../../service/FlashProvider";
import BookForm from "../../components/BookForm";
import { createBook } from "../../service/api";

export default function AddBook() {
  const router = useRouter();
  const { show } = useFlash();

  return (
    <View style={{ flex: 1 }}>
      <BookForm
        submitLabel="Ajouter"
        onSubmit={async (payload) => {
          try {
            await createBook(payload);
            show("Livre ajouté", "success");
            router.replace("/books" as any);
          } catch (e: any) {
            show("Erreur lors de l'ajout", "error");
          }
        }}
      />
    </View>
  );
}