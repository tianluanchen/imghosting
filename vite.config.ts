import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    plugins: [react()],
    server: {
        proxy: {
            "/api": {
                changeOrigin: true,
                // target: "https://img.imayouth.repl.co/"
                target: "http://127.0.0.1:8080/"
            }
        }
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    },
    build: {
        outDir: path.join(__dirname, "./dist"),
        emptyOutDir: true,
        rollupOptions: {
            output: {
                sanitizeFileName(name) {
                    // 此处重写方法防止go语言无法导入_开头的文件
                    const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g;
                    const DRIVE_LETTER_REGEX = /^[a-z]:/i;
                    const match = DRIVE_LETTER_REGEX.exec(name);
                    const driveLetter = match ? match[0] : "";
                    const nameWithoutDriveLetter = name
                        .slice(driveLetter.length)
                        .replace(INVALID_CHAR_REGEX, "_");
                    const validName = nameWithoutDriveLetter.startsWith("_")
                        ? nameWithoutDriveLetter.slice(1)
                        : nameWithoutDriveLetter;
                    return driveLetter + validName;
                }
            }
        }
    }
});
