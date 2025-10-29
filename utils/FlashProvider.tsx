import React, { createContext, useContext, useState, useCallback } from "react";
import FlashMessage from "../components/FlashMessage";

type Flash = { message: string; type?: "success" | "error"; visible: boolean };

type ContextType = {
  show: (message: string, type?: "success" | "error", duration?: number) => void;
  hide: () => void;
};

const FlashCtx = createContext<ContextType | null>(null);

export const FlashProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flash, setFlash] = useState<Flash | null>(null);

  const show = useCallback((message: string, type: "success" | "error" = "success", duration = 2200) => {
    setFlash({ message, type, visible: true });
    setTimeout(() => setFlash(null), duration + 300);
  }, []);

  const hide = useCallback(() => setFlash(null), []);

  return (
    <>
      {children}
      <FlashMessage
        message={flash?.message}
        type={flash?.type ?? "success"}
        visible={Boolean(flash?.visible)}
        onHide={hide}
      />
    </>
  );
};

export function useFlash() {
  const ctx = useContext(FlashCtx);
  if (ctx) return ctx;
  return {
    show: () => {},
    hide: () => {},
  };
}

export const FlashRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flash, setFlash] = useState<Flash | null>(null);

  const show = useCallback((message: string, type: "success" | "error" = "success", duration = 2200) => {
    setFlash({ message, type, visible: true });
    setTimeout(() => setFlash(null), duration + 300);
  }, []);

  const hide = useCallback(() => setFlash(null), []);

  return (
    <FlashCtx.Provider value={{ show, hide }}>
      {children}
      <FlashMessage
        message={flash?.message}
        type={flash?.type ?? "success"}
        visible={Boolean(flash?.visible)}
        onHide={hide}
      />
    </FlashCtx.Provider>
  );
};