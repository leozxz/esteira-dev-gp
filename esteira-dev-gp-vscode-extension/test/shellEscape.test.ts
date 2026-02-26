import { describe, it, expect, vi, afterEach } from 'vitest';
import { escapePathForShell } from '../src/utils/shellEscape';

describe('escapePathForShell', () => {
    const originalPlatform = process.platform;

    afterEach(() => {
        Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    describe('on macOS/Linux', () => {
        it('should wrap simple path in single quotes', () => {
            Object.defineProperty(process, 'platform', { value: 'darwin' });
            expect(escapePathForShell('/usr/local/bin')).toBe("'/usr/local/bin'");
        });

        it('should escape paths with spaces', () => {
            Object.defineProperty(process, 'platform', { value: 'linux' });
            expect(escapePathForShell('/home/user/my folder')).toBe("'/home/user/my folder'");
        });

        it('should escape single quotes in path', () => {
            Object.defineProperty(process, 'platform', { value: 'darwin' });
            // Input: /home/user/it's here
            // Output: '/home/user/it'\''s here' (closes quote, escaped quote, reopens quote)
            expect(escapePathForShell("/home/user/it's here")).toBe("'/home/user/it'\\''s here'");
        });

        it('should handle paths with dollar signs safely', () => {
            Object.defineProperty(process, 'platform', { value: 'darwin' });
            const result = escapePathForShell('/home/$USER/file');
            expect(result).toBe("'/home/$USER/file'");
            // Single quotes prevent $ expansion
        });

        it('should handle paths with semicolons safely', () => {
            Object.defineProperty(process, 'platform', { value: 'darwin' });
            const result = escapePathForShell('/home/user; rm -rf /');
            expect(result).toBe("'/home/user; rm -rf /'");
        });

        it('should handle paths with backticks safely', () => {
            Object.defineProperty(process, 'platform', { value: 'darwin' });
            const result = escapePathForShell('/home/user/`whoami`');
            expect(result).toBe("'/home/user/`whoami`'");
        });
    });

    describe('on Windows', () => {
        it('should wrap simple path in double quotes', () => {
            Object.defineProperty(process, 'platform', { value: 'win32' });
            expect(escapePathForShell('C:\\Users\\file.txt')).toBe('"C:\\Users\\file.txt"');
        });

        it('should escape backticks on Windows', () => {
            Object.defineProperty(process, 'platform', { value: 'win32' });
            const input = 'C:\\Users\\`test`';
            const result = escapePathForShell(input);
            expect(result.startsWith('"')).toBe(true);
            expect(result.endsWith('"')).toBe(true);
            // Every backtick should be preceded by a backslash
            const inner = result.slice(1, -1);
            for (let i = 0; i < inner.length; i++) {
                if (inner[i] === '`') {
                    expect(inner[i - 1]).toBe('\\');
                }
            }
        });

        it('should escape dollar signs on Windows', () => {
            Object.defineProperty(process, 'platform', { value: 'win32' });
            expect(escapePathForShell('C:\\Users\\$var')).toBe('"C:\\Users\\\\$var"');
        });
    });
});
