import { AIProvider, AIMessage, AIResponse, AIProviderConfig } from '../types/AITypes';
import { GeminiProvider, GeminiConfig, GeminiMessage } from './GeminiProvider';

export class GeminiAIProvider implements AIProvider {
    private geminiProvider: GeminiProvider | null = null;
    private config: GeminiConfig | null = null;

    getName(): string {
        return 'Google Gemini';
    }

    isConfigured(): boolean {
        return this.config !== null && this.config.apiKey !== undefined && this.config.apiKey !== '';
    }

    async configure(config: AIProviderConfig): Promise<void> {
        if (!config.apiKey) {
            throw new Error('API key is required for Gemini');
        }

        this.config = {
            apiKey: config.apiKey,
            model: config.model || 'gemini-1.5-pro-latest',
            maxTokens: config.maxTokens || 2048,
            temperature: config.temperature || 0.7,
            topP: config.topP || 0.95,
            topK: config.topK || 40
        };

        this.geminiProvider = new GeminiProvider(this.config);

        // Test the configuration
        try {
            const isValid = await this.geminiProvider.validateApiKey();
            if (!isValid) {
                throw new Error('Invalid Gemini API key');
            }
        } catch (error) {
            throw new Error(`Failed to configure Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async sendMessage(messages: AIMessage[], context?: any): Promise<AIResponse> {
        if (!this.geminiProvider || !this.config) {
            throw new Error('Gemini provider not configured');
        }

        try {
            // Convert AIMessage[] to GeminiMessage[]
            const geminiMessages: GeminiMessage[] = messages
                .filter(msg => msg.role !== 'system') // Gemini doesn't have system role
                .map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));

            // Extract system prompt from system messages
            const systemMessages = messages.filter(msg => msg.role === 'system');
            const systemPrompt = systemMessages.length > 0 
                ? systemMessages.map(msg => msg.content).join('\n\n')
                : undefined;

            // Add context information to the last user message if provided
            if (context && geminiMessages.length > 0) {
                const lastMessage = geminiMessages[geminiMessages.length - 1];
                if (lastMessage.role === 'user' && lastMessage.parts[0].text) {
                    let contextualPrompt = lastMessage.parts[0].text;
                    
                    if (context.filePath) {
                        contextualPrompt += `\n\nFile: ${context.filePath}`;
                    }
                    if (context.selectedCode) {
                        contextualPrompt += `\n\nSelected code:\n\`\`\`\n${context.selectedCode}\n\`\`\``;
                    }
                    if (context.projectPath) {
                        contextualPrompt += `\n\nProject: ${context.projectPath}`;
                    }
                    
                    lastMessage.parts[0].text = contextualPrompt;
                }
            }

            const response = await this.geminiProvider.generateContent(geminiMessages, systemPrompt);

            return {
                content: response,
                model: this.config.model,
                finishReason: 'stop',
                metadata: {
                    provider: 'gemini',
                    timestamp: Date.now()
                }
            };

        } catch (error) {
            console.error('Gemini request failed:', error);
            throw new Error(`Gemini request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async sendMessageWithImage(messages: AIMessage[], imageData: string, mimeType: string, context?: any): Promise<AIResponse> {
        if (!this.geminiProvider || !this.config) {
            throw new Error('Gemini provider not configured');
        }

        try {
            // Get the last user message
            const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
            if (!lastUserMessage) {
                throw new Error('No user message found for image analysis');
            }

            let prompt = lastUserMessage.content;
            
            // Add context if provided
            if (context) {
                if (context.filePath) {
                    prompt += `\n\nFile: ${context.filePath}`;
                }
                if (context.projectPath) {
                    prompt += `\n\nProject: ${context.projectPath}`;
                }
            }

            // Extract system prompt from system messages
            const systemMessages = messages.filter(msg => msg.role === 'system');
            const systemPrompt = systemMessages.length > 0 
                ? systemMessages.map(msg => msg.content).join('\n\n')
                : undefined;

            const response = await this.geminiProvider.generateContentWithImage(
                prompt,
                imageData,
                mimeType,
                systemPrompt
            );

            return {
                content: response,
                model: this.config.model,
                finishReason: 'stop',
                metadata: {
                    provider: 'gemini',
                    timestamp: Date.now(),
                    hasImage: true
                }
            };

        } catch (error) {
            console.error('Gemini image request failed:', error);
            throw new Error(`Gemini image request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getModels(): Promise<string[]> {
        return GeminiProvider.getAvailableModels();
    }

    async testConnection(): Promise<boolean> {
        if (!this.geminiProvider) {
            return false;
        }

        try {
            return await this.geminiProvider.validateApiKey();
        } catch (error) {
            console.error('Gemini connection test failed:', error);
            return false;
        }
    }

    // Дополнительные методы для Gemini

    supportsImages(model?: string): boolean {
        const modelToCheck = model || this.config?.model || '';
        return GeminiProvider.supportsImages(modelToCheck);
    }

    updateConfig(newConfig: Partial<GeminiConfig>): void {
        if (this.config && this.geminiProvider) {
            this.config = { ...this.config, ...newConfig };
            this.geminiProvider.updateConfig(newConfig);
        }
    }

    getConfig(): GeminiConfig | null {
        return this.config;
    }
}
