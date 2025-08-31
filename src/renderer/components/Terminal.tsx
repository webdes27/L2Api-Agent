import React, { useState, useEffect, useRef } from 'react';

interface TerminalProps {
    isVisible: boolean;
    onClose: () => void;
    onSendToAI: (command: string) => void;
    height: number;
    onHeightChange: (height: number) => void;
}

interface TerminalCommand {
    id: string;
    command: string;
    output: string;
    timestamp: Date;
    isExecuting: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ isVisible, onClose, onSendToAI, height, onHeightChange }) => {
    const [commands, setCommands] = useState<TerminalCommand[]>([]);
    const [currentCommand, setCurrentCommand] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [currentDirectory, setCurrentDirectory] = useState('D:\\Source\\L2Api-Agent');
    const terminalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isVisible && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isVisible]);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [commands]);

    const executeCommand = async (command: string) => {
        if (!command.trim()) return;

        const commandId = Date.now().toString();
        const newCommand: TerminalCommand = {
            id: commandId,
            command: command.trim(),
            output: '',
            timestamp: new Date(),
            isExecuting: true
        };

        setCommands(prev => [...prev, newCommand]);
        setCommandHistory(prev => [...prev, command.trim()]);
        setHistoryIndex(-1);
        setCurrentCommand('');

        try {
            // Выполняем команду через Electron
            const result = await window.electronAPI.terminal.executeCommand(command.trim(), currentDirectory);
            
            setCommands(prev => prev.map(cmd => 
                cmd.id === commandId 
                    ? { ...cmd, output: result.output, isExecuting: false }
                    : cmd
            ));

            // Обновляем текущую директорию если это команда cd
            if (command.trim().startsWith('cd ')) {
                const newDir = result.newDirectory || currentDirectory;
                setCurrentDirectory(newDir);
            }
        } catch (error) {
            setCommands(prev => prev.map(cmd => 
                cmd.id === commandId 
                    ? { ...cmd, output: `Error: ${error}`, isExecuting: false }
                    : cmd
            ));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeCommand(currentCommand);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setCurrentCommand('');
            }
        }
    };

    const handleSendToAI = () => {
        if (currentCommand.trim()) {
            onSendToAI(currentCommand.trim());
        }
    };

    const clearTerminal = () => {
        setCommands([]);
    };

    const formatTimestamp = (date: Date) => {
        return date.toLocaleTimeString();
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const startY = e.clientY;
        const startHeight = height;
        
        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = startY - e.clientY; // Reverse for bottom-up resizing
            const newHeight = Math.max(150, Math.min(600, startHeight + deltaY));
            onHeightChange(newHeight);
        };
        
        const handleMouseUp = () => {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    if (!isVisible) return null;

    return (
        <div className="terminal-panel" style={{ height: `${height}px` }}>
            <div className="terminal-resizer" onMouseDown={handleResizeStart} />
            <div className="terminal-header">
                <div className="terminal-title">
                    <span className="terminal-icon">⚡</span>
                    Terminal
                </div>
                <div className="terminal-controls">
                    <button 
                        className="terminal-button"
                        onClick={clearTerminal}
                        title="Clear Terminal"
                    >
                        🗑️
                    </button>
                    <button 
                        className="terminal-button"
                        onClick={handleSendToAI}
                        title="Send to AI"
                        disabled={!currentCommand.trim()}
                    >
                        🤖
                    </button>
                    <button 
                        className="terminal-button"
                        onClick={onClose}
                        title="Close Terminal"
                    >
                        ✕
                    </button>
                </div>
            </div>
            
            <div className="terminal-content" ref={terminalRef}>
                {commands.length === 0 && (
                    <div className="terminal-welcome">
                        <div className="welcome-text">
                            <span className="welcome-icon">🚀</span>
                            <span>Terminal Ready</span>
                        </div>
                        <div className="welcome-subtitle">
                            Type commands or use Ctrl+Up/Down for history
                        </div>
                    </div>
                )}
                
                {commands.map((cmd) => (
                    <div key={cmd.id} className="terminal-command">
                        <div className="command-line">
                            <span className="command-prompt">
                                <span className="prompt-user">user</span>
                                <span className="prompt-at">@</span>
                                <span className="prompt-host">l2api-agent</span>
                                <span className="prompt-colon">:</span>
                                <span className="prompt-path">{currentDirectory}</span>
                                <span className="prompt-dollar">$</span>
                            </span>
                            <span className="command-text">{cmd.command}</span>
                            {cmd.isExecuting && <span className="command-spinner">⏳</span>}
                        </div>
                        
                        {cmd.output && (
                            <div className="command-output">
                                <pre>{cmd.output}</pre>
                            </div>
                        )}
                        
                        <div className="command-timestamp">
                            {formatTimestamp(cmd.timestamp)}
                        </div>
                    </div>
                ))}
                
                <div className="terminal-input-line">
                    <span className="command-prompt">
                        <span className="prompt-user">user</span>
                        <span className="prompt-at">@</span>
                        <span className="prompt-host">l2api-agent</span>
                        <span className="prompt-colon">:</span>
                        <span className="prompt-path">{currentDirectory}</span>
                        <span className="prompt-dollar">$</span>
                    </span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="terminal-input"
                        value={currentCommand}
                        onChange={(e) => setCurrentCommand(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter command..."
                        autoFocus
                    />
                </div>
            </div>
        </div>
    );
};

export default Terminal;
