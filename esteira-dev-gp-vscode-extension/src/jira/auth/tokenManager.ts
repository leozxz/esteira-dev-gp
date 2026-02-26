import * as vscode from 'vscode';
import { AuthTokens } from '../models/types';
import { SECRET_KEYS } from '../utils/config';

export class TokenManager {
  constructor(private secrets: vscode.SecretStorage) {}

  async saveTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      this.secrets.store(SECRET_KEYS.accessToken, tokens.accessToken),
      this.secrets.store(SECRET_KEYS.refreshToken, tokens.refreshToken),
      this.secrets.store(SECRET_KEYS.expiresAt, String(tokens.expiresAt)),
      this.secrets.store(SECRET_KEYS.cloudId, tokens.cloudId),
      tokens.userEmail
        ? this.secrets.store(SECRET_KEYS.userEmail, tokens.userEmail)
        : Promise.resolve(),
    ]);
  }

  async getTokens(): Promise<AuthTokens | null> {
    const accessToken = await this.secrets.get(SECRET_KEYS.accessToken);
    const refreshToken = await this.secrets.get(SECRET_KEYS.refreshToken);
    const expiresAt = await this.secrets.get(SECRET_KEYS.expiresAt);
    const cloudId = await this.secrets.get(SECRET_KEYS.cloudId);

    if (!accessToken || !refreshToken || !expiresAt || !cloudId) {
      return null;
    }

    const userEmail = await this.secrets.get(SECRET_KEYS.userEmail);

    return {
      accessToken,
      refreshToken,
      expiresAt: Number(expiresAt),
      cloudId,
      userEmail: userEmail ?? undefined,
    };
  }

  async clearTokens(): Promise<void> {
    await Promise.all(
      Object.values(SECRET_KEYS).map((key) => this.secrets.delete(key))
    );
  }

  async isTokenExpired(): Promise<boolean> {
    const expiresAt = await this.secrets.get(SECRET_KEYS.expiresAt);
    if (!expiresAt) {
      return true;
    }
    // Refresh 60 seconds before expiry
    return Date.now() >= Number(expiresAt) - 60_000;
  }
}
