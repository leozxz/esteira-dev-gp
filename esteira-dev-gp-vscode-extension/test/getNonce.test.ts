import { describe, it, expect } from 'vitest';
import { getNonce } from '../src/utils/getNonce';

describe('getNonce', () => {
    it('should return a string', () => {
        const nonce = getNonce();
        expect(typeof nonce).toBe('string');
    });

    it('should return a non-empty string', () => {
        const nonce = getNonce();
        expect(nonce.length).toBeGreaterThan(0);
    });

    it('should return base64url-safe characters only', () => {
        const nonce = getNonce();
        // base64url uses A-Z, a-z, 0-9, -, _
        expect(nonce).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should return a string of consistent length', () => {
        // 16 bytes => 22 base64url chars (no padding)
        const nonce = getNonce();
        expect(nonce.length).toBe(22);
    });

    it('should generate unique values on consecutive calls', () => {
        const nonces = new Set<string>();
        for (let i = 0; i < 100; i++) {
            nonces.add(getNonce());
        }
        expect(nonces.size).toBe(100);
    });
});
