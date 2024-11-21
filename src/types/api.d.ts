import type { HttpResponse } from "@/helpers/http";
type UploadRequest = {
    method?: "GET" | "POST" | "PUT" | "DELETE" | string;
    url: string;
    body: any;
    headers?: HeadersInit;
    /** auto parse response according to type */
    responseType?: "json" | "text";
};

type UploadResult = {
    success: boolean;
    message?: string;
    url: string;
    unauthorized?: boolean;
};

interface UploadApi<T = any> {
    title: string;
    /** unique key */
    name: string;
    /** maximum bytes */
    maxSize?: number;
    /** default "image/*" */
    accept?: string;
    /** sort according to the value */
    order?: number;
    /** self hosted APIs maybe require authkey */
    handleAuthKey?: (key: string) => string | Promise<string>;
    disabled?: boolean;
    /** sync/async */
    buildRequest: (args: {
        file: File;
        md5Hash: string;
        authKey?: string;
    }) => UploadRequest | Promise<UploadRequest>;
    /** sync/async */
    resolveResponse: (
        response: HttpResponse<T>,
        authKey?: string
    ) => UploadResult | Promise<UploadResult>;
}

export type { UploadApi, HttpResponse, UploadResult };
