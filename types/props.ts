import type { ViewStyle } from "react-native";
import type { Book } from "./api";

export type Option<T extends string> = { key: T; label: string };

export type DropdownProps<T extends string> = {
  label?: string;
  value: T;
  options: Option<T>[];
  onSelect: (k: T) => void;
  minWidth?: number;
};

export type StarProps = {
  value: number | null;
  onChange: (v: number | null) => void;
  max?: number;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
};

export type ReadButtonProps = {
  value: boolean;
  onToggle: (next: boolean) => Promise<void> | void;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  style?: ViewStyle;
};

export type FavoriteButtonProps = {
  value: boolean;
  onToggle: (next: boolean) => Promise<void> | void;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
};

export type BookFormProps = {
  initial?: Partial<Book>;
  onSubmit: (payload: Partial<Book>) => Promise<void> | void;
  submitLabel?: string;
};

export type FlashMessageProps = {
  message?: string;
  type?: "success" | "error";
  visible?: boolean;
  duration?: number;
  onHide?: () => void;
  style?: ViewStyle;
};