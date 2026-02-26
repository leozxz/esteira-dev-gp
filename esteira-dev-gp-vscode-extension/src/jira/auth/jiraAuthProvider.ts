import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { TokenManager } from './tokenManager';
import { startCallbackServer } from './oauthCallbackServer';
import { AccessibleResource, AuthTokens } from '../models/types';
import {
  ATLASSIAN_AUTH_URL,
  getClientId,
  getClientSecret,
  ATLASSIAN_RESOURCES_URL,
  ATLASSIAN_TOKEN_URL,
  getRedirectUri,
  OAUTH_SCOPES,
} from '../utils/config';

export class JiraAuthProvider {
  private _onDidLogin = new vscode.EventEmitter<AuthTokens>();
  readonly onDidLogin = this._onDidLogin.event;

  private _onDidLogout = new vscode.EventEmitter<void>();
  readonly onDidLogout = this._onDidLogout.event;

  constructor(private tokenManager: TokenManager) {}

  async login(): Promise<AuthTokens> {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);
    const state = crypto.randomBytes(16).toString('hex');

    // Build authorization URL
    const authUrl = new URL(ATLASSIAN_AUTH_URL);
    authUrl.searchParams.set('audience', 'api.atlassian.com');
    authUrl.searchParams.set('client_id', getClientId());
    authUrl.searchParams.set('scope', OAUTH_SCOPES);
    authUrl.searchParams.set('redirect_uri', getRedirectUri());
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    // Start local HTTP server BEFORE opening browser
    const callbackPromise = startCallbackServer(5 * 60 * 1000);

    // Open browser for authentication
    await vscode.env.openExternal(vscode.Uri.parse(authUrl.toString()));

    // Wait for callback
    const result = await callbackPromise;

    if (result.state !== state) {
      throw new Error('State mismatch — possível ataque CSRF.');
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(result.code, codeVerifier);

    // Save and emit
    await this.tokenManager.saveTokens(tokens);
    this._onDidLogin.fire(tokens);

    return tokens;
  }

  async logout(): Promise<void> {
    await this.tokenManager.clearTokens();
    this._onDidLogout.fire();
  }

  async refreshAccessToken(): Promise<AuthTokens | null> {
    const currentTokens = await this.tokenManager.getTokens();
    if (!currentTokens) {
      return null;
    }

    try {
      const response = await fetch(ATLASSIAN_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: getClientId(),
          client_secret: getClientSecret(),
          refresh_token: currentTokens.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = (await response.json()) as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };

      const tokens: AuthTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
        cloudId: currentTokens.cloudId,
        userEmail: currentTokens.userEmail,
      };

      await this.tokenManager.saveTokens(tokens);
      return tokens;
    } catch (err) {
      // If refresh fails, force re-login
      await this.tokenManager.clearTokens();
      this._onDidLogout.fire();
      return null;
    }
  }

  async getValidAccessToken(): Promise<string | null> {
    const expired = await this.tokenManager.isTokenExpired();
    if (expired) {
      const refreshed = await this.refreshAccessToken();
      return refreshed?.accessToken ?? null;
    }
    const tokens = await this.tokenManager.getTokens();
    return tokens?.accessToken ?? null;
  }

  async isLoggedIn(): Promise<boolean> {
    const tokens = await this.tokenManager.getTokens();
    return tokens !== null;
  }

  private async exchangeCodeForTokens(
    code: string,
    codeVerifier: string
  ): Promise<AuthTokens> {
    const tokenResponse = await fetch(ATLASSIAN_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: getClientId(),
        client_secret: getClientSecret(),
        code,
        redirect_uri: getRedirectUri(),
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      throw new Error(`Erro ao trocar código por token: ${tokenResponse.status} ${errorBody}`);
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      scope: string;
    };

    // Get accessible resources to find cloud ID
    const resourcesResponse = await fetch(ATLASSIAN_RESOURCES_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!resourcesResponse.ok) {
      throw new Error('Erro ao buscar recursos acessíveis do Atlassian');
    }

    const resources = (await resourcesResponse.json()) as AccessibleResource[];

    if (resources.length === 0) {
      throw new Error('Nenhum site Jira encontrado para sua conta.');
    }

    // If multiple sites, let user pick
    let selectedResource: AccessibleResource;
    if (resources.length === 1) {
      selectedResource = resources[0];
    } else {
      const picked = await vscode.window.showQuickPick(
        resources.map((r) => ({ label: r.name, description: r.url, resource: r })),
        { placeHolder: 'Selecione o site Jira' }
      );
      if (!picked) {
        throw new Error('Nenhum site selecionado.');
      }
      selectedResource = picked.resource;
    }

    // Get user email
    let userEmail: string | undefined;
    try {
      const meResponse = await fetch('https://api.atlassian.com/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (meResponse.ok) {
        const me = (await meResponse.json()) as { email?: string };
        userEmail = me.email;
      }
    } catch {
      // Non-critical, ignore
    }

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      cloudId: selectedResource.id,
      userEmail,
    };
  }

  private generateCodeVerifier(): string {
    return crypto.randomBytes(64).toString('base64url');
  }

  private generateCodeChallenge(verifier: string): string {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
  }

  dispose(): void {
    this._onDidLogin.dispose();
    this._onDidLogout.dispose();
  }
}
