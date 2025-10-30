import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  TouchableWithoutFeedback,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { DropdownProps } from "../types/props";
import { useTheme } from "../context/theme";

export default function Dropdown<T extends string>({
  label,
  value,
  options,
  onSelect,
  minWidth = 96,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        style={[styles.dropdownBtn, { minWidth }]}
      >
        <Text style={styles.dropdownBtnText}>
          {options.find((o) => o.key === value)?.label ?? label}
        </Text>
        <Feather name="chevron-down" size={16} color={theme.colors.muted} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalCard}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.modalItem,
                    opt.key === value && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    onSelect(opt.key);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      opt.key === value && styles.modalItemTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme> extends { theme: infer T } ? T : any) {
  return StyleSheet.create({
    dropdownWrapper: {
      marginRight: 8,
    },
    dropdownBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.soft,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOpacity: 0.03,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: Platform.OS === "android" ? 1 : 0,
    },
    dropdownBtnText: {
      color: theme.colors.text,
      fontWeight: "600",
      marginRight: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.2)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    modalCard: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      paddingVertical: 8,
      overflow: "hidden",
    },
    modalItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    modalItemActive: {
      backgroundColor: theme.colors.primary,
    },
    modalItemText: {
      color: theme.colors.text,
      fontWeight: "600",
    },
    modalItemTextActive: {
      color: theme.colors.card,
    },
  });
}