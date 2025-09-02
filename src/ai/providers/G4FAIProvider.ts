import { AIProvider, AIProviderConfig, AIMessage, AIResponse } from '../types/AITypes';
import { G4FProvider, G4FConfig, G4FMessage } from './G4FProvider';

export class G4FAIProvider implements AIProvider {
    private g4fProvider: G4FProvider;
    private configured = false;

    constructor() {
        this.g4fProvider = new G4FProvider({
            serverUrl: 'http://localhost:1337',
            model: 'gpt-3.5-turbo'
        });
    }

    getName(): string {
        return 'GPT4Free (G4F)';
    }

    isConfigured(): boolean {
        return this.configured;
    }

    async configure(config: AIProviderConfig): Promise<void> {
        try {
            console.log('G4FAIProvider.configure: Starting configuration...');
            console.log('G4FAIProvider.configure: Config:', config);

            const g4fConfig: G4FConfig = {
                serverUrl: config.serverUrl || config.baseUrl || 'http://localhost:8080',
                apiKey: config.apiKey,
                model: config.model || 'gpt-3.5-turbo',
                maxTokens: config.maxTokens || 2048,
                temperature: config.temperature || 0.7,
                topP: config.topP || 0.95,
                topK: config.topK || 40,
                timeout: config.timeout || 30000
            };

            console.log('G4FAIProvider.configure: Mapped G4F config:', g4fConfig);

            this.g4fProvider = new G4FProvider(g4fConfig);
            
            this.configured = true;
            console.log('G4FAIProvider.configure: Configuration successful');

        } catch (error) {
            console.error('G4FAIProvider.configure: Configuration failed:', error);
            throw error;
        }
    }

    async sendMessage(messages: AIMessage[], context?: any): Promise<AIResponse> {
        if (!this.configured) {
            throw new Error('G4F provider is not configured');
        }

        try {
            console.log('G4FAIProvider.sendMessage: Sending messages...');
            console.log('G4FAIProvider.sendMessage: Messages count:', messages.length);
            console.log('G4FAIProvider.sendMessage: Context:', context);

            // Используем модель из контекста, если она указана, иначе используем модель из конфигурации
            const modelToUse = context?.selectedModel || this.g4fProvider.getConfig().model;
            console.log('G4FAIProvider.sendMessage: Using model:', modelToUse);

            // Конвертируем AIMessage в G4FMessage
            const g4fMessages: G4FMessage[] = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Создаем временную конфигурацию с выбранной моделью
            const tempConfig = this.g4fProvider.getConfig();
            const originalModel = tempConfig.model;
            
            // Временно изменяем модель в провайдере
            this.g4fProvider.updateConfig({ model: modelToUse });

            try {
                const response = await this.g4fProvider.generateContent(g4fMessages);
                console.log('G4FAIProvider.sendMessage: Response received, length:', response.length);
                
                return {
                    content: response,
                    model: modelToUse
                };
            } finally {
                // Восстанавливаем оригинальную модель
                this.g4fProvider.updateConfig({ model: originalModel });
            }

        } catch (error) {
            console.error('G4FAIProvider.sendMessage: Failed to send message:', error);
            throw error;
        }
    }

    async getModels(): Promise<string[]> {
        return Promise.resolve(G4FProvider.getAvailableModels());
    }

    async testConnection(): Promise<boolean> {
        if (!this.configured) {
            console.error('G4FAIProvider.testConnection: Provider not configured');
            return false;
        }

        try {
            console.log('G4FAIProvider.testConnection: Testing connection...');
            console.log('G4FAIProvider.testConnection: Server URL:', this.g4fProvider.getConfig().serverUrl);
            
            const isConnected = await this.g4fProvider.validateConnection();
            if (!isConnected) {
                console.error('G4FAIProvider.testConnection: Connection test failed - server not reachable');
                return false;
            }

            console.log('G4FAIProvider.testConnection: Server connection successful, testing message...');

            // Отправляем тестовое сообщение
            const testMessage: AIMessage = {
                role: 'user',
                content: 'Hello, this is a test message.'
            };

            const response = await this.sendMessage([testMessage]);
            
            console.log('G4FAIProvider.testConnection: Test successful, response length:', response.content.length);
            return true;

        } catch (error) {
            console.error('G4FAIProvider.testConnection: Test failed:', error);
            if (error instanceof Error) {
                console.error('G4FAIProvider.testConnection: Error message:', error.message);
            }
            return false;
        }
    }

    // Получение списка моделей с сервера
    async getServerModels(): Promise<string[]> {
        if (!this.configured) {
            return [];
        }

        try {
            return await this.g4fProvider.getServerModels();
        } catch (error) {
            console.error('G4FAIProvider.getServerModels: Failed to get server models:', error);
            return [];
        }
    }

    // Диагностика доступных эндпоинтов
    async diagnoseEndpoints(): Promise<{ available: string[], errors: any[] }> {
        if (!this.configured) {
            return { available: [], errors: ['Provider not configured'] };
        }

        try {
            return await this.g4fProvider.diagnoseEndpoints();
        } catch (error) {
            console.error('G4FAIProvider.diagnoseEndpoints: Failed to diagnose endpoints:', error);
            return { available: [], errors: [error instanceof Error ? error.message : 'Unknown error'] };
        }
    }

    static supportsImages(model: string): boolean {
        return G4FProvider.supportsImages(model);
    }
}
