import { Outlet, useLocation } from "react-router-dom";
import { Menu, Layout } from "antd";
import { Suspense, useEffect, useState, useMemo } from "react";
import useNprogress from "@/hooks/useNprogress";
import { getMenuItems, walkItems } from "../config";
import Logo from "./components/Logo";
import Header from "./components/Header";
import useWindowSize from "@/hooks/useWindowSize";
import "./index.scss";
import { useTranslation } from "react-i18next";

const { Sider, Content } = Layout;

const NprogressElement = () => {
    const np = useNprogress();
    // run on mount
    np.start();
    useEffect(() => {
        return () => {
            // run on unmount
            np.done();
        };
    }, []);
    return null;
};

export default function Root() {
    const windowSize = useWindowSize();
    const [collapsed, setCollapsed] = useState(windowSize.width < 720);
    useEffect(() => {
        setCollapsed(windowSize.width < 720);
    }, [windowSize.width]);

    const { pathname } = useLocation();
    const { t, i18n } = useTranslation();
    useEffect(() => {
        try {
            walkItems((item) => {
                const toMatch = item.path || item.meta.key;
                if (toMatch === pathname) {
                    document.title = t(item.meta.title) + " | IMG HOSTING";
                    // jump out of recursion
                    throw "Found";
                }
            });
        } catch {}
    }, [pathname, i18n.resolvedLanguage]);
    useEffect(() => {
        document.documentElement.lang = i18n.resolvedLanguage ?? "en";
    }, [i18n.resolvedLanguage]);

    const menuItems = useMemo(() => {
        return getMenuItems((title) => t(title));
    }, [i18n.resolvedLanguage]);

    return (
        <Layout hasSider style={{ height: "100vh" }}>
            <Sider theme="dark" trigger={null} collapsible collapsed={collapsed}>
                <Logo hideTitle={collapsed} />
                <Menu mode="inline" theme="dark" selectedKeys={[pathname]} items={menuItems} />
            </Sider>
            <Layout>
                <Header collapsed={collapsed} setCollapsed={setCollapsed} />
                <Content
                    // force to trigger animation
                    key={pathname}
                    className="fade-in-enter"
                    style={{
                        padding: 18,
                        minHeight: 280,
                        margin: windowSize.width > 720 ? "24px 16px" : "",
                        overflowY: "auto",
                        // Because the margin value of the antd Row component is negative.
                        overflowX: "hidden"
                    }}
                >
                    <Suspense fallback={<NprogressElement />}>
                        <Outlet />
                    </Suspense>
                </Content>
            </Layout>
        </Layout>
    );
}
