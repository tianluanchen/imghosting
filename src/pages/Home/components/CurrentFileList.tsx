import { Empty, Space, Card, Button, Popconfirm } from "antd";
import ImageCard from "./ImageCard";
import { useMemo } from "react";
import useGlobalMessage from "@/hooks/useGlobalMessage";
import useHistoryStore from "@/stores/history";
import { useTranslation } from "react-i18next";
import useFileStore from "@/stores/file";
import useApiStore from "@/stores/api";
import useAuthStore from "@/stores/auth";
import http from "@/helpers/http";
import { upload } from "@/helpers/buildApi";
import { calculateFileMD5 } from "@/helpers/hash";

export default function CurrentFileList() {
    const fileStore = useFileStore();
    const { t } = useTranslation();
    const message = useGlobalMessage();
    const uploadingFileCount = useMemo(() => {
        return fileStore.list.filter((file) => file.uploading).length;
    }, [fileStore]);
    const api = useApiStore((s) => s.getApi());
    const addRecord = useHistoryStore((state) => state.add);
    const authStore = useAuthStore();
    async function handleUpload(id: number) {
        const fm = fileStore.list.find((e) => e.id === id);
        if (!fm || fm.uploading) {
            return;
        }
        const sign = new AbortController();
        let md5Hash = fm.md5Hash;
        fileStore.update(id, {
            uploadSuccess: false,
            uploadError: undefined,
            uploadProgress: 0,
            uploading: true,
            sign
        });
        if (!md5Hash) {
            md5Hash = await calculateFileMD5(fm.file);
            fileStore.update(id, {
                md5Hash
            });
        }
        try {
            const result = await upload(api, {
                file: fm.file,
                signal: sign.signal,
                authKey: api.handleAuthKey
                    ? (authStore.getAuthKey(api.name) ?? undefined)
                    : undefined,
                md5Hash,
                onUploadProgress(ratio) {
                    fileStore.update(id, {
                        uploadProgress: ratio
                    });
                }
            });
            if (sign.signal.aborted) {
                return;
            }
            if (result.unauthorized) {
                authStore.clear(api.name);
            }
            if (!result.success) {
                throw new Error(result.message);
            }
            fileStore.update(id, {
                url: result.url,
                uploadSuccess: true
            });
            message.success(t("home.uploadSuccess"));
            addRecord(result.url, api.name);
        } catch (error) {
            const err = error as Error;
            if (!http.isAbortError(err)) {
                fileStore.update(id, {
                    uploadError: err
                });
                message.error(err.message);
            }
        } finally {
            fileStore.update(id, {
                uploading: false,
                uploadProgress: 0
            });
        }
    }
    function handleCancelUpload(id: number) {
        fileStore.abort(id);
        message.success(t("home.cancelUpload"));
    }
    function handleCancelUploadAll() {
        fileStore.abortAll();
        message.success(t("home.cancelAllUpload"));
    }
    function handleUploadAll() {
        for (const v of fileStore.list) {
            if (!v.url && !v.uploading) {
                handleUpload(v.id);
            }
        }
    }

    function handleDelete(id: number) {
        fileStore.delete(id);
        message.success(t("home.deleteSuccess"));
    }
    function handleDeleteAll() {
        fileStore.deleteAll();
        message.success(t("home.deleteAllSuccess"));
    }
    return (
        <>
            {fileStore.list.length <= 0 ? (
                <Empty description={t("home.noFiles")} />
            ) : (
                <Space direction="vertical" size={18}>
                    <Card bordered={false}>
                        <Space wrap>
                            <Button onClick={handleUploadAll} type="primary">
                                {t("home.uploadAll")}
                            </Button>
                            <Button
                                disabled={uploadingFileCount < 1}
                                onClick={handleCancelUploadAll}
                            >
                                {t("home.cancelAll", {
                                    countTip:
                                        uploadingFileCount > 0 ? `(${uploadingFileCount})` : ""
                                })}
                            </Button>
                            <Popconfirm title={t("home.sureDeleteAll")} onConfirm={handleDeleteAll}>
                                <Button disabled={uploadingFileCount > 0} danger>
                                    {t("home.deleteAll", {
                                        countTip:
                                            fileStore.list.length > 0
                                                ? `(${fileStore.list.length})`
                                                : ""
                                    })}
                                </Button>
                            </Popconfirm>
                        </Space>
                    </Card>
                    {fileStore.list.map((e) => {
                        return (
                            <ImageCard
                                key={e.id}
                                file={e.file}
                                uploading={e.uploading}
                                url={e.url}
                                uploadSuccess={e.uploadSuccess}
                                uploadError={e.uploadError}
                                uploadProgress={e.uploadProgress}
                                onUpload={() => handleUpload(e.id)}
                                onCancelUpload={() => handleCancelUpload(e.id)}
                                onDelete={() => handleDelete(e.id)}
                            />
                        );
                    })}
                </Space>
            )}
        </>
    );
}
