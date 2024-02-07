import { Empty, Space, Card, Button, Alert, Popconfirm } from "antd";
import ImageCard from "./__ImageCard";
import { useState, useRef } from "react";
import useGlobalMessage from "@/hooks/useGlobalMessage";
import useHistoryStore from "@/stores/history";
import { useTranslation } from "react-i18next";
export default function CurrentFileList({
    files,
    dispatch
}: {
    files: { value: File; id: number }[];
    dispatch: (...args: any[]) => void;
}) {
    const { t } = useTranslation();
    const [closeTip, setCloseTip] = useState(false);
    const message = useGlobalMessage();
    const imageCardsRef = useRef(
        new Map<number, { upload: () => any; cancelUpload: () => boolean }>()
    );
    function handleUploadAll() {
        for (const v of imageCardsRef.current.values()) {
            v.upload();
        }
    }
    function handleCancelUploadAll() {
        let canceled = false;
        for (const v of imageCardsRef.current.values()) {
            if (v.cancelUpload()) {
                canceled = true;
            }
        }
        if (!canceled) {
            message.warning(t("home.noUploadingTasks"));
        }
    }
    function handleDelete(id: number) {
        dispatch({
            type: "deleted",
            ids: [id]
        });
        message.success(t("home.deleteSuccess"));
    }
    function handleDeleteAll() {
        dispatch({
            type: "deletedAll"
        });
        message.success(t("home.deleteAllSuccess"));
    }

    const addReocrd = useHistoryStore((state) => state.add);
    function handleUploadSuccess(url: string, apiName: string) {
        addReocrd(url, apiName);
    }
    return (
        <>
            {files.length <= 0 ? (
                <Empty description={t("home.noFiles")} />
            ) : (
                <Space direction="vertical" size={18}>
                    <Card bordered={false}>
                        {!closeTip && (
                            <Alert
                                style={{ marginBottom: 12 }}
                                afterClose={() => setCloseTip(true)}
                                closable
                                message={t("home.tip")}
                                type="warning"
                                showIcon
                            />
                        )}
                        <Space wrap>
                            <Button onClick={handleUploadAll} type="primary">
                                {t("home.uploadAll")}
                            </Button>
                            <Button onClick={handleCancelUploadAll}>{t("home.cancelAll")}</Button>
                            <Popconfirm title={t("home.sureDeleteAll")} onConfirm={handleDeleteAll}>
                                <Button danger>
                                    {t("home.deleteAll", {
                                        countTip: files.length > 0 ? `(${files.length})` : ""
                                    })}
                                </Button>
                            </Popconfirm>
                        </Space>
                    </Card>
                    {files.map((e) => {
                        return (
                            <ImageCard
                                ref={(node) => {
                                    if (node) {
                                        imageCardsRef.current.set(e.id, node);
                                    } else {
                                        imageCardsRef.current.delete(e.id);
                                    }
                                }}
                                key={e.id}
                                file={e}
                                onUploadSuccess={handleUploadSuccess}
                                onDelete={() => handleDelete(e.id)}
                            />
                        );
                    })}
                </Space>
            )}
        </>
    );
}
