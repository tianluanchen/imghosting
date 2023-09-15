import { UploadApi } from "@/types/api";
const modules: Record<string, UploadApi> = import.meta.glob(["./*.ts", "!./index.ts"], {
    eager: true,
    import: "default"
});
const apis = Object.values(modules).filter((e) => !e.disabled);
const names = apis.map((e) => e.name);
if (new Set(names).size !== names.length) {
    throw new Error("API collection name duplication error!");
}
apis.sort((a, b) => {
    if (a.order !== undefined && b.order === undefined) {
        return -1;
    } else if (a.order === undefined && b.order !== undefined) {
        return 1;
    } else if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
    }
    return a.name > b.name ? 1 : -1;
});
// console.log(apis);
export default apis;
