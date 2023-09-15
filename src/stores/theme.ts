import { create } from "zustand";
import { persist } from "zustand/middleware";
import { withStorageDOMEvents } from "@/helpers/storageEvt";
type ThemeStore = {
    theme: "light" | "dark";
    isDark: () => boolean;
    toggle: () => void;
    setTheme: (t: "light" | "dark") => void;
};

const useThemeStore = create(
    persist<ThemeStore>(
        (set, get) => ({
            theme: "light",
            toggle: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
            setTheme: (t) => set({ theme: t }),
            isDark: () => get().theme === "dark"
        }),
        {
            name: "theme"
        }
    )
);

withStorageDOMEvents(useThemeStore);

export default useThemeStore;
