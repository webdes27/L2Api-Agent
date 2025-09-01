import React, { useState, useEffect } from 'react';
import { AI_MODELS, getModelsByProvider } from '../types/AIModels';

interface ErrorDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onClose: () => void;
}



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
    // ErrorDialog component
    const ErrorDialog: React.FC<ErrorDialogProps> = ({ isOpen, title, message, onClose: onDialogClose }) => {
        if (!isOpen) return null;

        return (
            <div className="modal-overlay" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000
            }}>
                <div className="modal-content" style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '20px',
                    maxWidth: '400px',
                    width: '90%',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '15px'
                    }}>
                        <h3 style={{
                            margin: 0,
                            color: 'var(--text-primary)',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            {title}
                        </h3>
                        <button
                            onClick={onDialogClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                fontSize: '18px',
                                cursor: 'pointer',
                                padding: '0',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <p style={{
                        margin: '0 0 20px 0',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        lineHeight: '1.5'
                    }}>
                        {message}
                    </p>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            onClick={onDialogClose}
                            style={{
                                backgroundColor: 'var(--accent-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    const [providers, setProviders] = useState<AIProvider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorDialog, setErrorDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({
        isOpen: false,
        title: '',
        message: ''
    });
    
    // Provider configurations
    const [openAIConfig, setOpenAIConfig] = useState({
        apiKey: '',
        model: 'gpt-5',
        temperature: 0.7,
        maxTokens: 4000
    });

    const [anthropicConfig, setAnthropicConfig] = useState({
        apiKey: '',
        model: 'claude-4.1-opus',
        maxTokens: 4000
    });

    const [googleConfig, setGoogleConfig] = useState({
        apiKey: '',
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.95,
        topK: 40
    });

    const [localConfig, setLocalConfig] = useState({
        endpoint: 'http://localhost:11434',
        model: '',
        useGPU: true,
        gpuLayers: -1,
        contextWindow: 4096
    });

    const [g4fConfig, setG4fConfig] = useState({
        serverUrl: 'http://localhost:8080',
        apiKey: '',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.95,
        topK: 40,
        timeout: 30000
    });

    useEffect(() => {
        loadProviders();
        loadSavedConfigurations();
    }, []);

    const loadProviders = async () => {
        console.log('AISettings: loadProviders called');
        try {
            const providerList = await window.electronAPI.ai.getProviders();
            console.log('AISettings: providerList:', providerList);
            setProviders(providerList);
            
            // Set first configured provider as selected
            const configured = providerList.find((p: any) => p.isConfigured);
            console.log('AISettings: configured provider:', configured);
            if (configured) {
                console.log('AISettings: Setting selectedProvider to:', configured.id);
                setSelectedProvider(configured.id);
            }
        } catch (error) {
            console.error('Failed to load providers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSavedConfigurations = () => {
        console.log('AISettings: loadSavedConfigurations called');
        // Load from localStorage or electron-store
        const savedOpenAI = localStorage.getItem('ai-config-openai');
        console.log('AISettings: savedOpenAI:', savedOpenAI ? 'exists' : 'not found');
        if (savedOpenAI) {
            setOpenAIConfig(JSON.parse(savedOpenAI));
        }

        const savedAnthropic = localStorage.getItem('ai-config-anthropic');
        console.log('AISettings: savedAnthropic:', savedAnthropic ? 'exists' : 'not found');
        if (savedAnthropic) {
            setAnthropicConfig(JSON.parse(savedAnthropic));
        }

        const savedGoogle = localStorage.getItem('ai-config-google');
        console.log('AISettings: savedGoogle:', savedGoogle ? 'exists' : 'not found');
        if (savedGoogle) {
            setGoogleConfig(JSON.parse(savedGoogle));
        }

        const savedLocal = localStorage.getItem('ai-config-local');
        console.log('AISettings: savedLocal:', savedLocal ? 'exists' : 'not found');
        if (savedLocal) {
            setLocalConfig(JSON.parse(savedLocal));
        }

        const savedG4F = localStorage.getItem('ai-config-g4f');
        console.log('AISettings: savedG4F:', savedG4F ? 'exists' : 'not found');
        if (savedG4F) {
            setG4fConfig(JSON.parse(savedG4F));
        }
    };

    const saveConfiguration = async () => {
        console.log('AISettings: saveConfiguration called');
        console.log('AISettings: selectedProvider:', selectedProvider);
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
                case 'google':
                    config = googleConfig;
                    localStorage.setItem('ai-config-google', JSON.stringify(googleConfig));
                    break;
                case 'local':
                    config = localConfig;
                    localStorage.setItem('ai-config-local', JSON.stringify(localConfig));
                    break;
                case 'g4f':
                    config = g4fConfig;
                    localStorage.setItem('ai-config-g4f', JSON.stringify(g4fConfig));
                    break;
            }

            console.log('AISettings: About to call setProvider with:', { selectedProvider, config: { ...config, apiKey: config.apiKey ? '***' : 'undefined' } });
            const success = await window.electronAPI.ai.setProvider(selectedProvider, config);
            console.log('AISettings: setProvider returned:', success);
            
            if (success) {
                // Сохраняем ID текущего провайдера в localStorage
                localStorage.setItem('ai-current-provider', selectedProvider);
                console.log('AISettings: Saved current provider to localStorage:', selectedProvider);
                
                // Загружаем провайдер в main процесс
                try {
                    // @ts-ignore - loadProvider method exists but TypeScript doesn't see it
                    const loadResult = await window.electronAPI.ai.loadProvider(selectedProvider);
                    console.log('AISettings: Load provider result:', loadResult);
                } catch (error) {
                    console.error('AISettings: Failed to load provider in main process:', error);
                }
                
                onProviderChange(selectedProvider);
                setErrorDialog({
                    isOpen: true,
                    title: 'Успех',
                    message: 'Конфигурация сохранена успешно!'
                });
                setTimeout(() => {
                    setErrorDialog({ isOpen: false, title: '', message: '' });
                    onClose();
                }, 1500);
            } else {
                setErrorDialog({
                    isOpen: true,
                    title: 'Ошибка сохранения',
                    message: 'Ошибка при сохранении конфигурации. Проверьте настройки.'
                });
            }
        } catch (error) {
            console.error('Failed to save configuration:', error);
            setErrorDialog({
                isOpen: true,
                title: 'Ошибка сохранения',
                message: 'Ошибка при сохранении конфигурации.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const testConnection = async () => {
        console.log('AISettings: testConnection called');
        console.log('AISettings: selectedProvider:', selectedProvider);
        try {
            let config: any = {};
            
            switch (selectedProvider) {
                case 'openai':
                    config = openAIConfig;
                    break;
                case 'anthropic':
                    config = anthropicConfig;
                    break;
                case 'google':
                    config = googleConfig;
                    break;
                case 'local':
                    config = localConfig;
                    break;
                case 'g4f':
                    config = g4fConfig;
                    break;
            }

            console.log('AISettings: About to call setProvider for test with:', { selectedProvider, config: { ...config, apiKey: config.apiKey ? '***' : 'undefined' } });
            const success = await window.electronAPI.ai.setProvider(selectedProvider, config);
            console.log('AISettings: testConnection setProvider returned:', success);
            
            if (success) {
                // Теперь реально тестируем подключение
                try {
                    // @ts-ignore - testConnection method exists but TypeScript doesn't see it
                    const testResult = await window.electronAPI.ai.testConnection();
                    console.log('AISettings: testConnection result:', testResult);
                    
                    if (testResult) {
                        setErrorDialog({
                            isOpen: true,
                            title: 'Успех',
                            message: 'Подключение успешно! Сервер доступен и отвечает.'
                        });
                    } else {
                        setErrorDialog({
                            isOpen: true,
                            title: 'Ошибка подключения',
                            message: 'Сервер недоступен. Проверьте URL и убедитесь, что сервер запущен.'
                        });
                    }
                } catch (testError) {
                    console.error('AISettings: Connection test failed:', testError);
                    setErrorDialog({
                        isOpen: true,
                        title: 'Ошибка подключения',
                        message: `Ошибка при тестировании: ${testError instanceof Error ? testError.message : 'Неизвестная ошибка'}`
                    });
                }
            } else {
                setErrorDialog({
                    isOpen: true,
                    title: 'Ошибка конфигурации',
                    message: 'Не удалось настроить провайдера. Проверьте параметры.'
                });
            }
        } catch (error) {
            console.error('Connection test failed:', error);
            setErrorDialog({
                isOpen: true,
                title: 'Ошибка подключения',
                message: 'Ошибка при тестировании подключения.'
            });
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

            case 'google':
                return (
                    <div>
                        <div className="form-group">
                            <label className="form-label">API Key</label>
                            <input
                                type="password"
                                className="form-input"
                                value={googleConfig.apiKey}
                                onChange={(e) => setGoogleConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                                placeholder="AIzaSy..."
                            />
                            <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                Получите API ключ в <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
                            </small>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Model</label>
                            <select
                                className="form-select"
                                value={googleConfig.model}
                                onChange={(e) => setGoogleConfig(prev => ({ ...prev, model: e.target.value }))}
                            >
                                {getModelsByProvider('google').map(model => (
                                    <option key={model.id} value={model.id}>{model.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Temperature: {googleConfig.temperature}</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={googleConfig.temperature}
                                onChange={(e) => setGoogleConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                                style={{ width: '100%' }}
                            />
                            <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                Контролирует креативность ответов
                            </small>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Max Tokens</label>
                            <input
                                type="number"
                                className="form-input"
                                value={googleConfig.maxTokens}
                                onChange={(e) => setGoogleConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                                min="1"
                                max="2048"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Top P: {googleConfig.topP}</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={googleConfig.topP}
                                onChange={(e) => setGoogleConfig(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                                style={{ width: '100%' }}
                            />
                            <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                Контролирует разнообразие ответов
                            </small>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Top K</label>
                            <input
                                type="number"
                                className="form-input"
                                value={googleConfig.topK}
                                onChange={(e) => setGoogleConfig(prev => ({ ...prev, topK: parseInt(e.target.value) }))}
                                min="1"
                                max="100"
                            />
                            <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                Количество рассматриваемых токенов (1-100)
                            </small>
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

            case 'g4f':
                return (
                    <div>
                        <div className="form-group">
                            <label className="form-label">API Key</label>
                            <input
                            type="password"
                            className="form-input"
                            value={g4fConfig.apiKey}
                            onChange={(e) => setG4fConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                            placeholder="Введите ваш API ключ"
                        />
                            <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                API ключ для аутентификации на G4F сервере
                            </small>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Server URL</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={g4fConfig.serverUrl}
                                    onChange={(e) => setG4fConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
                                    placeholder="http://localhost:8080"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="button"
                                    onClick={() => setG4fConfig(prev => ({ ...prev, serverUrl: 'http://localhost:8000' }))}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                >
                                    8000
                                </button>
                                <button
                                    type="button"
                                    className="button"
                                    onClick={() => setG4fConfig(prev => ({ ...prev, serverUrl: 'http://localhost:8080' }))}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                >
                                    8080
                                </button>
                                <button
                                    type="button"
                                    className="button"
                                    onClick={() => setG4fConfig(prev => ({ ...prev, serverUrl: 'http://127.0.0.1:8080' }))}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                >
                                    127.0.0.1
                                </button>
                            </div>
                            <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                URL вашего GPT4Free сервера. По умолчанию используется порт 8080.
                            </small>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Model</label>
                            <select
                                className="form-select"
                                value={g4fConfig.model}
                                onChange={(e) => setG4fConfig(prev => ({ ...prev, model: e.target.value }))}
                            >
                                {getModelsByProvider('g4f').map(model => (
                                    <option key={model.id} value={model.id}>{model.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Temperature: {g4fConfig.temperature}</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={g4fConfig.temperature}
                                onChange={(e) => setG4fConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                                style={{ width: '100%' }}
                            />
                            <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                Контролирует креативность ответов
                            </small>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Max Tokens</label>
                            <input
                                type="number"
                                className="form-input"
                                value={g4fConfig.maxTokens}
                                onChange={(e) => setG4fConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                                min="1"
                                max="8192"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Top P: {g4fConfig.topP}</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={g4fConfig.topP}
                                onChange={(e) => setG4fConfig(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                                style={{ width: '100%' }}
                            />
                            <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                Контролирует разнообразие ответов
                            </small>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Top K</label>
                            <input
                                type="number"
                                className="form-input"
                                value={g4fConfig.topK}
                                onChange={(e) => setG4fConfig(prev => ({ ...prev, topK: parseInt(e.target.value) }))}
                                min="1"
                                max="100"
                            />
                            <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                Количество рассматриваемых токенов (1-100)
                            </small>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Timeout (ms)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={g4fConfig.timeout}
                                onChange={(e) => setG4fConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                                min="5000"
                                max="120000"
                                step="1000"
                            />
                            <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                Таймаут запроса в миллисекундах
                            </small>
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
        <>
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
            
            <ErrorDialog
                isOpen={errorDialog.isOpen}
                title={errorDialog.title}
                message={errorDialog.message}
                onClose={() => setErrorDialog({ isOpen: false, title: '', message: '' })}
            />
        </>
    );
};

export default AISettings;
