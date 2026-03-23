export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: unknown;
    status: {
      name: string;
      statusCategory: { key: string; colorName: string };
    };
    priority: {
      name: string;
      iconUrl: string;
    };
    issuetype: {
      name: string;
      iconUrl: string;
    };
    assignee?: {
      displayName: string;
      avatarUrls: { '48x48': string };
      accountId: string;
    };
    reporter?: {
      displayName: string;
      avatarUrls: { '48x48': string };
    };
    project: {
      key: string;
      name: string;
    };
    created: string;
    updated: string;
    labels: string[];
  };
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
}

export interface JiraIssueType {
  id: string;
  name: string;
  subtask: boolean;
  iconUrl: string;
}

export interface CreateIssuePayload {
  fields: {
    project: { key: string };
    issuetype: { name: string };
    summary: string;
    description?: {
      type: 'doc';
      version: 1;
      content: Array<{
        type: 'paragraph';
        content: Array<{ type: 'text'; text: string }>;
      }>;
    };
    [key: string]: unknown;
  };
}

export interface JiraFieldMeta {
  fieldId: string;
  name: string;
  required: boolean;
  schema: { type: string; custom?: string; customId?: number };
  allowedValues?: Array<{ id: string; name?: string; value?: string }>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  cloudId: string;
  userEmail?: string;
  siteUrl?: string;
}

export interface JiraSearchResponse {
  issues: JiraIssue[];
  total: number;
  maxResults: number;
  startAt: number;
}

export interface AccessibleResource {
  id: string;
  name: string;
  url: string;
  scopes: string[];
}

export interface JiraTransition {
  id: string;
  name: string;
  to: {
    name: string;
    statusCategory: { key: string; colorName: string };
  };
}

export interface JiraPriority {
  id: string;
  name: string;
  iconUrl: string;
}

export interface JiraAssignableUser {
  accountId: string;
  displayName: string;
}
