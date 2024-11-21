import { useEffect, useState } from "react";
import { Typography, Space, Tag, Spin, Button } from "antd";
import formatSize from "@/helpers/formatSize";
import { WarningOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
const { Text } = Typography;

type Info = {
    width: number;
    height: number;
    size?: number;
    type?: string;
};

export default function ImageInfo({ url }: { url: string }) {
    const [info, setInfo] = useState<Info | null>(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    // state used to implement retry funtion
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        setLoading(true);
        const info: Info = {} as any;
        const el = new Image();
        const signalCtr = new AbortController();
        fetch(url, { method: "HEAD", signal: signalCtr.signal })
            .then((resp) => {
                if (resp.status !== 200) {
                    return;
                }
                const size = parseInt(resp.headers.get("Content-Length") || "NaN");
                if (!isNaN(size)) {
                    info.size = size;
                }
                const type = resp.headers.get("Content-Type");
                if (type) {
                    info.type = type;
                }
            })
            .catch(() => {})
            .finally(() => {
                el.onload = () => {
                    info.height = el.naturalHeight;
                    info.width = el.naturalWidth;
                    setInfo(info);
                    setLoading(false);
                };
                el.onerror = () => {
                    setInfo(null);
                    setLoading(false);
                };
                el.src = url;
            });
        return () => {
            el.onload = el.onerror = null;
            signalCtr.abort();
        };
        // watch extra `retry` state
    }, [url, retry]);
    if (loading) {
        return <Spin />;
    }
    if (info) {
        return (
            <Space direction="vertical">
                {info.type && <Tag color="blue">{info.type}</Tag>}
                <Tag color="cyan">
                    {info.width} × {info.height}
                </Tag>
                {info.size && <Tag color="orange">{formatSize(info.size)}</Tag>}
            </Space>
        );
    }

    return (
        <Space direction="vertical" size={8}>
            <Text type="warning">
                <WarningOutlined />
                &nbsp;{t("history.getInfoFailed")}
            </Text>
            <Button
                onClick={() => {
                    setRetry(Date.now());
                }}
                size="small"
                type="default"
            >
                {t("history.retry")}
            </Button>
        </Space>
    );
}
