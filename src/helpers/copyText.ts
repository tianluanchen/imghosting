const textarea = document.createElement("textarea");
textarea.setAttribute("style", "opacity:0;position:fixed;top:-100px;height:10px");
const anotherMethod = (text: string, cb: () => void) => {
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    cb();
};
export default function copyText(text: string) {
    return new Promise<void>((resolve) => {
        if (window.navigator.clipboard) {
            try {
                window.navigator.clipboard
                    .writeText(text)
                    .then(resolve)
                    .catch(() => {
                        anotherMethod(text, resolve);
                    });
            } catch {
                anotherMethod(text, resolve);
            }
        } else {
            anotherMethod(text, resolve);
        }
    });
}
