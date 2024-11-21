import { createContext } from "react";

import { message } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

export const MessageContext = createContext<MessageInstance>(null as any);

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const [messageApi, contextHolder] = message.useMessage();
    return (
        <MessageContext.Provider value={messageApi}>
            {contextHolder}
            {children}
        </MessageContext.Provider>
    );
}
