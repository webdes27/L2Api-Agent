import axios from 'axios';
import { AIProvider, AIMessage, AIResponse, AIProviderConfig } from '../types/AITypes';

export class AnthropicProvider implements AIProvider {
    private apiKey: string = '';
    private baseUrl: string = 'https://api.anthropic.com';
    private model: string = 'claude-3-sonnet-20240229';
    private maxTokens: number = 4000;

    public getName(): string {
        return 'Anthropic Claude';
    }

    public isConfigured(): boolean {
        return this.apiKey.length > 0;
    }

    public async configure(config: AIProviderConfig): Promise<void> {
        this.apiKey = config.apiKey || '';
        this.baseUrl = config.baseUrl || 'https://api.anthropic.com';
        this.model = config.model || 'claude-3-sonnet-20240229';
        this.maxTokens = config.maxTokens || 4000;

        // Test the configuration
        if (this.apiKey) {
            await this.testConnection();
        }
    }

    public async sendMessage(messages: AIMessage[], context?: any): Promise<AIResponse> {
        if (!this.isConfigured()) {
            throw new Error('Anthropic provider is not configured');
        }

        try {
            // Convert our message format to Anthropic format
            const anthropicMessages = messages
                .filter(msg => msg.role !== 'system')
                .map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: this.formatMessageContent(msg)
                }));

            // Handle system messages separately
            const systemMessage = messages.find(msg => msg.role === 'system');

            const requestBody: any = {
                model: this.model,
                messages: anthropicMessages,
                max_tokens: this.maxTokens
            };

            if (systemMessage) {
                requestBody.system = systemMessage.content;
            }

            const response = await axios.post(
                `${this.baseUrl}/v1/messages`,
                requestBody,
                {
                    headers: {
                        'x-api-key': this.apiKey,
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01'
                    }
                }
            );

            const content = response.data.content[0]?.text || '';
            
            return {
                content,
                model: response.data.model,
                usage: {
                    promptTokens: response.data.usage?.input_tokens || 0,
                    completionTokens: response.data.usage?.output_tokens || 0,
                    totalTokens: (response.data.usage?.input_tokens || 0) + (response.data.usage?.output_tokens || 0)
                },
                finishReason: response.data.stop_reason
            };
        } catch (error: any) {
            console.error('Anthropic API Error:', error.response?.data || error.message);
            throw new Error(`Anthropic API Error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    public async getModels(): Promise<string[]> {
        return [
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307',
            'claude-2.1',
            'claude-2.0'
        ];
    }

    public async testConnection(): Promise<boolean> {
        try {
            // Anthropic doesn't have a models endpoint, so we'll send a minimal message
            const response = await axios.post(
                `${this.baseUrl}/v1/messages`,
                {
                    model: this.model,
                    messages: [{ role: 'user', content: 'Hi' }],
                    max_tokens: 10
                },
                {
                    headers: {
                        'x-api-key': this.apiKey,
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01'
                    }
                }
            );
            return response.status === 200;
        } catch (error) {
            console.error('Anthropic connection test failed:', error);
            return false;
        }
    }

    private formatMessageContent(message: AIMessage): string {
        let content = message.content;

        // Add context information if available
        if (message.context.filePath) {
            content = `File: ${message.context.filePath}\n\n${content}`;
        }

        if (message.context.selectedCode) {
            content = `${content}\n\nSelected Code:\n\`\`\`\n${message.context.selectedCode}\n\`\`\``;
        }

        return content;
    }
}
