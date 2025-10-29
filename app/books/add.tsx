import React from "react";
import { View } from "react-native";
import BookForm from "../../components/BookForm";
import { createBook } from "../../utils/api";
import { useRouter } from "expo-router";

export default function AddBook() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <BookForm
        submitLabel="Ajouter"
        onSubmit={async (payload) => {
          await createBook(payload);
          router.back();
        }}
      />
    </View>
  );
}
