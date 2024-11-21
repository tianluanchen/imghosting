import NProgress from "nprogress";
import "@/assets/nprogress.scss";
NProgress.configure({
    showSpinner: true,
    minimum: 0.2, // 更改启动时使用的最小百分比
    parent: "body"
});

export default function useNprogress() {
    return {
        start: () => NProgress.start(),
        done: () => NProgress.done()
    };
}
