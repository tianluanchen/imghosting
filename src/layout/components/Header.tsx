import { Dropdown, Popconfirm, Space, Switch, Button, Layout, theme as antdTheme } from "antd";
import {
    TranslationOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ClearOutlined,
    GithubOutlined
} from "@ant-design/icons";
import useThemeStore from "@/stores/theme";
import useAuthStore from "@/stores/auth";
import useWindowSize from "@/hooks/useWindowSize";
import useGlobalMessage from "@/hooks/useGlobalMessage";
import useApiStore from "@/stores/api";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { lngs } from "@/i18n";
export default function Header({
    collapsed,
    setCollapsed
}: {
    collapsed: boolean;
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const token = antdTheme.useToken().token;
    const themeStore = useThemeStore();
    const clearAuthKey = useAuthStore((state) => state.clear);
    const api = useApiStore((state) => state.getApi());
    const message = useGlobalMessage();
    const windowSize = useWindowSize();
    const { t, i18n } = useTranslation();
    const items = useMemo(() => {
        return lngs.filter((e) => e.key !== i18n.resolvedLanguage);
    }, [i18n.resolvedLanguage]);
    return (
        <Layout.Header
            className="header"
            style={{
                background: token.colorBgContainer
            }}
        >
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    fontSize: "16px",
                    width: 64,
                    height: 64,
                    visibility: windowSize.width > 600 ? "visible" : "hidden"
                }}
            />
            <Space size={12} style={{ lineHeight: "initial" }}>
                {api.handleAuthKey && (
                    <Popconfirm
                        title={t("layout.ensureResetAuthKey")}
                        onConfirm={() => {
                            message.success(t("layout.resetKeySuccess"));
                            clearAuthKey(api.name);
                        }}
                    >
                        <Button icon={<ClearOutlined />} type="text">
                            {t("layout.resetKey")}
                        </Button>
                    </Popconfirm>
                )}
                <Dropdown
                    menu={{
                        items,
                        onClick: ({ key }) => {
                            i18n.changeLanguage(key);
                        }
                    }}
                >
                    <Space style={{ cursor: "pointer" }} size={4}>
                        <TranslationOutlined />
                        <span style={{ whiteSpace: "nowrap" }}>
                            {lngs.find((e) => e.key === i18n.resolvedLanguage)!.label}
                        </span>
                    </Space>
                </Dropdown>

                <Switch
                    title={t("layout.themeToggle")}
                    checkedChildren="🌙"
                    unCheckedChildren="☀️"
                    checked={themeStore.isDark()}
                    onChange={() => {
                        themeStore.toggle();
                    }}
                />
                <Button
                    title="GitHub"
                    target="_blank"
                    href="https://github.com/tianluanchen/imghosting"
                    icon={<GithubOutlined style={{ fontSize: "20px" }} />}
                    type="link"
                ></Button>
            </Space>
        </Layout.Header>
    );
}
