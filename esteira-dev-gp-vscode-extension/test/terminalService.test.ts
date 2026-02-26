import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as vscode from 'vscode';
import { TerminalService } from '../src/services/terminalService';

describe('TerminalService', () => {
    let service: TerminalService;
    let mockTerminal: {
        show: ReturnType<typeof vi.fn>;
        sendText: ReturnType<typeof vi.fn>;
        dispose: ReturnType<typeof vi.fn>;
        exitStatus: undefined | { code: number };
    };

    beforeEach(() => {
        vi.clearAllMocks();
        service = new TerminalService();
        mockTerminal = {
            show: vi.fn(),
            sendText: vi.fn(),
            dispose: vi.fn(),
            exitStatus: undefined,
        };
        vi.mocked(vscode.window.createTerminal).mockReturnValue(mockTerminal as unknown as vscode.Terminal);
    });

    describe('getOrCreateTerminal', () => {
        it('should create a new terminal when none exists', () => {
            const terminal = service.getOrCreateTerminal('test');
            expect(vscode.window.createTerminal).toHaveBeenCalledWith('test');
            expect(terminal).toBeDefined();
        });

        it('should reuse existing terminal if still alive', () => {
            const terminal1 = service.getOrCreateTerminal('test');
            const terminal2 = service.getOrCreateTerminal('test');
            expect(vscode.window.createTerminal).toHaveBeenCalledTimes(1);
            expect(terminal1).toBe(terminal2);
        });

        it('should create new terminal if existing one has exited', () => {
            const terminal1 = service.getOrCreateTerminal('test');
            // Simulate terminal exit
            (terminal1 as any).exitStatus = { code: 0 };

            const newMock = { ...mockTerminal, show: vi.fn(), sendText: vi.fn() };
            vi.mocked(vscode.window.createTerminal).mockReturnValue(newMock as unknown as vscode.Terminal);

            const terminal2 = service.getOrCreateTerminal('test');
            expect(vscode.window.createTerminal).toHaveBeenCalledTimes(2);
            expect(terminal2).toBe(newMock);
        });
    });

    describe('sendCommand', () => {
        it('should show terminal and send command', () => {
            service.sendCommand('test', 'echo hello');
            expect(mockTerminal.show).toHaveBeenCalled();
            expect(mockTerminal.sendText).toHaveBeenCalledWith('echo hello');
        });

        it('should show error message on failure', () => {
            vi.mocked(vscode.window.createTerminal).mockImplementation(() => {
                throw new Error('Terminal creation failed');
            });

            service.sendCommand('test', 'echo hello');
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                'Erro ao executar comando no terminal: Terminal creation failed'
            );
        });
    });

    describe('dispose', () => {
        it('should dispose all active terminals', () => {
            service.getOrCreateTerminal('test1');

            const mock2 = { ...mockTerminal, dispose: vi.fn() };
            vi.mocked(vscode.window.createTerminal).mockReturnValue(mock2 as unknown as vscode.Terminal);
            service.getOrCreateTerminal('test2');

            service.dispose();
            expect(mockTerminal.dispose).toHaveBeenCalled();
            expect(mock2.dispose).toHaveBeenCalled();
        });
    });
});
