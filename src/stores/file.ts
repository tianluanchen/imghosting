import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type FileManager = {
    id: number;
    file: File;
    md5Hash?: string;
    url?: string;
    uploading: boolean;
    uploadSuccess?: boolean;
    uploadError?: Error;
    uploadProgress: number; // 0.0-1.0
    sign?: AbortController;
};

/** upload records */
type FileStore = {
    list: FileManager[];
    add: (file: File) => void;
    deleteAll: () => void;
    delete: (id: number) => void;
    abort: (id: number) => void;
    abortAll: () => void;
    update: (id: number, v: Partial<Omit<FileManager, "id" | "file">>) => void;
};

let id = 0;

const useFileStore = create(
    immer<FileStore>((set) => ({
        list: [],
        update: (id, v) =>
            set(({ list }) => {
                const fm = list.find((e) => e.id === id);
                if (!fm) {
                    return;
                }
                Object.assign(fm, v);
            }),
        deleteAll: () =>
            set(({ list }) => {
                list.forEach((e) => e.sign?.abort());
                list.splice(0, list.length);
            }),
        delete: (id) =>
            set((state) => {
                state.list = state.list.filter((e) => {
                    if (id === e.id) {
                        e.sign?.abort();
                        return false;
                    } else {
                        return true;
                    }
                });
            }),
        abort: (id) =>
            set((s) => {
                const fm = s.list.find((e) => e.id === id);
                if (fm) {
                    fm.uploadProgress = 0;
                    fm.sign?.abort();
                    fm.uploading = false;
                }
            }),
        abortAll: () =>
            set((s) => {
                s.list.forEach((e) => {
                    if (!e.uploading) {
                        return;
                    }
                    e.sign?.abort();
                    e.uploadProgress = 0;
                    e.uploading = false;
                    e.uploadError = undefined;
                    e.uploadSuccess = undefined;
                });
            }),
        add: (f: File) =>
            set(({ list }) => {
                list.push({
                    id: ++id,
                    file: f,
                    uploadProgress: 0,
                    uploading: false
                });
            })
    }))
);
export default useFileStore;
