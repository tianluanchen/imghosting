import { useContext } from "react";
import { MessageContext } from "@/stores/MessageContext";
/** return global message instance  */
export default function useGlobalMessage() {
    return useContext(MessageContext);
}
