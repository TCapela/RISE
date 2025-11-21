import { create } from "zustand";

export type NotificationPrefs = {
  app: boolean;
  studyReminders: boolean;
  email: boolean;
};

type ThemeMode = "system" | "light" | "dark";

type SettingsState = {
  notifications: NotificationPrefs;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleNotification: (key: keyof NotificationPrefs) => void;
};

export const useSettings = create<SettingsState>((set) => ({
  notifications: {
    app: true,
    studyReminders: true,
    email: false,
  },
  theme: "system",
  setTheme: (theme) => set({ theme }),
  toggleNotification: (key) =>
    set((state) => ({
      notifications: {
        ...state.notifications,
        [key]: !state.notifications[key],
      },
    })),
}));
