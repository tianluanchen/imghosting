import type { Mutate, StoreApi } from "zustand";

type StorageChangeCallback<T = string | null> = (args: {
    area: "localStorage" | "sessionStorage";
    key: T;
    newValue: string | null;
    oldValue: string | null;
    evt: StorageEvent;
    removeListener: () => void;
}) => void;

/** if key is null then listen all changes */
export function onStorageChange<T = string | null>(
    area: "localStorage" | "sessionStorage",
    key: T,
    callback: StorageChangeCallback<T>
): () => void {
    const listener = (e: StorageEvent) => {
        if (area === "localStorage" && e.storageArea !== window.localStorage) {
            return;
        }
        if (area === "sessionStorage" && e.storageArea !== window.sessionStorage) {
            return;
        }
        if (e.key === null || e.key === key || key === null) {
            callback({
                area,
                key: key,
                newValue: e.newValue,
                oldValue: e.oldValue,
                evt: e,
                removeListener
            });
        }
    };
    window.addEventListener("storage", listener);
    const removeListener = () => window.removeEventListener("storage", listener);
    return removeListener;
}

/** if key is null then listen all changes */
export function onLocalStorageChange<T = string | null>(
    key: T,
    callback: StorageChangeCallback<T>
): () => void {
    return onStorageChange("localStorage", key, callback);
}

type StoreWithPersist<T> = Mutate<StoreApi<T>, [["zustand/persist", T]]>;
/** https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#how-can-i-rehydrate-on-storage-event */
export function withStorageDOMEvents<T>(store: StoreWithPersist<T>) {
    return onLocalStorageChange(
        store.persist.getOptions().name!,
        ({ newValue }) => newValue && store.persist.rehydrate()
    );
}
