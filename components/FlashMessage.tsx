import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, ViewStyle } from "react-native";

type Props = {
  message?: string;
  type?: "success" | "error";
  visible?: boolean;
  duration?: number; // ms
  onHide?: () => void;
  style?: ViewStyle;
};

export default function FlashMessage({
  message,
  type = "success",
  visible = false,
  duration = 2200,
  onHide,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    if (visible && message) {
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
        hideTimer = setTimeout(() => {
          Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
            onHide && onHide();
          });
        }, duration);
      });
    }
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [visible, message, duration, opacity, onHide]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        type === "success" ? styles.success : styles.error,
        { opacity },
        style,
      ]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 80,
    left: 16,
    right: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    zIndex: 999,
    alignItems: "center",
    width: 250
  },
  success: {
    backgroundColor: "#0ea5a6",
  },
  error: {
    backgroundColor: "#ef4444",
  },
  text: {
    color: "#fff",
    fontWeight: "700",
  },
});