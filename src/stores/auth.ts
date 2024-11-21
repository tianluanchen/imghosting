import { create } from "zustand";
import { persist } from "zustand/middleware";
import { withStorageDOMEvents } from "@/helpers/storageEvt";

type AuthStore = {
    /** it has been hashed */
    authKeyMap: Record<string, string>;
    clear: (name: string) => void;
    clearAll: () => void;
    setAuthKey: (name: string, authKey: string) => void;
    getAuthKey: (name: string) => string | null;
    hasAuthKey: (name: string) => boolean;
};
const useAuthStore = create(
    persist<AuthStore>(
        (set, get) => ({
            authKeyMap: {},
            clear: (name) => {
                const newMap = { ...get().authKeyMap };
                delete newMap[name];
                set({ authKeyMap: newMap });
            },
            clearAll: () => set({ authKeyMap: {} }),
            setAuthKey: (name, key) =>
                key.trim() !== "" && set({ authKeyMap: { ...get().authKeyMap, [name]: key } }),
            getAuthKey: (name) => get().authKeyMap[name],
            hasAuthKey: (name) => (get().authKeyMap[name] === undefined ? false : true)
        }),
        {
            name: "auth"
        }
    )
);
withStorageDOMEvents(useAuthStore);
export default useAuthStore;
