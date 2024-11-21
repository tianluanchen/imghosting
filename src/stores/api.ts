import { create } from "zustand";
import { persist } from "zustand/middleware";
import apis from "@/apis";
import { UploadApi } from "@/types/api";
import { withStorageDOMEvents } from "@/helpers/storageEvt";
type ApiStore = {
    /** current api name */
    current: string;
    getApi: () => UploadApi;
    setApi: (name: string) => void;
};
const useApiStore = create(
    persist<ApiStore>(
        (set, get) => ({
            current: apis[0].name,
            getApi: () => {
                return apis.find((e) => e.name === get().current) as UploadApi;
            },
            setApi: (name) => {
                if (apis.some((e) => e.name === name)) {
                    set({ current: name });
                }
            }
        }),
        {
            name: "api"
        }
    )
);

if (!useApiStore.getState().getApi()) {
    useApiStore.setState({ current: apis[0].name });
}

withStorageDOMEvents<ApiStore>(useApiStore);

export default useApiStore;
