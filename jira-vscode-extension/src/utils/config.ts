// Getters lazy — leem process.env no momento da chamada, não no import.
// Isso garante que loadEnvFile() do extension.ts já tenha rodado.

export function getClientId(): string {
  return process.env.ATLASSIAN_CLIENT_ID || '';
}

export function getClientSecret(): string {
  return process.env.ATLASSIAN_CLIENT_SECRET || '';
}

export const ATLASSIAN_AUTH_URL = 'https://auth.atlassian.com/authorize';
export const ATLASSIAN_TOKEN_URL = 'https://auth.atlassian.com/oauth/token';
export const ATLASSIAN_RESOURCES_URL = 'https://api.atlassian.com/oauth/token/accessible-resources';
export const JIRA_API_BASE = 'https://api.atlassian.com/ex/jira';

export const OAUTH_SCOPES = [
  'read:jira-work',
  'write:jira-work',
  'read:jira-user',
  'offline_access',
].join(' ');

export function getCallbackPort(): number {
  return parseInt(process.env.OAUTH_CALLBACK_PORT || '53417', 10);
}

export function getRedirectUri(): string {
  return `http://localhost:${getCallbackPort()}/callback`;
}

export const SECRET_KEYS = {
  accessToken: 'jira.accessToken',
  refreshToken: 'jira.refreshToken',
  expiresAt: 'jira.expiresAt',
  cloudId: 'jira.cloudId',
  userEmail: 'jira.userEmail',
} as const;
