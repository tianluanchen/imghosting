import type { UploadApi } from "@/types/api";
import { generateFormData } from "@/helpers/buildApi";
export default {
    title: "ImgBB",
    name: "imgbb",
    order: 10,
    maxSize: 1024 ** 2 * 32,
    accept: "image/*, .jpg,.png,.bmp,.gif,.tif,.webp,.heic,.pdf,.jpeg,.tiff,.heif",
    buildRequest({ file }) {
        return {
            method: "POST",
            url: "https://zh-cn.imgbb.com/json",
            body: generateFormData({
                source: file,
                type: "file",
                action: "upload"
            }),
            responseType: "json"
        };
    },
    resolveResponse({ body }) {
        const success = body.status_code === 200;
        return {
            url: body?.image?.url,
            success,
            message: success ? body?.success?.message : body?.error?.message
        };
    }
} as UploadApi<{
    status_code: number;
    error?: {
        message: string;
    };
    success?: {
        message: string;
    };
    image?: {
        url: string;
    };
}>;
