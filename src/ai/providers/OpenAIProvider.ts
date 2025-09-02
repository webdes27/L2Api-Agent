import axios from 'axios';
import { AIProvider, AIMessage, AIResponse, AIProviderConfig } from '../types/AITypes';

export class OpenAIProvider implements AIProvider {
    private apiKey: string = '';
    private baseUrl: string = 'https://api.openai.com/v1';
    private model: string = 'gpt-4';
    private temperature: number = 0.7;
    private maxTokens: number = 4000;

    public getName(): string {
        return 'OpenAI';
    }

    public isConfigured(): boolean {
        return this.apiKey.length > 0;
    }

    public async configure(config: AIProviderConfig): Promise<void> {
        this.apiKey = config.apiKey || '';
        this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
        this.model = config.model || 'gpt-4';
        this.temperature = config.temperature ?? 0.7;
        this.maxTokens = config.maxTokens || 4000;

        // Test the configuration
        if (this.apiKey) {
            await this.testConnection();
        }
    }

    public async sendMessage(messages: AIMessage[], context?: any): Promise<AIResponse> {
        if (!this.isConfigured()) {
            throw new Error('OpenAI provider is not configured');
        }

        try {
            // Convert our message format to OpenAI format
            const openAIMessages = messages.map(msg => ({
                role: msg.role,
                content: this.formatMessageContent(msg)
            }));

            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: this.model,
                    messages: openAIMessages,
                    temperature: this.temperature,
                    max_tokens: this.maxTokens,
                    stream: false
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const choice = response.data.choices[0];
            return {
                content: choice.message.content,
                model: response.data.model,
                usage: {
                    promptTokens: response.data.usage.prompt_tokens,
                    completionTokens: response.data.usage.completion_tokens,
                    totalTokens: response.data.usage.total_tokens
                },
                finishReason: choice.finish_reason
            };
        } catch (error: any) {
            console.error('OpenAI API Error:', error.response?.data || error.message);
            throw new Error(`OpenAI API Error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    public async getModels(): Promise<string[]> {
        if (!this.isConfigured()) {
            return ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo-preview'];
        }

        try {
            const response = await axios.get(`${this.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return response.data.data
                .filter((model: any) => model.id.includes('gpt'))
                .map((model: any) => model.id);
        } catch (error) {
            console.error('Failed to fetch OpenAI models:', error);
            return ['gpt-4', 'gpt-3.5-turbo'];
        }
    }

    public async testConnection(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.status === 200;
        } catch (error) {
            console.error('OpenAI connection test failed:', error);
            return false;
        }
    }

    private formatMessageContent(message: AIMessage): string {
        let content = message.content;

        // Add context information if available
        if (message.context?.filePath) {
            content = `File: ${message.context.filePath}\n\n${content}`;
        }

        if (message.context?.selectedCode) {
            content = `${content}\n\nSelected Code:\n\`\`\`\n${message.context.selectedCode}\n\`\`\``;
        }

        return content;
    }
}
