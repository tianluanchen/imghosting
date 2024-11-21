import type { UploadApi } from "@/types/api";
import http from "./http";
// all funtions exported of this file are used to build upload api

export function generateFormData(init?: Record<string, any>) {
    const form = new FormData();
    if (init) {
        Object.keys(init).forEach((key) => {
            form.append(key, init[key]);
        });
    }
    return form;
}

/** "http:" and "https:" are default protocols */
export function isUrl(s: string, protocols: string[] = ["http:", "https:"]) {
    try {
        return protocols.includes(new URL(s).protocol);
    } catch (error) {
        return false;
    }
}

/** Determine if the data is a Record type and has the correct value on the specified path */
export function isDataWithPaths(data: any, ...paths: string[]): boolean {
    if (data === null || typeof data !== "object") {
        return false;
    }
    for (const p of paths) {
        const slices = p
            .trim()
            .split(".")
            .filter((e) => e === "");
        let head = data;
        for (const s of slices) {
            if (data?.[s] === undefined) {
                return false;
            }
            head = data[s];
        }
    }
    return true;
}

export async function upload(
    api: UploadApi,
    {
        file,
        md5Hash,
        onUploadProgress,
        signal,
        authKey
    }: {
        file: File;
        md5Hash: string;
        signal?: AbortSignal;
        onUploadProgress?: (ratio: number, loaded: number, total: number) => void;
        authKey?: string;
    }
) {
    const req = await Promise.resolve(api.buildRequest({ file, md5Hash, authKey }));
    req.responseType = req.responseType || "text";
    const resp = await http(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body,
        signal,
        responseType: "text",
        onUploadProgress
    });
    if (req.responseType == "json") {
        resp.body = JSON.parse(resp.body);
    }
    const result = await Promise.resolve(api.resolveResponse(resp, authKey));
    if (!isUrl(result.url)) {
        // resolve url if no protocols, maybe it's self hosting
        result.url = new URL(result.url, location.href).href;
    }
    return result;
}
