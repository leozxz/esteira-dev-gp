import { JiraAuthProvider } from '../auth/jiraAuthProvider';
import { TokenManager } from '../auth/tokenManager';
import {
  CreateIssuePayload,
  JiraAssignableUser,
  JiraFieldMeta,
  JiraIssue,
  JiraIssueType,
  JiraPriority,
  JiraProject,
  JiraSearchResponse,
  JiraTransition,
} from '../models/types';
import { JIRA_API_BASE } from '../utils/config';

export class JiraClient {
  constructor(
    private authProvider: JiraAuthProvider,
    private tokenManager: TokenManager
  ) {}

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const accessToken = await this.authProvider.getValidAccessToken();
    if (!accessToken) {
      throw new Error('Não autenticado. Faça login primeiro.');
    }

    const tokens = await this.tokenManager.getTokens();
    if (!tokens) {
      throw new Error('Tokens não encontrados.');
    }

    const url = `${JIRA_API_BASE}/${tokens.cloudId}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Jira API error ${response.status}: ${errorBody}`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }

  async getMyIssues(maxResults = 50, trackedProjects?: string[]): Promise<JiraIssue[]> {
    let jql: string;
    if (trackedProjects && trackedProjects.length > 0) {
      const projectList = trackedProjects.map((k) => `"${k}"`).join(', ');
      jql = `project in (${projectList}) AND resolution = Unresolved ORDER BY updated DESC`;
    } else {
      jql = 'assignee = currentUser() AND resolution = Unresolved ORDER BY updated DESC';
    }
    const data = await this.request<JiraSearchResponse>(
      '/rest/api/3/search/jql',
      {
        method: 'POST',
        body: JSON.stringify({
          jql,
          maxResults,
          fields: [
            'summary', 'status', 'priority', 'assignee', 'reporter',
            'project', 'issuetype', 'created', 'updated', 'labels', 'description',
          ],
        }),
      }
    );
    return data.issues;
  }

  async getIssue(issueKey: string): Promise<JiraIssue> {
    return this.request<JiraIssue>(`/rest/api/3/issue/${issueKey}`);
  }

  async createIssue(payload: CreateIssuePayload): Promise<JiraIssue> {
    return this.request<JiraIssue>('/rest/api/3/issue', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getProjects(): Promise<JiraProject[]> {
    const allProjects: JiraProject[] = [];
    let startAt = 0;
    const pageSize = 50;

    while (true) {
      const data = await this.request<{
        values: JiraProject[];
        total: number;
        startAt: number;
        maxResults: number;
      }>(`/rest/api/3/project/search?startAt=${startAt}&maxResults=${pageSize}`);

      allProjects.push(...data.values);

      if (startAt + data.values.length >= data.total) {
        break;
      }
      startAt += data.values.length;
    }

    return allProjects;
  }

  async getIssueTypes(projectKey: string): Promise<JiraIssueType[]> {
    const project = await this.request<{ issueTypes: JiraIssueType[] }>(
      `/rest/api/3/project/${projectKey}`
    );
    return project.issueTypes.filter((t) => !t.subtask);
  }

  async getCreateMeta(projectKey: string, issueTypeId: string): Promise<JiraFieldMeta[]> {
    const allFields: JiraFieldMeta[] = [];
    let startAt = 0;
    const pageSize = 50;

    while (true) {
      const data = await this.request<{ values: JiraFieldMeta[]; total: number; startAt: number; maxResults: number }>(
        `/rest/api/3/issue/createmeta/${projectKey}/issuetypes/${issueTypeId}?startAt=${startAt}&maxResults=${pageSize}`
      );
      allFields.push(...data.values);
      if (startAt + data.values.length >= data.total) {
        break;
      }
      startAt += data.values.length;
    }

    const standardFields = new Set([
      'project', 'issuetype', 'summary', 'description', 'reporter',
      'attachment', 'issuelinks',
    ]);
    return allFields.filter(
      (f) => f.required && !standardFields.has(f.fieldId)
    );
  }

  async searchIssues(jql: string, maxResults = 50): Promise<JiraIssue[]> {
    const data = await this.request<JiraSearchResponse>(
      '/rest/api/3/search/jql',
      {
        method: 'POST',
        body: JSON.stringify({
          jql,
          maxResults,
          fields: [
            'summary', 'status', 'priority', 'assignee', 'reporter',
            'project', 'issuetype', 'created', 'updated', 'labels', 'description',
          ],
        }),
      }
    );
    return data.issues;
  }

  async getTransitions(issueKey: string): Promise<JiraTransition[]> {
    const data = await this.request<{ transitions: JiraTransition[] }>(
      `/rest/api/3/issue/${issueKey}/transitions`
    );
    return data.transitions;
  }

  async transitionIssue(issueKey: string, transitionId: string): Promise<void> {
    await this.request<void>(`/rest/api/3/issue/${issueKey}/transitions`, {
      method: 'POST',
      body: JSON.stringify({ transition: { id: transitionId } }),
    });
  }

  async updateIssue(issueKey: string, fields: Record<string, unknown>): Promise<void> {
    await this.request<void>(`/rest/api/3/issue/${issueKey}`, {
      method: 'PUT',
      body: JSON.stringify({ fields }),
    });
  }

  async getPriorities(): Promise<JiraPriority[]> {
    return this.request<JiraPriority[]>('/rest/api/3/priority');
  }

  async getAssignableUsers(projectKey: string): Promise<JiraAssignableUser[]> {
    return this.request<JiraAssignableUser[]>(
      `/rest/api/3/user/assignable/search?project=${encodeURIComponent(projectKey)}`
    );
  }

  async createRemoteLink(
    issueKey: string,
    url: string,
    title: string,
  ): Promise<void> {
    await this.request<unknown>(`/rest/api/3/issue/${issueKey}/remotelink`, {
      method: 'POST',
      body: JSON.stringify({
        object: {
          url,
          title,
          icon: {
            url16x16: 'https://github.githubassets.com/favicons/favicon.svg',
            title: 'GitHub',
          },
        },
      }),
    });
  }
}
