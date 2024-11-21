import { useMemo, useState } from "react";
import ImageInfo from "./components/ImageInfo";
import {
    Dropdown,
    Popconfirm,
    QRCode,
    Popover,
    Space,
    Button,
    Tooltip,
    Table,
    Typography,
    Image
} from "antd";
import { DownOutlined, QrcodeOutlined, CopyOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import "./index.scss";
import useGlobalMessage from "@/hooks/useGlobalMessage";
import copyText from "@/helpers/copyText";
import useWindowSize from "@/hooks/useWindowSize";
import useHistoryStore from "@/stores/history";
import apis from "@/apis";
import formatUrl from "@/helpers/formatUrl";
import { useTranslation } from "react-i18next";
const { Link } = Typography;
interface DataType {
    order: number;
    key: string;
    url: string;
    apiName: string;
    uploadDate: number;
}

export default function UploadHistroy() {
    const { t } = useTranslation();

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const message = useGlobalMessage();
    const historyStore = useHistoryStore();
    const data: DataType[] = useMemo(() => {
        return historyStore.history.map((e, i) => {
            return {
                ...e,
                order: i,
                key: e.url
            };
        });
    }, [historyStore.history]);
    const windowSize = useWindowSize();

    const columns: ColumnsType<DataType> = [
        {
            title: t("history.order"),
            dataIndex: "order",
            align: "center",
            width: "70px",
            render: (_, record) => {
                return <span>{record.order + 1}</span>;
            }
        },
        {
            title: t("history.picture"),
            align: "center",
            key: "image",
            width: "160px",
            dataIndex: "url",
            render: (url: string) => {
                return <Image referrerPolicy="no-referrer" src={url}></Image>;
            }
        },
        {
            title: t("history.link"),
            align: "center",
            key: "link",
            dataIndex: "url",
            render: (url: string) => {
                return (
                    <Tooltip title={url}>
                        <Link ellipsis href={url} target="_blank">
                            {url}
                        </Link>
                    </Tooltip>
                );
            }
        },
        {
            title: t("history.apiName"),
            width: windowSize.width < 1080 ? 120 : undefined,
            key: "apiName",
            align: "center",
            dataIndex: "apiName",
            filters: [...apis.map((e) => ({ text: e.title, value: e.name }))],
            onFilter: (value, record) => record.apiName === value,
            render(value: string) {
                return apis.find((e) => e.name === value)?.title || value;
            }
        },
        {
            title: t("history.uploadDate"),
            width: windowSize.width < 1080 ? 180 : undefined,
            key: "uploadDate",
            align: "center",
            dataIndex: "uploadDate",
            defaultSortOrder: "descend",
            sorter: (a, b) => a.uploadDate - b.uploadDate,
            render(value: number) {
                return new Date(value).toLocaleString();
            }
        },
        {
            title: t("history.fileInfo"),
            width: windowSize.width < 1080 ? 120 : undefined,
            key: "info",
            align: "center",
            dataIndex: "url",
            render(url: string) {
                return <ImageInfo url={url}></ImageInfo>;
            }
        },
        {
            title: t("history.action"),
            key: "action",
            width: windowSize.width < 600 ? 140 : undefined,
            render: (_, record) => {
                const items = [
                    {
                        key: "url",
                        label: "URL"
                    },
                    {
                        key: "bbcode",
                        label: "BBCode"
                    },
                    {
                        key: "markdown",
                        label: "Markdown"
                    },
                    {
                        key: "markdownWithLink",
                        label: "Marddown With Link"
                    },
                    {
                        key: "html",
                        label: "HTML"
                    },
                    {
                        key: "htmlWithLink",
                        label: "HTML With Link"
                    }
                ];
                return (
                    <Space size={"small"} wrap>
                        <Dropdown
                            trigger={["click"]}
                            menu={{
                                onClick: ({ key }) => {
                                    copyText(formatUrl(record.url, key as any));
                                    message.success(
                                        t("history.copySuccess", {
                                            format: items.find((e) => e.key === key)?.label || key
                                        })
                                    );
                                },
                                items
                            }}
                        >
                            <Button type="primary" icon={<CopyOutlined />}>
                                {t("history.copy")} <DownOutlined />
                            </Button>
                        </Dropdown>
                        <Popover
                            trigger="click"
                            overlayInnerStyle={{ padding: 0 }}
                            content={<QRCode value={record.url} bordered={false} />}
                        >
                            <Button type="dashed" icon={<QrcodeOutlined />}>
                                {t("history.qrCode")}
                            </Button>
                        </Popover>
                        <Button
                            onClick={() => {
                                historyStore.delete(record.url);
                                message.success(t("history.deleteSuccess"));
                            }}
                            icon={<DeleteOutlined />}
                            danger
                        >
                            {t("history.delete")}
                        </Button>
                    </Space>
                );
            }
        }
    ];

    function handleDeleteSelected() {
        historyStore.delete(...selectedKeys);
        message.success(t("history.deleteSelectedSuccess"));
        setSelectedKeys([]);
    }
    function handleDeleteAll() {
        historyStore.deleteAll();
        message.success(t("history.clearHistorySuccess"));
        setSelectedKeys([]);
    }
    return (
        <>
            <Space style={{ marginBottom: 12 }}>
                <Popconfirm
                    title={t("history.sureClearHistory")}
                    onConfirm={handleDeleteAll}
                    disabled={historyStore.history.length <= 0}
                >
                    <Button disabled={historyStore.history.length <= 0} type="primary" danger>
                        {t("history.clear")}
                    </Button>
                </Popconfirm>
                <Button onClick={handleDeleteSelected} disabled={selectedKeys.length <= 0} danger>
                    {t("history.deleteSelected", {
                        countTip: selectedKeys.length > 0 ? `(${selectedKeys.length})` : ""
                    })}
                </Button>
            </Space>
            <Table
                className="table"
                rowSelection={{
                    type: "checkbox",
                    fixed: true,
                    onChange: (selectedRowKeys) => {
                        setSelectedKeys(selectedRowKeys as string[]);
                    },
                    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
                }}
                scroll={{ x: 980 }}
                bordered
                columns={columns}
                pagination={{
                    pageSizeOptions: [6, 10, 20],
                    defaultPageSize: 6,
                    showSizeChanger: true,
                    showTotal: (total) =>
                        t("history.totalReocrds", {
                            total: total
                        }),
                    position: ["bottomRight"]
                }}
                dataSource={data}
            />
        </>
    );
}
