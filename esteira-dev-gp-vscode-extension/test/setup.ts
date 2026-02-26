import { vi } from 'vitest';

const mockTerminal = {
    show: vi.fn(),
    sendText: vi.fn(),
    dispose: vi.fn(),
    exitStatus: undefined as { code: number } | undefined,
};

vi.mock('vscode', () => ({
    window: {
        createTerminal: vi.fn(() => ({ ...mockTerminal })),
        showInputBox: vi.fn(),
        showOpenDialog: vi.fn(),
        showErrorMessage: vi.fn(),
        showInformationMessage: vi.fn(),
        createWebviewPanel: vi.fn(() => ({
            webview: {
                html: '',
                onDidReceiveMessage: vi.fn(),
                postMessage: vi.fn(),
                options: {},
            },
            reveal: vi.fn(),
            onDidDispose: vi.fn(),
            dispose: vi.fn(),
        })),
    },
    ViewColumn: {
        One: 1,
        Two: 2,
        Three: 3,
    },
    Uri: {
        file: vi.fn((path: string) => ({ fsPath: path, scheme: 'file' })),
        parse: vi.fn((str: string) => ({ fsPath: str, scheme: 'file' })),
    },
    commands: {
        executeCommand: vi.fn(),
        registerCommand: vi.fn(),
    },
    workspace: {
        getConfiguration: vi.fn(() => ({
            get: vi.fn(),
            update: vi.fn(),
        })),
    },
}));
