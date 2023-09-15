import http from "http";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sha256 } from "js-sha256";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isMD5Hash = (s) => /^[a-z0-9]{32}$/.test(s);
const existFile = (p) => {
    try {
        return fs.statSync(p).isFile();
    } catch {
        return false;
    }
};
// authKey
const keyHash = sha256("example");

http.createServer((req, res) => {
    console.log(`${new Date().toLocaleString()}   ${req.method}  ${req.url}`);
    res.setHeader("access-control-allow-methods", "GET, OPTIONS, HEAD, PUT");
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-Headers", "auth");
    if (req.method === "OPTIONS") {
        res.end();
        return;
    }
    const url = new URL(req.url, "http://127.0.0.1:3000");
    const p = url.pathname.slice(1);
    if (isMD5Hash(p) && existFile(path.join(__dirname, url.pathname))) {
        const stream = fs.createReadStream(path.join(__dirname, p));
        stream.on("error", (err) => {
            !res.headersSent && res.writeHead(500);
            res.end("Some error occurred " + err);
        });
        stream.pipe(res);
        return;
    }
    if (url.pathname !== "/upload" || req.method !== "PUT") {
        res.writeHead(404);
        res.end("404 Not Found");
        return;
    }
    const md5Hash = url.searchParams.get("md5Hash")?.toLowerCase();
    if (!isMD5Hash(md5Hash)) {
        res.writeHead(400);
        res.end("md5Hash is invalid");
        return;
    }
    if (req.headers["auth"] !== keyHash) {
        res.writeHead(401);
        res.end("Unauthorized");
        return;
    }
    const stream = fs.createWriteStream(path.join(__dirname, md5Hash), {
        autoClose: true
    });
    stream.on("error", (err) => {
        !res.headersSent && res.writeHead(500);
        res.end("Some error occurred " + err);
    });
    stream.on("finish", () => {
        res.writeHead(200);
        res.end(new URL("/" + md5Hash, url.origin).href);
    });
    req.pipe(stream);
}).listen(3000, "127.0.0.1", () => {
    console.log("example server is running at http://127.0.0.1:3000");
});
