import { Popover, Card, Alert, Button, Tag, Image, Space, Progress, Spin } from "antd";
import { calculateFileMD5 } from "@/helpers/hash";
import http from "@/helpers/http";
import {
    type Ref,
    forwardRef,
    useImperativeHandle,
    useEffect,
    useState,
    useRef,
    useMemo
} from "react";
import { LoadingOutlined } from "@ant-design/icons";
import useAuthStore from "@/stores/auth";
import useGlobalMessage from "@/hooks/useGlobalMessage";
import useWindowSize from "@/hooks/useWindowSize";
import formatSize from "@/helpers/formatSize";
import { upload } from "@/helpers/buildApi";
import useApiStore from "@/stores/api";
import Result from "./Result";
import { useTranslation } from "react-i18next";
export function ImageCard(
    {
        file,
        onDelete,
        onUploadFailed,
        onUploadSuccess
    }: {
        file: { value: File; id: number };
        onDelete: (...args: any[]) => void;
        onUploadFailed?: (error: Error, apiName: string) => void;
        onUploadSuccess?: (url: string, apiName: string) => void;
    },
    ref: Ref<{
        upload: () => any;
        cancelUpload: () => any;
    }>
) {
    const firendlySize = useMemo(() => formatSize(file.value.size), [file.value]);

    // response  from cloud storage
    const [url, setUrl] = useState<string | null>(null);
    // image src
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        if (url !== null) {
            setSrc(url);
            return;
        }
        const objectUrl = URL.createObjectURL(file.value);
        setSrc(objectUrl);
        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file.value, url]);

    const [imageSize, setImageSize] = useState<null | { width: number; height: number }>(null);

    useEffect(() => {
        if (src === null) {
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

    const message = useGlobalMessage();

    const signalCtrRef = useRef<AbortController | null>(null);
    // abort when unmounted
    useEffect(() => {
        return () => {
            signalCtrRef.current?.abort();
        };
    }, []);

    const apiStore = useApiStore();

    const authKey = useAuthStore((state) => state.getAuthKey(apiStore.current)) ?? undefined;

    const clearAuthKey = useAuthStore((state) => state.clear);

    const [md5Hash, setMD5Hash] = useState("");

    // compute md5 hash
    useEffect(() => {
        let ignore = false;
        calculateFileMD5(file.value).then((hash) => {
            if (!ignore) {
                setMD5Hash(hash);
            }
        });
        return () => {
            ignore = true;
        };
    }, [file.value]);

    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const uploading = useMemo(() => uploadProgress !== null, [uploadProgress]);

    const [tip, setTip] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const { t } = useTranslation();

    const handleUpload = async () => {
        signalCtrRef.current?.abort();
        signalCtrRef.current = new AbortController();
        setTip(null);
        setUploadProgress(0);
        try {
            const api = apiStore.getApi();
            const result = await upload(api, {
                file: file.value,
                signal: signalCtrRef.current.signal,
                md5Hash,
                authKey: api.handleAuthKey ? authKey : undefined,
                onUploadProgress(ratio) {
                    setUploadProgress(ratio);
                }
            });
            if (result.unauthorized) {
                clearAuthKey(api.name);
            }
            if (!result.success) {
                throw new Error(result.message || t("home.uploadFailed"));
            }
            setUrl(result.url);
            setTip({
                type: "success",
                message: t("home.uploadSuccess")
            });
            message.success(t("home.uploadSuccess"));
            onUploadSuccess?.(result.url, apiStore.current);
        } catch (error) {
            const err = error as Error;
            if (!http.isAbortError(err)) {
                setTip({
                    type: "error",
                    message: err.message
                });
                message.error(err.message);
                onUploadFailed?.(err, apiStore.current);
            }
        }
        setUploadProgress(null);
    };

    function handleCancelUpload() {
        if (uploading) {
            signalCtrRef.current?.abort();
            message.warning(t("home.cancelUpload"));
            return true;
        }
        return false;
    }

    // expose methods
    useImperativeHandle(
        ref,
        () => ({
            // if exist url then ignore
            upload: () => url === null && !uploading && handleUpload(),
            cancelUpload: handleCancelUpload
        }),
        [url, authKey, md5Hash, uploading]
    );

    const windowSize = useWindowSize();

    const details = (
        <Space direction="vertical">
            <Tag color="blue">{file.value.type}</Tag>
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
                            <Button onClick={handleCancelUpload} type="primary">
                                {t("home.cancel")}
                            </Button>
                        ) : (
                            <Button onClick={handleUpload} type="primary">
                                {url !== null ? t("home.reupload") : t("home.upload")}
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
                {url !== null && <Result url={url} />}
            </Space>
        </Card>
    );
}

const ImageCardWithExport = forwardRef(ImageCard);
export default ImageCardWithExport;
