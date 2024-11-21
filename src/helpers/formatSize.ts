/**
 *
 * @param size
 * @param separator Separating numbers and units
 * @returns
 */
export default function formatSize(size: number, separator = " ") {
    // Trimming excess decimal places
    const removePointZero = (str: string) => str.replace(/\.0+$/, "");
    if (size < 1024) {
        return `${size}${separator}B`;
    } else if (size < 1024 * 1024) {
        return `${removePointZero((size / 1024).toFixed(1))}${separator}KB`;
    } else {
        return `${removePointZero((size / (1024 * 1024)).toFixed(1))}${separator}MB`;
    }
}
