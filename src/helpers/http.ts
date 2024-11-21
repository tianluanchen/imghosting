interface HttpResponse<T = any> {
    headers: Headers;
    status: number;
    statusText: string;
    body: T;
}

export type { HttpResponse };

export function xhrToHttpResp<T>(xhr: XMLHttpRequest): HttpResponse<T> {
    const headers = new Headers();
    xhr.getAllResponseHeaders()
        .trim()
        .split("\r\n")
        .forEach((e) => {
            const colonIndex = e.indexOf(":");
            if (colonIndex <= -1) {
                return;
            }
            const k = e.slice(0, colonIndex).trim();
            const v = e.slice(colonIndex + 1).trim();
            if (headers.has(k)) {
                headers.append(k, v);
            } else {
                headers.set(k, v);
            }
        });
    return {
        headers,
        status: xhr.status,
        statusText: xhr.statusText,
        body: xhr.response
    };
}

export default function http<T = any>(
    url: URL | string,
    {
        method,
        signal,
        responseType,
        headers,
        body,
        onUploadProgress,
        onProgress
    }: {
        method?: "GET" | "POST" | "PUT" | "DELETE" | string;
        signal?: AbortSignal;
        responseType?: XMLHttpRequestResponseType;
        headers?: HeadersInit;
        body?: any;
        onProgress?: (ratio: number, loaded: number, total: number) => void;
        onUploadProgress?: (ratio: number, loaded: number, total: number) => void;
    }
) {
    return new Promise<HttpResponse<T>>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = responseType || "";
        xhr.open(method ?? "GET", url);
        if (headers) {
            const h = new Headers(headers);
            Array.from(h.entries()).forEach(([k, v]) => {
                xhr.setRequestHeader(k, v);
            });
        }

        xhr.upload.onprogress = (evt) => {
            onUploadProgress?.(evt.loaded / evt.total, evt.loaded, evt.total);
        };
        xhr.onprogress = (evt) => {
            onProgress?.(evt.loaded / evt.total, evt.loaded, evt.total);
        };
        xhr.onload = () => {
            resolve(xhrToHttpResp<T>(xhr));
        };
        signal?.addEventListener("abort", () => {
            xhr.abort();
            reject(new Error("AbortError"));
        });
        xhr.onabort = () => {
            reject(new Error("AbortError"));
        };
        xhr.onerror = (evt) => {
            reject(new Error("NetworkError"));
        };
        xhr.send(body);
    });
}
http.isAbortError = (error: any) => {
    if (error instanceof Error && error.message === "AbortError") {
        return true;
    }
    return false;
};
