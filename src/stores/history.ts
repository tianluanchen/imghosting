import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { withStorageDOMEvents } from "@/helpers/storageEvt";

type UploadRecord = {
    /** cloud storage url, and it's  also primary key */
    url: string;
    apiName: string;
    uploadDate: number;
};

export type { UploadRecord };

/** upload records */
type HistoryStore = {
    history: UploadRecord[];
    add: (url: string, apiName: string) => void;
    delete: (...urls: string[]) => void;
    deleteAll: () => void;
};

const useHistoryStore = create(
    persist(
        immer<HistoryStore>((set) => ({
            history: [],
            add: (url, name) => {
                set(({ history }) => {
                    if (
                        history.some((e) => {
                            if (e.url === url) {
                                e.apiName = name;
                                e.uploadDate = Date.now();
                                return true;
                            }
                            return false;
                        })
                    ) {
                        return;
                    }
                    history.push({ url, apiName: name, uploadDate: Date.now() });
                });
            },
            delete: (...urls) => {
                set((state) => {
                    state.history = state.history.filter((e) => !urls.includes(e.url));
                });
            },
            deleteAll: () => {
                set({ history: [] });
            }
        })),
        {
            name: "history"
        }
    )
);
withStorageDOMEvents(useHistoryStore);
export default useHistoryStore;
