"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLang = "en" | "hi";
export type UiMode = "auto" | "phone" | "pc";

type UserProfile = {
  name: string;
  username: string;
};

type SettingsContextValue = {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  uiMode: UiMode;
  setUiMode: (mode: UiMode) => void;
  isPhoneUi: boolean;
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
  userName: string;
  userUsername: string;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
  clearAppData: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const STORAGE = {
  lang: "bb_lang",
  uiMode: "bb_ui_mode",
  notifications: "bb_notifications",
};

function setEnglishCookie() {
  document.cookie = "bb_lang=en; path=/; max-age=31536000; samesite=lax";
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AppLang>("en");
  const [uiMode, setUiModeState] = useState<UiMode>("auto");
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  const [notifications, setNotificationsState] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const refreshAuth = async () => {
    setIsAuthLoading(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.authenticated) {
        setUser(null);
        return;
      }
      const name = String(data?.user?.name || "").trim();
      const username = String(data?.user?.username || "").trim();
      setUser(username ? { name, username } : null);
    } catch {
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    // Force app to English + auto device mode
    setLangState("en");
    setEnglishCookie();
    setUiModeState("auto");
    localStorage.removeItem(STORAGE.lang);
    localStorage.removeItem(STORAGE.uiMode);

    const savedNotifications = localStorage.getItem(STORAGE.notifications);
    setNotificationsState(savedNotifications !== "0");

    refreshAuth();
  }, []);

  const setLang = (_next: AppLang) => {
    setLangState("en");
    localStorage.removeItem(STORAGE.lang);
    setEnglishCookie();
  };

  useEffect(() => {
    const update = () => setIsNarrowViewport(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const setUiMode = (_next: UiMode) => {
    setUiModeState("auto");
    localStorage.removeItem(STORAGE.uiMode);
  };

  const setNotifications = (enabled: boolean) => {
    setNotificationsState(enabled);
    localStorage.setItem(STORAGE.notifications, enabled ? "1" : "0");
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch {}
    setUser(null);
  };

  const clearAppData = () => {
    localStorage.removeItem(STORAGE.notifications);
    localStorage.removeItem(STORAGE.uiMode);
    localStorage.removeItem(STORAGE.lang);
    localStorage.removeItem("bbabibazzar_cart_v1");
    setNotificationsState(true);
    setLangState("en");
    setUiModeState("auto");
    setEnglishCookie();
  };

  const isPhoneUi = isNarrowViewport;

  const value = useMemo<SettingsContextValue>(
    () => ({
      lang,
      setLang,
      uiMode,
      setUiMode,
      isPhoneUi,
      notifications,
      setNotifications,
      userName: user?.name || "",
      userUsername: user?.username || "",
      isLoggedIn: !!user?.username,
      isAuthLoading,
      refreshAuth,
      logout,
      clearAppData,
    }),
    [lang, uiMode, isPhoneUi, notifications, user, isAuthLoading]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
