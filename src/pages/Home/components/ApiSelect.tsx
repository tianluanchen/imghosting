import apis from "@/apis";
import { LockOutlined } from "@ant-design/icons";
import useApiStore from "@/stores/api";
import { Segmented, Tooltip } from "antd";
import { useEffect } from "react";
import { t } from "i18next";

export default function ApiSelect() {
    const apiStore = useApiStore();
    useEffect(() => {
        document.querySelector(".apis .ant-segmented-item-selected")?.scrollIntoView({
            behavior: "smooth"
        });
    }, [apiStore.current]);
    return (
        <Segmented
            className="apis"
            value={apiStore.current}
            onChange={(e) => apiStore.setApi(e as string)}
            size="large"
            options={[
                ...apis.map((e) => {
                    return {
                        label: (
                            <span className={apiStore.current === e.name ? "selected" : undefined}>
                                {e.title}
                            </span>
                        ),
                        value: e.name,
                        icon: e.useAuthKey ? (
                            <Tooltip title={t("home.authKeyTip")}>
                                <LockOutlined />
                            </Tooltip>
                        ) : undefined
                    };
                })
            ]}
        />
    );
}
