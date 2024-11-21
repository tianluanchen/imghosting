import { Row, Col, Upload, Space, Alert } from "antd";
import { useEffect, useReducer } from "react";
import { UploadOutlined } from "@ant-design/icons";
import MustAuth from "./components/MustAuth";
import CurrentFileList from "./components/__CurrentFileList";
import "./index.scss";
import useGlobalMessage from "@/hooks/useGlobalMessage";
import ApiSelect from "./components/ApiSelect";
import useApiStore from "@/stores/api";
import formatSize from "@/helpers/formatSize";
import { useTranslation } from "react-i18next";
import isAcceptdFile from "@/helpers/accept";
const { Dragger } = Upload;
type Actions =
    | {
          type: "added";
          files: File[];
      }
    | {
          type: "deleted";
          ids: number[];
      }
    | { type: "deletedAll" };

let id = 0;

const currentFilesReducer = (files: { value: File; id: number }[], action: Actions) => {
    switch (action.type) {
        case "added":
            return [...files, ...action.files.map((e) => ({ value: e, id: ++id }))];
        case "deleted":
            return files.filter((f) => action.ids.includes(f.id) === false);
        case "deletedAll":
            return [];
        default: {
            throw Error("unknown action:" + action);
        }
    }
};

export default function Home() {
    const [files, dispatch] = useReducer(currentFilesReducer, []);

    const message = useGlobalMessage();
    const api = useApiStore((store) => store.getApi());
    const { t } = useTranslation();
    const addFile = (file: File) => {
        if (file.size > (api.maxSize || Infinity)) {
            message.warning(
                t("home.limitFileSize", { api: api.title, size: formatSize(api.maxSize!, "") })
            );
            return;
        }
        if (!isAcceptdFile(file, api.accept ?? "image/*")) {
            message.warning(
                t("home.limitFileType", { api: api.title, accept: api.accept ?? "image/*" })
            );
            return;
        }
        dispatch({
            type: "added",
            files: [file]
        });
    };

    const onBeforeUpload = (file: File) => {
        addFile(file);
        return false;
    };
    useEffect(() => {
        const onPaste = (evt: ClipboardEvent) => {
            const items = evt.clipboardData?.items;
            if (!items) {
                return;
            }
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === "file") {
                    const file = item.getAsFile()!;
                    addFile(file);
                }
                // console.log(item.kind, item.type)
            }
        };
        document.addEventListener("paste", onPaste);
        return () => {
            document.removeEventListener("paste", onPaste);
        };
    }, []);
    const description = (
        <>
            {api.handleAuthKey ? <>{t("home.authKeyTip")},&nbsp;</> : ""}
            {api.maxSize ? (
                <>{t("home.maxFileSizeTip", { size: formatSize(api.maxSize, "") })},&nbsp;</>
            ) : (
                ""
            )}
            {t("home.acceptFileTypeTip", { type: api.accept || "image/*" })}
        </>
    );
    return (
        <>
            <ApiSelect />
            <Row
                gutter={[
                    { lg: 64, md: 32, sm: 16, xs: 16 },
                    { md: 32, sm: 16, xs: 16 }
                ]}
            >
                <Col lg={12} xs={24}>
                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        <Dragger
                            multiple
                            fileList={[]}
                            accept={api.accept || "image/*"}
                            height={360}
                            style={{ maxHeight: "45vh" }}
                            beforeUpload={onBeforeUpload}
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">{t("home.dragHere")}</p>
                            <p className="ant-upload-hint">{t("home.supportMultipleImages")}</p>
                        </Dragger>
                        <Alert
                            message={t("home.apiTip")}
                            description={description}
                            type="info"
                            showIcon
                        />
                    </Space>
                </Col>
                <Col lg={12} xs={24}>
                    <CurrentFileList files={files} dispatch={dispatch} />
                </Col>
            </Row>
            <MustAuth />
        </>
    );
}
