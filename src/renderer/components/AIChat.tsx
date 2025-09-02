import React, { useState, useEffect, useRef } from 'react';
import { AI_MODELS, getModelById } from '../types/AIModels';

interface AIChatProps {
    onClose: () => void;
    currentFile?: string;
    selectedCode?: string;
    projectPath?: string;
    fileContent?: string;
    fileLanguage?: string;
    cursorPosition?: { line: number; column: number };
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    context?: {
        filePath?: string;
        selectedCode?: string;
        taskType?: string;
    };
}

const AIChat: React.FC<AIChatProps> = ({ 
    onClose, 
    currentFile, 
    selectedCode, 
    projectPath,
    fileContent,
    fileLanguage: propFileLanguage,
    cursorPosition
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedMode, setSelectedMode] = useState('agent');
    const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-5');
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [modelSearchQuery, setModelSearchQuery] = useState('');
    const [currentLine, setCurrentLine] = useState(cursorPosition?.line || 1);
    const [currentColumn, setCurrentColumn] = useState(cursorPosition?.column || 1);
    const [fileEncoding, setFileEncoding] = useState('UTF-8');
    const [fileLanguage, setFileLanguage] = useState(propFileLanguage || 'Text');
    const [isImageAttaching, setIsImageAttaching] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modelDropdownRef = useRef<HTMLDivElement>(null);
    const modeDropdownRef = useRef<HTMLDivElement>(null);
    const menuDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Update cursor position and file language when props change
    useEffect(() => {
        if (cursorPosition) {
            setCurrentLine(cursorPosition.line);
            setCurrentColumn(cursorPosition.column);
        }
    }, [cursorPosition]);

    useEffect(() => {
        if (propFileLanguage) {
            setFileLanguage(propFileLanguage);
        }
    }, [propFileLanguage]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
                setIsModelDropdownOpen(false);
                setModelSearchQuery('');
            }
            if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
                setIsModeDropdownOpen(false);
            }
            if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const addMessage = (role: 'user' | 'assistant', content: string, context?: any) => {
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            role,
            content,
            timestamp: Date.now(),
            context
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        setIsLoading(true);

        // Add user message
        addMessage('user', userMessage, {
                filePath: currentFile,
            selectedCode,
                taskType: 'chat'
            });

        try {
            // Send to AI
            const response = await window.electronAPI.ai.sendMessage(userMessage, {
                filePath: currentFile,
                selectedCode,
                projectPath,
                taskType: 'chat',
                selectedModel: selectedModel // Добавляем выбранную модель в контекст
            });

            // Simulate typing effect
            setIsTyping(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            setIsTyping(false);

            // Add AI response
            addMessage('assistant', response.content || 'Sorry, I could not generate a response.');
        } catch (error) {
            console.error('Failed to send message:', error);
            addMessage('assistant', 'Sorry, there was an error processing your request.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    const formatCode = (content: string) => {
        // Simple code block detection
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        return content.replace(codeBlockRegex, (match, lang, code) => {
            return `<pre class="code-block"><code class="language-${lang || 'text'}">${code}</code></pre>`;
        });
    };

    const handleImageAttach = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsImageAttaching(true);
            
            // Simulate file processing
            setTimeout(() => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result as string;
                    // Add image to chat or attach to input
                    console.log('Image attached:', file.name);
                    setInputValue(prev => prev + `\n[Attached image: ${file.name}]`);
                    setIsImageAttaching(false);
                };
                reader.readAsDataURL(file);
            }, 1000);
        }
    };

    // Available AI models from shared source
    const availableModels = AI_MODELS;

    const filteredModels = availableModels.filter(model =>
        model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(modelSearchQuery.toLowerCase())
    );

    const handleModelSelect = (modelId: string) => {
        setSelectedModel(modelId);
        setIsModelDropdownOpen(false);
        setModelSearchQuery('');
    };

    const getModelDisplayName = (modelId: string) => {
        const model = getModelById(modelId);
        return model?.name || modelId;
    };

    // Available modes
    const availableModes = [
        {
            id: 'agent',
            name: 'Agent',
            icon: '∞',
            shortcut: 'Ctrl+I',
            description: 'AI agent mode for complex tasks'
        },
        {
            id: 'ask',
            name: 'Ask',
            icon: '💬',
            shortcut: 'Ctrl+.',
            description: 'Quick question mode'
        }
    ];

    const handleModeSelect = (modeId: string) => {
        setSelectedMode(modeId);
        setIsModeDropdownOpen(false);
    };

    const getCurrentMode = () => {
        return availableModes.find(m => m.id === selectedMode) || availableModes[0];
    };

    // Chat history functions
    const handleClearHistory = () => {
        if (confirm('Очистить всю историю чата?')) {
            setMessages([]);
            setIsMenuOpen(false);
        }
    };

    const handleExportHistory = () => {
        if (messages.length === 0) {
            alert('Нет сообщений для экспорта');
            return;
        }

        const chatHistory = {
            exported: new Date().toISOString(),
            project: projectPath || 'Unknown',
            file: currentFile || 'Unknown',
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
                context: msg.context
            }))
        };

        const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsMenuOpen(false);
    };

    const handleImportHistory = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target?.result as string);
                        if (data.messages && Array.isArray(data.messages)) {
                            setMessages(data.messages.map((msg: any, index: number) => ({
                                ...msg,
                                id: Date.now() + index
                            })));
                            alert('История чата успешно импортирована');
                        } else {
                            alert('Неверный формат файла');
                        }
                    } catch (error) {
                        alert('Ошибка при чтении файла');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
        setIsMenuOpen(false);
    };

    return (
        <div className="ai-chat-panel">
            {/* Chat Header */}
            <div className="chat-header">
                <div className="chat-title">
                    <h3>AI Chat</h3>
                </div>
                <div className="chat-actions">
                    <div className="chat-menu" ref={menuDropdownRef}>
                    <button
                            className="chat-menu-button" 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            title="Chat Menu"
                        >
                            ⋮
                        </button>
                        
                        {isMenuOpen && (
                            <div className="chat-menu-dropdown">
                                <button className="menu-item" onClick={handleImportHistory}>
                                    <span className="menu-icon">📁</span>
                                    <span className="menu-text">Import History</span>
                                </button>
                                <button className="menu-item" onClick={handleExportHistory}>
                                    <span className="menu-icon">💾</span>
                                    <span className="menu-text">Export History</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-item danger" onClick={handleClearHistory}>
                                    <span className="menu-icon">🗑️</span>
                                    <span className="menu-text">Clear History</span>
                    </button>
                            </div>
                        )}
                    </div>
                    
                    <button className="chat-close-button" onClick={onClose} title="Close Chat">
                        ×
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="chat-welcome">
                        <h3>Welcome to AI Chat!</h3>
                        <p>I can help you with:</p>
                        <ul>
                            <li>Explaining code</li>
                            <li>Debugging issues</li>
                            <li>Code optimization</li>
                            <li>Refactoring suggestions</li>
                            <li>Generating tests</li>
                            <li>Adding documentation</li>
                        </ul>
                        {currentFile && (
                            <div className="current-file">
                                <strong>Current file:</strong> {currentFile}
                                    </div>
                                )}
                        {selectedCode && (
                            <div className="selected-code">
                                <strong>Selected code:</strong> {selectedCode.length} characters
                            </div>
                        )}
                    </div>
                )}

                {messages.map((message) => (
                    <div key={message.id} className={`chat-message ${message.role}`}>
                        <div className="message-header">
                            <span className="message-role">
                                {message.role === 'user' ? 'You' : 'AI Assistant'}
                            </span>
                            <span className="message-time">
                                {formatTimestamp(message.timestamp)}
                            </span>
                        </div>
                        <div 
                            className="message-content"
                            dangerouslySetInnerHTML={{ __html: formatCode(message.content) }}
                        />
                        {message.context?.filePath && (
                            <div className="message-context">
                                <small>Context: {message.context.filePath}</small>
                                    </div>
                                )}
                    </div>
                ))}
                
                {isLoading && (
                    <div className="chat-message assistant">
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Modern Input Area */}
            <div className="modern-input-area">
                {/* Top Controls */}
                <div className="input-top-controls">
                    <div className="left-controls">
                        <button className="at-button">@</button>
                        <div className="tab-info">
                            <span className="tab-icon">📄</span>
                            <span className="tab-count">1 Tab</span>
                        </div>
                    </div>
                    <div className="right-controls">
                        <div className="progress-info">
                            <span className="progress-text">50.3%</span>
                            <div className="progress-ring"></div>
                        </div>
                    </div>
                    </div>
                
                {/* Main Input */}
                <div className="input-container">
                    <textarea
                        ref={inputRef}
                        className="modern-chat-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Plan, search, build anything"
                        disabled={isLoading}
                        rows={4}
                    />
                </div>

                {/* Bottom Controls */}
                <div className="input-bottom-controls">
                    <div className="left-controls">
                        {/* Mode Selector */}
                        <div className="mode-selector" ref={modeDropdownRef}>
                            <div className="mode-selector-button" onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}>
                                <span className="mode-icon">{getCurrentMode().icon}</span>
                                <span className="mode-name">{getCurrentMode().name}</span>
                                <span className="mode-shortcut">{getCurrentMode().shortcut}</span>
                            </div>
                            
                            {isModeDropdownOpen && (
                                <div className="mode-dropdown">
                                    <div className="mode-dropdown-header">
                                        <span className="mode-dropdown-hint">Ctrl+. to switch modes</span>
                                    </div>
                                    
                                    <div className="mode-dropdown-content">
                                        {availableModes.map((mode) => (
                                            <div 
                                                key={mode.id}
                                                className={`mode-option ${selectedMode === mode.id ? 'selected' : ''}`}
                                                onClick={() => handleModeSelect(mode.id)}
                                            >
                                                <div className="mode-option-header">
                                                    <span className="mode-option-icon">{mode.icon}</span>
                                                    <span className="mode-option-name">{mode.name}</span>
                                                    <span className="mode-option-shortcut">{mode.shortcut}</span>
                                                    {selectedMode === mode.id && (
                                                        <>
                                                            <span className="mode-edit-icon">✏️</span>
                                                            <span className="mode-checkmark">✓</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Model Selector */}
                        <div className="model-selector" ref={modelDropdownRef}>
                            <div className="model-selector-button" onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}>
                                <span className="model-name">{getModelDisplayName(selectedModel)}</span>
                                <span className="model-caret">⌄</span>
                            </div>
                            
                            {isModelDropdownOpen && (
                                <div className="model-dropdown">
                                    <div className="model-dropdown-header">
                                        <input
                                            type="text"
                                            placeholder="Ctrl+/ to switch models"
                                            value={modelSearchQuery}
                                            onChange={(e) => setModelSearchQuery(e.target.value)}
                                            className="model-search-input"
                                            autoFocus
                                        />
                                    </div>
                                    
                                    <div className="model-dropdown-content">
                                        {filteredModels.map((model) => (
                                            <div 
                                                key={model.id}
                                                className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
                                                onClick={() => handleModelSelect(model.id)}
                                            >
                                                <div className="model-option-header">
                                                    <span className="model-option-name">{model.name}</span>
                                                    {selectedModel === model.id && <span className="checkmark">✓</span>}
                                                </div>
                                                <div className="model-option-description">{model.description}</div>
                                                <div className="model-option-details">
                                                    <span className="context-window">{model.contextWindow}</span>
                                                </div>
                                                <div className="model-option-version">
                                                    <span className="version-text">{model.version}</span>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div className="model-option add-models">
                                            <div className="model-option-header">
                                                <span className="model-option-name">Add Models</span>
                                                <span className="arrow-right">→</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="right-controls">
                        <button 
                            className={`image-attach-button ${isImageAttaching ? 'loading' : ''}`}
                            onClick={handleImageAttach}
                            disabled={isImageAttaching}
                        >
                            {isImageAttaching ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                <span className="image-icon">🏔️</span>
                            )}
                        </button>
                    <button
                            className="send-arrow-button"
                        onClick={sendMessage}
                        disabled={!inputValue.trim() || isLoading}
                    >
                            <span className="arrow-icon">↑</span>
                    </button>
                    </div>
                </div>
                
                {/* Hidden file input for image attachment */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                </div>
                
            {/* Status Bar */}
            <div className="ai-status-bar">
                <div className="status-left">
                    <span className="status-item">Cursor Tab</span>
                </div>
                <div className="status-center">
                    <span className="status-item">Ln {currentLine}, Col {currentColumn}</span>
                    <span className="status-item">Spaces: 4</span>
                    <span className="status-item">{fileEncoding}</span>
                    <span className="status-item">CRLF</span>
                    <span className="status-item">{fileLanguage}</span>
                </div>
                <div className="status-right">
                    <button className="notification-button">🔔</button>
                </div>
            </div>

            <style>{`
                .ai-chat-panel {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-primary);
                    border-left: 1px solid var(--border-color);
                }

                .chat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-color);
                    background: var(--bg-secondary);
                    min-height: 48px;
                }

                .chat-title h3 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: 14px;
                    font-weight: 600;
                }

                .chat-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .chat-close-button {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: all 0.2s;
                    line-height: 1;
                }

                .chat-close-button:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }

                .chat-menu {
                    position: relative;
                    display: inline-block;
                }

                .chat-menu-button {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: all 0.2s;
                    line-height: 1;
                }

                .chat-menu-button:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }

                .chat-menu-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    z-index: 1000;
                    margin-top: 4px;
                    min-width: 180px;
                    padding: 4px 0;
                }

                .menu-item {
                    width: 100%;
                    background: transparent;
                    border: none;
                    color: var(--text-primary);
                    font-size: 13px;
                    cursor: pointer;
                    padding: 8px 12px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    text-align: left;
                }

                .menu-item:hover {
                    background: var(--bg-secondary);
                }

                .menu-item.danger {
                    color: #ff6b6b;
                }

                .menu-item.danger:hover {
                    background: rgba(255, 107, 107, 0.1);
                }

                .menu-icon {
                    font-size: 14px;
                    width: 16px;
                    text-align: center;
                }

                .menu-text {
                    flex: 1;
                }

                .menu-divider {
                    height: 1px;
                    background: var(--border-color);
                    margin: 4px 0;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    background: var(--bg-secondary);
                }

                .chat-welcome {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-secondary);
                }

                .chat-welcome h3 {
                    margin-bottom: 20px;
                    color: var(--text-primary);
                }

                .chat-welcome ul {
                    text-align: left;
                    max-width: 400px;
                    margin: 20px auto;
                }

                .current-file, .selected-code {
                    margin-top: 10px;
                    padding: 10px;
                    background: var(--bg-primary);
                    border-radius: 4px;
                    font-size: 12px;
                }

                .chat-message {
                    margin-bottom: 20px;
                    padding: 15px;
                    border-radius: 8px;
                    max-width: 80%;
                }

                .chat-message.user {
                    background: var(--accent-color);
                    color: white;
                    margin-left: auto;
                }

                .chat-message.assistant {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                }

                .message-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 12px;
                    opacity: 0.8;
                }

                .message-content {
                    line-height: 1.5;
                }

                .message-content pre {
                    background: var(--bg-secondary);
                    padding: 10px;
                    border-radius: 4px;
                    overflow-x: auto;
                    margin: 10px 0;
                }

                .message-context {
                    margin-top: 8px;
                    opacity: 0.7;
                }

                .typing-indicator {
                    display: flex;
                    gap: 4px;
                }

                .typing-indicator span {
                    width: 8px;
                    height: 8px;
                    background: var(--text-secondary);
                    border-radius: 50%;
                    animation: typing 1.4s infinite ease-in-out;
                }

                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

                @keyframes typing {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }

                /* Modern Input Area */
                .modern-input-area {
                    background: var(--bg-primary);
                    border-top: 1px solid var(--border-color);
                    padding: 16px;
                }

                .input-top-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .left-controls, .right-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .at-button {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }

                .tab-info {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .progress-info {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .progress-ring {
                    width: 16px;
                    height: 16px;
                    border: 2px solid var(--border-color);
                    border-top: 2px solid var(--accent-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .input-container {
                    margin-bottom: 12px;
                }

                .modern-chat-input {
                    width: 100%;
                    min-height: 120px;
                    padding: 16px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-family: inherit;
                    font-size: 14px;
                    line-height: 1.5;
                    resize: none;
                    outline: none;
                }

                .modern-chat-input:focus {
                    border-color: var(--accent-color);
                }

                .modern-chat-input::placeholder {
                    color: var(--text-muted);
                }

                .input-bottom-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .left-controls {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                /* Mode Selector */
                .mode-selector {
                    position: relative;
                    display: inline-block;
                }

                .mode-selector-button {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 6px 12px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .mode-selector-button:hover {
                    background: var(--bg-hover);
                    border-color: var(--accent-color);
                }

                .mode-icon {
                    color: var(--accent-color);
                    font-weight: bold;
                    font-size: 14px;
                }

                .mode-name {
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .mode-shortcut {
                    color: var(--text-muted);
                    font-size: 10px;
                    background: var(--bg-secondary);
                    padding: 2px 4px;
                    border-radius: 3px;
                }

                .mode-dropdown {
                    position: absolute;
                    bottom: 100%;
                    left: 0;
                    width: 280px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    z-index: 1000;
                    margin-bottom: 8px;
                }

                .mode-dropdown-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-color);
                }

                .mode-dropdown-hint {
                    color: var(--text-muted);
                    font-size: 12px;
                }

                .mode-dropdown-content {
                    padding: 4px 0;
                }

                .mode-option {
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .mode-option:hover {
                    background: var(--bg-secondary);
                }

                .mode-option.selected {
                    background: var(--bg-secondary);
                }

                .mode-option-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .mode-option-icon {
                    color: var(--accent-color);
                    font-size: 14px;
                }

                .mode-option-name {
                    color: var(--text-primary);
                    font-size: 14px;
                    font-weight: 500;
                    flex: 1;
                }

                .mode-option-shortcut {
                    color: var(--text-muted);
                    font-size: 10px;
                    background: var(--bg-secondary);
                    padding: 2px 4px;
                    border-radius: 3px;
                }

                .mode-edit-icon {
                    color: var(--text-secondary);
                    font-size: 12px;
                }

                .mode-checkmark {
                    color: var(--accent-color);
                    font-size: 14px;
                }

                /* Model Selector */
                .model-selector {
                    position: relative;
                    display: inline-block;
                }

                .model-selector-button {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 6px 12px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .model-selector-button:hover {
                    background: var(--bg-hover);
                    border-color: var(--accent-color);
                }

                .model-caret {
                    color: var(--text-secondary);
                    font-size: 12px;
                }

                .model-name {
                    color: var(--text-primary);
                    font-size: 12px;
                    font-weight: 500;
                }

                .model-dropdown {
                    position: absolute;
                    bottom: 100%;
                    right: 0;
                    width: 350px;
                    max-width: 90vw;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    z-index: 1000;
                    margin-bottom: 8px;
                    max-height: 400px;
                    overflow: hidden;
                }

                .model-dropdown-header {
                    padding: 12px;
                    border-bottom: 1px solid var(--border-color);
                }

                .model-search-input {
                    width: 100%;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    padding: 8px 12px;
                    color: var(--text-primary);
                    font-size: 13px;
                    outline: none;
                }

                .model-search-input:focus {
                    border-color: var(--accent-color);
                }

                .model-search-input::placeholder {
                    color: var(--text-muted);
                }

                .model-dropdown-content {
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 4px 0;
                }

                .model-option {
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: background 0.2s;
                    border-left: 3px solid transparent;
                }

                .model-option:hover {
                    background: var(--bg-secondary);
                }

                .model-option.selected {
                    background: var(--bg-secondary);
                    border-left-color: var(--accent-color);
                }

                .model-option.add-models {
                    border-top: 1px solid var(--border-color);
                    margin-top: 4px;
                }

                .model-option-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .model-option-name {
                    color: var(--text-primary);
                    font-size: 14px;
                    font-weight: 500;
                }

                .checkmark {
                    color: var(--accent-color);
                    font-size: 14px;
                }

                .arrow-right {
                    color: var(--text-secondary);
                    font-size: 14px;
                }

                .model-option-description {
                    color: var(--text-secondary);
                    font-size: 12px;
                    line-height: 1.4;
                    margin-bottom: 6px;
                }

                .model-option-details {
                    margin-bottom: 4px;
                }

                .context-window {
                    color: var(--text-muted);
                    font-size: 11px;
                    font-style: italic;
                }

                .model-option-version {
                    margin-top: 4px;
                }

                .version-text {
                    color: var(--text-muted);
                    font-size: 10px;
                    font-style: italic;
                }

                .image-attach-button {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .image-attach-button:hover:not(:disabled) {
                    background: var(--bg-hover);
                    border-color: var(--accent-color);
                }

                .image-attach-button.loading {
                    background: var(--accent-color);
                }

                .loading-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid transparent;
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .send-arrow-button {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--accent-color);
                    border: none;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transition: background 0.2s;
                }

                .send-arrow-button:hover:not(:disabled) {
                    background: var(--accent-hover);
                }

                .send-arrow-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Status Bar */
                .ai-status-bar {
                    height: 24px;
                    background: var(--bg-tertiary);
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 12px;
                    font-size: 11px;
                    color: var(--text-secondary);
                }

                .status-left, .status-center, .status-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .status-item {
                    display: flex;
                    align-items: center;
                }

                .notification-button {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-size: 12px;
                    padding: 2px;
                }

                .notification-button:hover {
                    color: var(--text-primary);
                }
            `}</style>
        </div>
    );
};

export default AIChat;
