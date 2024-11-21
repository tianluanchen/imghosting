type FormatOption = "url" | "bbcode" | "markdown" | "markdownWithLink" | "html" | "htmlWithLink";
export type { FormatOption };
export default function formatUrl(url: string, opt: FormatOption) {
    switch (opt) {
        case "url":
            return url;
        case "bbcode":
            return `[img]${url}[/img]`;
        case "markdown":
            return `![image](${url})`;
        case "markdownWithLink":
            return `[![image](${url})](${url})`;
        case "html":
            return `<img src="${url}" alt="image" referrerPolicy="no-referrer" />`;
        case "htmlWithLink":
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" ><img src="${url}" alt="image" referrerPolicy="no-referrer" /></a>`;
    }
    return url;
}
