import { Space, Select, Popover, QRCode, Button, Input } from "antd";
import { QrcodeOutlined, CopyOutlined, PaperClipOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import copyText from "@/helpers/copyText";
import useGlobalMessage from "@/hooks/useGlobalMessage";
import type { FormatOption } from "@/helpers/formatUrl";
import formatUrl from "@/helpers/formatUrl";
import { useTranslation } from "react-i18next";
export default function Result({ url }: { url: string }) {
    const message = useGlobalMessage();
    const [format, setFormat] = useState<FormatOption>("url");
    const inputValue = useMemo(() => {
        return formatUrl(url, format);
    }, [url, format]);
    const { t } = useTranslation();
    const options = [
        {
            value: "url",
            label: "URL"
        },
        {
            value: "markdown",
            label: "Markdown"
        },
        {
            value: "markdownWithLink",
            label: "Markdown With Link"
        },
        {
            value: "bbcode",
            label: "BBCode"
        },
        {
            value: "html",
            label: "HTML"
        },
        {
            value: "htmlWithLink",
            label: "HTML With Link"
        }
    ];
    function handleCopy() {
        copyText(inputValue ?? "");
        message.success(
            t("home.copySuccess", { format: options.find((o) => o.value === format)?.label || "" })
        );
    }
    return (
        <Space direction="vertical" size="small">
            <Space.Compact style={{ width: "100%", flexWrap: "wrap" }}>
                <Popover
                    overlayInnerStyle={{ padding: 0 }}
                    content={<QRCode value={url} bordered={false} />}
                >
                    <Button title={t("home.qrCode")} icon={<QrcodeOutlined />}></Button>
                </Popover>
                <Button
                    title={t("home.link")}
                    icon={<PaperClipOutlined />}
                    href={url}
                    target="_blank"
                ></Button>
                <Select
                    popupMatchSelectWidth={180}
                    value={format}
                    onChange={(e) => setFormat(e)}
                    options={options}
                />

                <Input style={{ width: "fit-content" }} readOnly value={inputValue} />
                <Button onClick={handleCopy} type="primary" icon={<CopyOutlined />}>
                    {t("home.copy")}
                </Button>
            </Space.Compact>
        </Space>
    );
}
