import useAuthStore from "@/stores/auth";
import { Button, Modal, Input } from "antd";
import { useEffect, useMemo, useState } from "react";
import { KeyOutlined } from "@ant-design/icons";
import useApiStore from "@/stores/api";
import { useTranslation } from "react-i18next";
export default function MustAuth() {
    const api = useApiStore((state) => state.getApi());
    const setAuthKey = useAuthStore((state) => state.setAuthKey);
    const authKey = useAuthStore((state) => state.getAuthKey(api.name) ?? "");
    const open = useMemo(() => {
        return authKey === "" && api.handleAuthKey !== undefined;
    }, [authKey, api.handleAuthKey]);

    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (!open) {
            setInputValue("");
        }
    }, [open]);
    const [handlingKey, setHandlingKey] = useState(false);
    const onSet = async () => {
        const value = inputValue.trim();
        if (value.length > 0) {
            setHandlingKey(true);
            setAuthKey(
                api.name,
                api.handleAuthKey ? await Promise.resolve(api.handleAuthKey(value)) : value
            );
            setHandlingKey(false);
        }
    };
    const { t } = useTranslation();
    return (
        <Modal
            afterOpenChange={(v) => {
                if (v) {
                    document.querySelector<HTMLInputElement>("input#authKey")?.focus();
                }
            }}
            width={"300px"}
            maskClosable={false}
            title={t("home.pleaseInputAuthKey", { api: api.title })}
            centered
            closeIcon={false}
            open={open}
            footer={[
                <Button
                    loading={handlingKey}
                    key="ensure"
                    type="primary"
                    onClick={onSet}
                    disabled={inputValue.length <= 0}
                >
                    {t("home.ensure")}
                </Button>
            ]}
        >
            <Input.Password
                id="authKey"
                disabled={handlingKey}
                onPressEnter={onSet}
                autoFocus={false}
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value.trim());
                }}
                style={{ margin: "8px 0" }}
                placeholder={t("home.inputHere")}
                prefix={<KeyOutlined />}
            />
        </Modal>
    );
}
