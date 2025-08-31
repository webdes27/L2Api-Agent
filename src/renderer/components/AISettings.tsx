import React, { useState, useEffect } from 'react';
import { AI_MODELS, getModelsByProvider } from '../types/AIModels';

interface AIProvider {
    id: string;
    name: string;
    isConfigured: boolean;
}

interface AISettingsProps {
    onClose: () => void;
    onProviderChange: (providerId: string) => void;
}

const AISettings: React.FC<AISettingsProps> = ({ onClose, onProviderChange }) => {
    const [providers, setProviders] = useState<AIProvider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Provider configurations
    const [openAIConfig, setOpenAIConfig] = useState({
        apiKey: '',
        model: 'gpt-5',
        temperature: 0.7,
        maxTokens: 4000
    });

    const [anthropicConfig, setAnthropicConfig] = useState({
        apiKey: '',
        model: 'claude-4-sonnet',
        maxTokens: 4000
    });

    const [localConfig, setLocalConfig] = useState({
        endpoint: 'http://localhost:11434',
        model: '',
        useGPU: true,
        gpuLayers: -1,
        contextWindow: 4096
    });

    useEffect(() => {
        loadProviders();
        loadSavedConfigurations();
    }, []);

    const loadProviders = async () => {
        try {
            const providerList = await window.electronAPI.ai.getProviders();
            setProviders(providerList);
            
            // Set first configured provider as selected
            const configured = providerList.find((p: any) => p.isConfigured);
            if (configured) {
                setSelectedProvider(configured.id);
            }
        } catch (error) {
            console.error('Failed to load providers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSavedConfigurations = () => {
        // Load from localStorage or electron-store
        const savedOpenAI = localStorage.getItem('ai-config-openai');
        if (savedOpenAI) {
            setOpenAIConfig(JSON.parse(savedOpenAI));
        }

        const savedAnthropic = localStorage.getItem('ai-config-anthropic');
        if (savedAnthropic) {
            setAnthropicConfig(JSON.parse(savedAnthropic));
        }

        const savedLocal = localStorage.getItem('ai-config-local');
        if (savedLocal) {
            setLocalConfig(JSON.parse(savedLocal));
        }
    };

    const saveConfiguration = async () => {
        setIsSaving(true);
        
        try {
            let config: any = {};
            
            switch (selectedProvider) {
                case 'openai':
                    config = openAIConfig;
                    localStorage.setItem('ai-config-openai', JSON.stringify(openAIConfig));
                    break;
                case 'anthropic':
                    config = anthropicConfig;
                    localStorage.setItem('ai-config-anthropic', JSON.stringify(anthropicConfig));
                    break;
                case 'local':
                    config = localConfig;
                    localStorage.setItem('ai-config-local', JSON.stringify(localConfig));
                    break;
            }

            const success = await window.electronAPI.ai.setProvider(selectedProvider, config);
            
            if (success) {
                onProviderChange(selectedProvider);
                alert('Конфигурация сохранена успешно!');
                onClose();
            } else {
                alert('Ошибка при сохранении конфигурации. Проверьте настройки.');
            }
        } catch (error) {
            console.error('Failed to save configuration:', error);
            alert('Ошибка при сохранении конфигурации.');
        } finally {
            setIsSaving(false);
        }
    };

    const testConnection = async () => {
        try {
            let config: any = {};
            
            switch (selectedProvider) {
                case 'openai':
                    config = openAIConfig;
                    break;
                case 'anthropic':
                    config = anthropicConfig;
                    break;
                case 'local':
                    config = localConfig;
                    break;
            }

            const success = await window.electronAPI.ai.setProvider(selectedProvider, config);
            
            if (success) {
                alert('Подключение успешно!');
            } else {
                alert('Ошибка подключения. Проверьте настройки.');
            }
        } catch (error) {
            console.error('Connection test failed:', error);
            alert('Ошибка при тестировании подключения.');
        }
    };

    const renderProviderConfig = () => {
        switch (selectedProvider) {
            case 'openai':
                return (
                    <div>
                        <div className="form-group">
                            <label className="form-label">API Key</label>
                            <input
                                type="password"
                                className="form-input"
                                value={openAIConfig.apiKey}
                                onChange={(e) => setOpenAIConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                                placeholder="sk-..."
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Model</label>
                            <select
                                className="form-select"
                                value={openAIConfig.model}
                                onChange={(e) => setOpenAIConfig(prev => ({ ...prev, model: e.target.value }))}
                            >
                                {getModelsByProvider('openai').map(model => (
                                    <option key={model.id} value={model.id}>{model.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Temperature ({openAIConfig.temperature})</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={openAIConfig.temperature}
                                onChange={(e) => setOpenAIConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                                style={{ width: '100%' }}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Max Tokens</label>
                            <input
                                type="number"
                                className="form-input"
                                value={openAIConfig.maxTokens}
                                onChange={(e) => setOpenAIConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                                min="1"
                                max="32000"
                            />
                        </div>
                    </div>
                );

            case 'anthropic':
                return (
                    <div>
                        <div className="form-group">
                            <label className="form-label">API Key</label>
                            <input
                                type="password"
                                className="form-input"
                                value={anthropicConfig.apiKey}
                                onChange={(e) => setAnthropicConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                                placeholder="sk-ant-..."
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Model</label>
                            <select
                                className="form-select"
                                value={anthropicConfig.model}
                                onChange={(e) => setAnthropicConfig(prev => ({ ...prev, model: e.target.value }))}
                            >
                                {getModelsByProvider('anthropic').map(model => (
                                    <option key={model.id} value={model.id}>{model.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Max Tokens</label>
                            <input
                                type="number"
                                className="form-input"
                                value={anthropicConfig.maxTokens}
                                onChange={(e) => setAnthropicConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                                min="1"
                                max="200000"
                            />
                        </div>
                    </div>
                );

            case 'local':
                return (
                    <div>
                        <div className="form-group">
                            <label className="form-label">Endpoint URL</label>
                            <input
                                type="text"
                                className="form-input"
                                value={localConfig.endpoint}
                                onChange={(e) => setLocalConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                                placeholder="http://localhost:11434"
                            />
                            <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                Поддерживается Ollama, LM Studio, LocalAI
                            </small>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Model Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={localConfig.model}
                                onChange={(e) => setLocalConfig(prev => ({ ...prev, model: e.target.value }))}
                                placeholder="llama2, codellama, mistral, etc."
                            />
                        </div>
                        
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={localConfig.useGPU}
                                    onChange={(e) => setLocalConfig(prev => ({ ...prev, useGPU: e.target.checked }))}
                                />
                                Использовать GPU для ускорения
                            </label>
                        </div>
                        
                        {localConfig.useGPU && (
                            <div className="form-group">
                                <label className="form-label">GPU Layers (-1 для всех)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={localConfig.gpuLayers}
                                    onChange={(e) => setLocalConfig(prev => ({ ...prev, gpuLayers: parseInt(e.target.value) }))}
                                    min="-1"
                                    max="100"
                                />
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label className="form-label">Context Window</label>
                            <input
                                type="number"
                                className="form-input"
                                value={localConfig.contextWindow}
                                onChange={(e) => setLocalConfig(prev => ({ ...prev, contextWindow: parseInt(e.target.value) }))}
                                min="512"
                                max="32768"
                            />
                        </div>
                    </div>
                );

            default:
                return (
                    <div style={{ 
                        padding: '20px', 
                        textAlign: 'center', 
                        color: 'var(--text-secondary)' 
                    }}>
                        Выберите провайдера AI
                    </div>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="ai-settings-panel">
                <div className="loading">
                    <div className="spinner"></div>
                    Загрузка...
                </div>
            </div>
        );
    }

    return (
        <div className="ai-settings-panel">
            <div className="modal-header">
                <h2 className="modal-title">AI Settings</h2>
                <button className="modal-close" onClick={onClose}>×</button>
            </div>
            
            <div className="modal-content">
                <div className="form-group">
                    <label className="form-label">AI Provider</label>
                    <select
                        className="form-select"
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                    >
                        <option value="">Выберите провайдера</option>
                        {providers.map(provider => (
                            <option key={provider.id} value={provider.id}>
                                {provider.name} {provider.isConfigured ? '✓' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedProvider && renderProviderConfig()}

                <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    marginTop: '24px',
                    justifyContent: 'flex-end'
                }}>
                    <button 
                        className="button" 
                        onClick={testConnection}
                        disabled={!selectedProvider || isSaving}
                    >
                        Тест соединения
                    </button>
                    <button 
                        className="button primary" 
                        onClick={saveConfiguration}
                        disabled={!selectedProvider || isSaving}
                    >
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AISettings;
