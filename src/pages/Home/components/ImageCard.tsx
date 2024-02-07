import { Popover, Card, Alert, Button, Tag, Image, Space, Progress, Spin } from "antd";
import { type Ref, useEffect, useState, useMemo } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import useWindowSize from "@/hooks/useWindowSize";
import formatSize from "@/helpers/formatSize";
import Result from "./Result";
import { useTranslation } from "react-i18next";
export function ImageCard(
    {
        file,
        url,
        uploading,
        uploadProgress,
        uploadError,
        uploadSuccess,
        onUpload,
        onCancelUpload,
        onDelete
    }: {
        file: File;
        url?: string;
        uploading: boolean;
        uploadProgress?: number;
        uploadError?: Error;
        uploadSuccess?: boolean;
        onUpload: (...args: any[]) => void;
        onCancelUpload: (...args: any[]) => void;
        onDelete: (...args: any[]) => void;
    },
    ref: Ref<{
        upload: () => any;
        cancelUpload: () => any;
    }>
) {
    const firendlySize = useMemo(() => formatSize(file.size), [file.size]);
    const [src, setSrc] = useState<string | null | undefined>(null);
    useEffect(() => {
        if (url) {
            setSrc(url);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setSrc(objectUrl);
        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file, url]);

    const [imageSize, setImageSize] = useState<null | { width: number; height: number }>(null);

    useEffect(() => {
        if (!src) {
            setImageSize(null);
            return;
        }
        let ignore = false;
        const imageEl = new window.Image();
        imageEl.onload = () => {
            !ignore && setImageSize({ width: imageEl.naturalWidth, height: imageEl.naturalHeight });
        };
        imageEl.src = src;
        return () => {
            ignore = true;
            imageEl.onload = null;
        };
    }, [src]);

    const { t } = useTranslation();
    const windowSize = useWindowSize();

    const tip = useMemo<null | { type: "success" | "error"; message: string }>(() => {
        if (uploadSuccess) {
            return {
                type: "success",
                message: t("home.uploadSuccess")
            };
        } else if (uploadError) {
            return {
                type: "error",
                message: uploadError.message || t("home.uploadFailed")
            };
        } else {
            return null;
        }
    }, [uploadError, uploadSuccess]);

    const details = (
        <Space direction="vertical">
            <Tag color="blue">{file.type}</Tag>
            {imageSize ? (
                <Tag color="cyan">
                    {imageSize.width} × {imageSize.height}
                </Tag>
            ) : null}
            <Tag color="orange">{firendlySize}</Tag>
        </Space>
    );

    return (
        <Card className="image-card" bordered={false}>
            <Space direction="vertical" size={12}>
                <Space align="start">
                    <Spin
                        spinning={uploadProgress === 1}
                        delay={500}
                        indicator={<LoadingOutlined spin />}
                    >
                        <Image
                            referrerPolicy="no-referrer"
                            src={
                                src ??
                                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                            }
                            placeholder={src === null}
                        />
                    </Spin>

                    {windowSize.width > 500 && details}
                    <Space direction="vertical" align="start">
                        {windowSize.width <= 500 && (
                            <Popover content={details} trigger="click">
                                <Button>{t("home.fileInfo")}</Button>
                            </Popover>
                        )}
                        {uploading ? (
                            <Button onClick={onCancelUpload} type="primary">
                                {t("home.cancel")}
                            </Button>
                        ) : (
                            <Button onClick={onUpload} type="primary">
                                {url ? t("home.reupload") : t("home.upload")}
                            </Button>
                        )}
                        <Button onClick={onDelete} disabled={uploading} danger>
                            {t("home.delete")}
                        </Button>
                    </Space>
                </Space>
                {tip && <Alert message={tip.message} type={tip.type} closable />}
                {uploading && (
                    <Progress
                        strokeColor="#28C76F"
                        percent={parseInt(uploadProgress! * 100 + "")}
                        status="active"
                    />
                )}
                {!!url && <Result url={url} />}
            </Space>
        </Card>
    );
}

export default ImageCard;
