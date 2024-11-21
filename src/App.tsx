import { RouterProvider } from "react-router-dom";
import router from "@/router";
import { StyleProvider, legacyLogicalPropertiesTransformer } from "@ant-design/cssinjs";
import { ConfigProvider, theme as antdTheme } from "antd";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
import { MessageProvider } from "./stores/MessageContext";
import { useEffect } from "react";
import useThemeStore from "./stores/theme";
import { useTranslation } from "react-i18next";

// run one time
const supportsAdvancedFeatures = (() => {
    const style = document.createElement("style");
    style.innerHTML = ":where(div){}";
    document.head.appendChild(style);
    const result = style?.sheet?.cssRules.length === 1;
    style.remove();
    return result;
})();

export default function App() {
    // fetch everything beacuse theme value need to be listened not functions
    const themeStore = useThemeStore();
    useEffect(() => {
        const toggleClass = (dark: boolean) => {
            dark
                ? document.documentElement.classList.add("dark")
                : document.documentElement.classList.remove("dark");
        };
        toggleClass(themeStore.isDark());
        return useThemeStore.subscribe(({ isDark }) => {
            toggleClass(isDark());
        });
    }, []);
    const { i18n } = useTranslation();

    return (
        // Compatible with old browsers
        <StyleProvider
            hashPriority={supportsAdvancedFeatures ? "low" : "high"}
            transformers={
                supportsAdvancedFeatures ? undefined : [legacyLogicalPropertiesTransformer]
            }
        >
            <ConfigProvider
                locale={i18n.resolvedLanguage == "zh" ? zhCN : enUS}
                theme={{
                    algorithm: themeStore.isDark()
                        ? antdTheme.darkAlgorithm
                        : antdTheme.defaultAlgorithm
                }}
            >
                <MessageProvider>
                    <RouterProvider router={router} />
                </MessageProvider>
            </ConfigProvider>
        </StyleProvider>
    );
}
