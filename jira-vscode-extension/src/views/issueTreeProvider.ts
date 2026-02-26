import * as vscode from 'vscode';
import { JiraClient } from '../api/jiraClient';
import { JiraIssue } from '../models/types';

type TreeItem = ProjectNode | IssueNode;

class ProjectNode extends vscode.TreeItem {
  constructor(
    public readonly projectKey: string,
    public readonly projectName: string,
    public readonly issues: JiraIssue[]
  ) {
    super(
      `${projectName} (${issues.length})`,
      vscode.TreeItemCollapsibleState.Expanded
    );
    this.contextValue = 'project';
    this.iconPath = new vscode.ThemeIcon('folder');
  }
}

class IssueNode extends vscode.TreeItem {
  constructor(public readonly issue: JiraIssue) {
    super(issue.key, vscode.TreeItemCollapsibleState.None);

    this.description = issue.fields.summary;
    this.tooltip = this.buildTooltip();
    this.contextValue = 'issue';
    this.iconPath = this.getStatusIcon();

    this.command = {
      command: 'jira.openIssue',
      title: 'Abrir Issue',
      arguments: [issue],
    };
  }

  private buildTooltip(): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**${this.issue.key}** — ${this.issue.fields.summary}\n\n`);
    md.appendMarkdown(`**Status:** ${this.issue.fields.status.name}\n\n`);
    md.appendMarkdown(`**Prioridade:** ${this.issue.fields.priority.name}\n\n`);
    md.appendMarkdown(`**Tipo:** ${this.issue.fields.issuetype.name}\n\n`);
    if (this.issue.fields.assignee) {
      md.appendMarkdown(`**Responsável:** ${this.issue.fields.assignee.displayName}\n\n`);
    }
    return md;
  }

  private getStatusIcon(): vscode.ThemeIcon {
    const categoryKey = this.issue.fields.status.statusCategory.key;
    switch (categoryKey) {
      case 'done':
        return new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
      case 'indeterminate':
        return new vscode.ThemeIcon('play-circle', new vscode.ThemeColor('charts.blue'));
      case 'new':
        return new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.foreground'));
      default:
        return new vscode.ThemeIcon('issue-opened');
    }
  }
}

export class IssueTreeProvider implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined | null>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private issues: JiraIssue[] = [];
  private trackedProjects: string[] = [];

  constructor(private jiraClient: JiraClient) {}

  setTrackedProjects(projects: string[]): void {
    this.trackedProjects = projects;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  async loadIssues(): Promise<void> {
    try {
      this.issues = await this.jiraClient.getMyIssues(100, this.trackedProjects.length > 0 ? this.trackedProjects : undefined);
    } catch (err) {
      this.issues = [];
      throw err;
    }
    this.refresh();
  }

  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeItem): Thenable<TreeItem[]> {
    if (!element) {
      // Root level: group by project
      const projectMap = new Map<string, JiraIssue[]>();
      for (const issue of this.issues) {
        const key = issue.fields.project.key;
        if (!projectMap.has(key)) {
          projectMap.set(key, []);
        }
        projectMap.get(key)!.push(issue);
      }

      const projectNodes: ProjectNode[] = [];
      for (const [key, issues] of projectMap) {
        const projectName = issues[0].fields.project.name;
        projectNodes.push(new ProjectNode(key, projectName, issues));
      }

      return Promise.resolve(projectNodes);
    }

    if (element instanceof ProjectNode) {
      return Promise.resolve(
        element.issues.map((issue) => new IssueNode(issue))
      );
    }

    return Promise.resolve([]);
  }

  dispose(): void {
    this._onDidChangeTreeData.dispose();
  }
}
