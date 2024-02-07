import type { UploadApi } from "@/types/api";
import { isUrl } from "@/helpers/buildApi";
import { calculateSHA256 } from "@/helpers/hash";
export default {
    title: "Example",
    name: "example",
    order: 0,
    accept: "image/*",
    handleAuthKey(key) {
        return calculateSHA256(key);
    },
    buildRequest({ file, md5Hash, authKey }) {
        return {
            method: "PUT",
            headers: {
                auth: authKey
            },
            url: "http://127.0.0.1:3000/upload?md5Hash=" + md5Hash,
            body: file.slice(0, file.size),
            responseType: "text"
        };
    },
    resolveResponse({ body }) {
        const success = isUrl(body);
        return {
            url: success ? body : "",
            success,
            message: body,
            unauthorized: /unauthorized/i.test(body)
        };
    }
} as UploadApi<string>;
