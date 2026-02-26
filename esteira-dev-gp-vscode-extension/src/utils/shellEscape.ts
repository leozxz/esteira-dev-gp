export function escapePathForShell(filePath: string): string {
    if (process.platform === 'win32') {
        // Windows: wrap in double quotes, escape backticks and dollar signs
        const escaped = filePath.replace(/[`$]/g, '\\$&');
        return `"${escaped}"`;
    }
    // macOS/Linux: wrap in single quotes, escape embedded single quotes
    const escaped = filePath.replace(/'/g, "'\\''");
    return `'${escaped}'`;
}
