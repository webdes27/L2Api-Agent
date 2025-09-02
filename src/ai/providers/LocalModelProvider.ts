import axios from 'axios';
import { AIProvider, AIMessage, AIResponse, LocalModelConfig } from '../types/AITypes';

export class LocalModelProvider implements AIProvider {
    private endpoint: string = '';
    private model: string = '';
    private useGPU: boolean = true; // По умолчанию используем GPU для локальных моделей
    private gpuLayers: number = -1; // -1 означает использовать все доступные слои на GPU
    private contextWindow: number = 4096;
    private maxTokens: number = 2048;

    public getName(): string {
        return 'Local Model';
    }

    public isConfigured(): boolean {
        return this.endpoint.length > 0;
    }

    public async configure(config: LocalModelConfig): Promise<void> {
        this.endpoint = config.endpoint || '';
        this.model = config.model || '';
        this.useGPU = config.useGPU ?? true;
        this.gpuLayers = config.gpuLayers ?? -1;
        this.contextWindow = config.contextWindow || 4096;
        this.maxTokens = config.maxTokens || 2048;

        // Test the configuration
        if (this.endpoint) {
            await this.testConnection();
        }
    }

    public async sendMessage(messages: AIMessage[], context?: any): Promise<AIResponse> {
        if (!this.isConfigured()) {
            throw new Error('Local model provider is not configured');
        }

        try {
            // Try different local AI server formats
            return await this.tryOllamaFormat(messages) ||
                   await this.tryOpenAICompatibleFormat(messages) ||
                   await this.tryLocalAIFormat(messages);
        } catch (error: any) {
            console.error('Local model request failed:', error);
            throw new Error(`Local model request failed: ${error.message}`);
        }
    }

    private async tryOllamaFormat(messages: AIMessage[]): Promise<AIResponse> {
        try {
            // Ollama API format
            const prompt = this.formatMessagesForOllama(messages);
            
            const response = await axios.post(`${this.endpoint}/api/generate`, {
                model: this.model,
                prompt: prompt,
                stream: false,
                options: {
                    num_gpu: this.useGPU ? this.gpuLayers : 0,
                    num_ctx: this.contextWindow
                }
            });

            return {
                content: response.data.response,
                model: this.model,
                usage: {
                    promptTokens: 0, // Ollama doesn't provide token counts
                    completionTokens: 0,
                    totalTokens: 0
                }
            };
        } catch (error) {
            throw error;
        }
    }

    private async tryOpenAICompatibleFormat(messages: AIMessage[]): Promise<AIResponse> {
        try {
            // OpenAI-compatible format (LM Studio, LocalAI with OpenAI mode)
            const openAIMessages = messages.map(msg => ({
                role: msg.role,
                content: this.formatMessageContent(msg)
            }));

            const response = await axios.post(`${this.endpoint}/v1/chat/completions`, {
                model: this.model,
                messages: openAIMessages,
                max_tokens: this.maxTokens,
                temperature: 0.7
            });

            const choice = response.data.choices[0];
            return {
                content: choice.message.content,
                model: response.data.model || this.model,
                usage: response.data.usage || {
                    promptTokens: 0,
                    completionTokens: 0,
                    totalTokens: 0
                },
                finishReason: choice.finish_reason
            };
        } catch (error) {
            throw error;
        }
    }

    private async tryLocalAIFormat(messages: AIMessage[]): Promise<AIResponse> {
        try {
            // LocalAI specific format
            const prompt = this.formatMessagesForLocalAI(messages);
            
            const response = await axios.post(`${this.endpoint}/completion`, {
                model: this.model,
                prompt: prompt,
                max_tokens: this.maxTokens,
                temperature: 0.7
            });

            return {
                content: response.data.choices[0]?.text || response.data.text || '',
                model: this.model,
                usage: {
                    promptTokens: 0,
                    completionTokens: 0,
                    totalTokens: 0
                }
            };
        } catch (error) {
            throw error;
        }
    }

    public async getModels(): Promise<string[]> {
        try {
            // Try Ollama format first
            const ollamaResponse = await axios.get(`${this.endpoint}/api/tags`);
            if (ollamaResponse.data.models) {
                return ollamaResponse.data.models.map((m: any) => m.name);
            }
        } catch (error) {
            // Ignore and try next format
        }

        try {
            // Try OpenAI-compatible format
            const openAIResponse = await axios.get(`${this.endpoint}/v1/models`);
            if (openAIResponse.data.data) {
                return openAIResponse.data.data.map((m: any) => m.id);
            }
        } catch (error) {
            // Return default if no format works
        }

        return [this.model || 'unknown'];
    }

    public async testConnection(): Promise<boolean> {
        try {
            // Try multiple endpoints to detect the local AI server type
            const endpoints = [
                `${this.endpoint}/api/tags`, // Ollama
                `${this.endpoint}/v1/models`, // OpenAI-compatible
                `${this.endpoint}/health`, // Generic health check
                `${this.endpoint}/` // Root endpoint
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await axios.get(endpoint, { timeout: 5000 });
                    if (response.status === 200) {
                        return true;
                    }
                } catch (error) {
                    // Continue to next endpoint
                }
            }

            return false;
        } catch (error) {
            console.error('Local model connection test failed:', error);
            return false;
        }
    }

    private formatMessagesForOllama(messages: AIMessage[]): string {
        return messages.map(msg => {
            const rolePrefix = msg.role === 'user' ? 'Human: ' : 
                              msg.role === 'assistant' ? 'Assistant: ' : 
                              msg.role === 'system' ? 'System: ' : '';
            return `${rolePrefix}${this.formatMessageContent(msg)}`;
        }).join('\n\n');
    }

    private formatMessagesForLocalAI(messages: AIMessage[]): string {
        // Similar to Ollama but might need different formatting
        return this.formatMessagesForOllama(messages);
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
