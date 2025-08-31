import React from 'react';

interface StatusBarProps {
    currentProject: string | null;
    activeFile: string | null;
    aiProvider: string;
    onShowAIChat: () => void;
    onShowAISettings: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ currentProject, activeFile, aiProvider, onShowAIChat, onShowAISettings }) => {
    const getFileInfo = () => {
        if (!activeFile) return '';
        
        const fileName = activeFile.split(/[/\\]/).pop();
        const extension = fileName?.split('.').pop()?.toUpperCase();
        
        return `${fileName} ${extension ? `• ${extension}` : ''}`;
    };

    const getProjectName = () => {
        if (!currentProject) return 'No project';
        return currentProject.split(/[/\\]/).pop() || currentProject;
    };

    const getAIStatus = () => {
        if (!aiProvider) return 'No AI';
        
        const providerNames: { [key: string]: string } = {
            openai: 'OpenAI',
            anthropic: 'Claude',
            local: 'Local AI'
        };
        
        return providerNames[aiProvider] || aiProvider;
    };

    return (
        <div className="status-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="status-item">
                    <span>📁</span>
                    <span>{getProjectName()}</span>
                </div>
                
                {activeFile && (
                    <div className="status-item">
                        <span>📄</span>
                        <span>{getFileInfo()}</span>
                    </div>
                )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="status-item">
                    <span>🤖</span>
                    <span>{getAIStatus()}</span>
                </div>
                
                <button 
                    className="status-button"
                    onClick={async () => {
                        console.log('StatusBar: Chat button clicked');
                        if (window.electronAPI && window.electronAPI.ai) {
                            try {
                                await window.electronAPI.ai.showChat();
                            } catch (error) {
                                console.error('Failed to show AI chat:', error);
                            }
                        }
                    }}
                    title="Chat with AI"
                >
                    💬 Chat
                </button>
                
                <button 
                    className="status-button"
                    onClick={async () => {
                        console.log('StatusBar: Settings button clicked');
                        if (window.electronAPI && window.electronAPI.ai) {
                            try {
                                await window.electronAPI.ai.showSettings();
                            } catch (error) {
                                console.error('Failed to show AI settings:', error);
                            }
                        }
                    }}
                    title="AI Settings"
                >
                    ⚙️ Settings
                </button>
                
                <div className="status-item">
                    <span>L2Api Agent</span>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;
