import SparkMD5 from "spark-md5";
import { sha256 } from "js-sha256";
export function calculateSHA256(s: string) {
    return sha256(s);
}

export function calculateFileMD5(file: File) {
    return new Promise<string>((resolve) => {
        const md5 = new SparkMD5.ArrayBuffer();
        const chunkSize = 1024 * 1024; // 每个块的大小为1MB
        let offset = 0;
        readChunk();
        function readChunk() {
            const chunk = file.slice(offset, offset + chunkSize);
            const chunkReader = new FileReader();
            chunkReader.onload = function (e) {
                md5.append(e.target!.result as any);

                if (offset + chunkSize >= file.size) {
                    resolve(md5.end());
                } else {
                    offset += chunkSize;
                    readChunk();
                }
            };
            chunkReader.readAsArrayBuffer(chunk);
        }
    });
}
