import type { UploadApi } from "@/types/api";
import { generateFormData, isUrl } from "@/helpers/buildApi";
export default {
    title: "Sohu",
    name: "sohu",
    order: 20,
    // disabled: true,
    maxSize: 1024 ** 2 * 5,
    accept: "image/jpg,image/jpeg,image/png,image/gif",
    buildRequest({ file }) {
        return {
            method: "POST",
            url: "https://changyan.sohu.com/api/2/comment/attachment",
            body: generateFormData({
                file
            }),
            responseType: "text"
        };
    },
    resolveResponse({ body }) {
        const url = body.slice(12, body.length - 4);
        const success = isUrl(url);
        return {
            url: success ? url : "", // The link will expire after a period of time
            success,
            message: success ? undefined : `Invalid Response: ${body}`
        };
    }
} as UploadApi<string>;
