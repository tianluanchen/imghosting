export default function isAcceptdFile(file: File, accept: string) {
    const mime = file.type;
    const name = file.name;
    const slices = accept
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e !== "");
    const [category] = mime.split("/");
    for (const s of slices) {
        if (s.indexOf("/") > -1) {
            if (/^.+\/\*$/.test(s) && s.slice(0, s.indexOf("/")) === category) {
                return true;
            } else if (s === mime) {
                return true;
            }
        } else if (name.endsWith(s)) {
            return true;
        }
    }
    return false;
}
