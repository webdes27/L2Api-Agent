import axios from 'axios';

export interface G4FConfig {
    serverUrl: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    timeout?: number;
}

export interface G4FMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface G4FResponse {
    content: string;
    model: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export class G4FProvider {
    private config: G4FConfig;
    private defaultServerUrl = 'http://localhost:1337';

    constructor(config: G4FConfig) {
        this.config = {
            serverUrl: config.serverUrl || this.defaultServerUrl,
            model: config.model,
            maxTokens: config.maxTokens || 2048,
            temperature: config.temperature || 0.7,
            topP: config.topP || 0.95,
            topK: config.topK || 40,
            timeout: config.timeout || 30000
        };
    }

    async generateContent(
        messages: G4FMessage[],
        systemPrompt?: string
    ): Promise<string> {
        try {
            console.log('G4FProvider.generateContent: Starting request...');
            console.log('G4FProvider.generateContent: Model:', this.config.model);
            console.log('G4FProvider.generateContent: Server URL:', this.config.serverUrl);
            console.log('G4FProvider.generateContent: Messages count:', messages.length);

            // Подготавливаем сообщения
            const requestMessages: G4FMessage[] = [];
            
            if (systemPrompt) {
                requestMessages.push({
                    role: 'system',
                    content: systemPrompt
                });
            }

            requestMessages.push(...messages);

            const requestBody = {
                model: this.config.model,
                messages: requestMessages,
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature,
                top_p: this.config.topP,
                top_k: this.config.topK,
                stream: false
            };

            console.log('G4FProvider.generateContent: Request URL:', `${this.config.serverUrl}/v1/chat/completions`);
            console.log('G4FProvider.generateContent: Request body:', JSON.stringify(requestBody, null, 2));

            const response = await axios.post<{ choices: Array<{ message: { content: string } }> }>(
                `${this.config.serverUrl}/v1/chat/completions`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: this.config.timeout
                }
            );

            if (!response.data.choices || response.data.choices.length === 0) {
                throw new Error('No response from G4F server');
            }

            const choice = response.data.choices[0];
            if (!choice.message || !choice.message.content) {
                throw new Error('Invalid response format from G4F server');
            }

            return choice.message.content;

        } catch (error) {
            console.error('G4F API error:', error);
            console.error('Error details:', {
                isAxiosError: axios.isAxiosError(error),
                status: axios.isAxiosError(error) ? error.response?.status : 'N/A',
                statusText: axios.isAxiosError(error) ? error.response?.statusText : 'N/A',
                data: axios.isAxiosError(error) ? error.response?.data : 'N/A',
                message: error instanceof Error ? error.message : 'Unknown error'
            });

            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNREFUSED') {
                    throw new Error('G4F server is not running. Please start the server first.');
                } else if (error.response?.status === 404) {
                    throw new Error('G4F server endpoint not found. Check server configuration.');
                } else if (error.response?.status === 500) {
                    throw new Error('G4F server internal error. Check server logs.');
                } else if (error.response?.status === 400) {
                    const errorMessage = error.response.data?.error?.message || 'Bad request to G4F server';
                    throw new Error(`G4F API error: ${errorMessage}`);
                }
            }

            throw new Error(`Failed to get response from G4F: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    updateConfig(newConfig: Partial<G4FConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    getConfig(): G4FConfig {
        return { ...this.config };
    }

    // Метод для получения доступных моделей
    static getAvailableModels(): string[] {
        return [
            // GPT-5 Models (Microsoft Copilot, Api.Airforce, Pollinations AI)
            'gpt-5',
            'gpt-5-mini',
            'gpt-5-nano',
            'gpt-5-nano-2025-08-07',
            'gpt-5-chat',
            'gpt-4.1-2025-04-14',
            
            // OpenAI Models
            'gpt-3.5-turbo',
            'gpt-4',
            'gpt-4-turbo',
            'gpt-4o',
            'gpt-4o-mini',
            'openai/gpt-oss-120b',
            
            // Anthropic Models
            'claude-3-haiku',
            'claude-3-sonnet',
            'claude-3-opus',
            'claude-3.5-sonnet',
            
            // Google Models
            'gemini-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-2.5-pro',
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite',
            
            // Meta Models
            'llama-2-7b',
            'llama-2-13b',
            'llama-2-70b',
            'llama-3-8b',
            'llama-3-70b',
            
            // Mistral Models
            'mistral-7b',
            'mixtral-8x7b',
            'mistral-large',
            
            // DeepSeek Models
            'deepseek-ai/DeepSeek-V3',
            'deepseek-ai/DeepSeek-V3.1',
            'deepseek-ai/DeepSeek-R1',
            'deepseek-ai/DeepSeek-R1-0528',
            'deepseek-ai/deepseek-r1-distill-qwen-32b',
            
            // Qwen Models
            'Qwen/Qwen3-Coder-30B-A3B-Instruct',
            'Qwen/Qwen3-Coder-480B-A35B-Instruct',
            'Qwen/Qwen2.5-Coder-32B-Instruct',
            'Qwen/Qwen3-235B-A22B-fp8-tput',
            
            // NousResearch Models
            'NousResearch/Hermes-4-405B',
            
            // Code Models
            'codellama-7b',
            'codellama-13b',
            'codellama-34b',
            'deepseek-coder',
            'wizardcoder',
            'phind-codellama',
            
            // Other Models
            'solar-10.7b',
            'qwen-7b',
            'qwen-14b',
            'qwen-72b',
            'yi-6b',
            'yi-34b',
            'neural-chat',
            'orca-mini',
            'vicuna-7b',
            'vicuna-13b',
            'vicuna-33b',
            'openchat',
            'chatglm2',
            'chatglm3',
            'baichuan-7b',
            'baichuan-13b',
            'internlm-7b',
            'internlm-20b',
            'falcon-7b',
            'falcon-40b',
            'mpt-7b',
            'mpt-30b',
            'redpajama-7b',
            'redpajama-13b',
            'dolly-v2-3b',
            'dolly-v2-7b',
            'dolly-v2-12b',
            'stablelm-3b',
            'stablelm-7b',
            'stablelm-zephyr',
            'phi-2',
            'phi-3-mini',
            'phi-3-medium',
            'phi-3-small',
            'tinyllama',
            
            // Nous Hermes 2 Models
            'nous-hermes-2-mixtral',
            'nous-hermes-2-yi',
            'nous-hermes-2-solar',
            'nous-hermes-2-llama',
            'nous-hermes-2-mistral',
            'nous-hermes-2-codellama',
            'nous-hermes-2-deepseek',
            'nous-hermes-2-qwen',
            'nous-hermes-2-yi-6b',
            'nous-hermes-2-yi-34b',
            'nous-hermes-2-llama-2-7b',
            'nous-hermes-2-llama-2-13b',
            'nous-hermes-2-llama-2-70b',
            'nous-hermes-2-llama-3-8b',
            'nous-hermes-2-llama-3-70b',
            'nous-hermes-2-mistral-7b',
            'nous-hermes-2-mixtral-8x7b',
            'nous-hermes-2-mistral-large',
            'nous-hermes-2-codellama-7b',
            'nous-hermes-2-codellama-13b',
            'nous-hermes-2-codellama-34b',
            'nous-hermes-2-deepseek-coder',
            'nous-hermes-2-wizardcoder',
            'nous-hermes-2-phind-codellama',
            'nous-hermes-2-solar-10.7b',
            'nous-hermes-2-qwen-7b',
            'nous-hermes-2-qwen-14b',
            'nous-hermes-2-qwen-72b',
            'nous-hermes-2-neural-chat',
            'nous-hermes-2-orca-mini',
            'nous-hermes-2-vicuna-7b',
            'nous-hermes-2-vicuna-13b',
            'nous-hermes-2-vicuna-33b',
            'nous-hermes-2-openchat',
            'nous-hermes-2-chatglm2',
            'nous-hermes-2-chatglm3',
            'nous-hermes-2-baichuan-7b',
            'nous-hermes-2-baichuan-13b',
            'nous-hermes-2-internlm-7b',
            'nous-hermes-2-internlm-20b',
            'nous-hermes-2-falcon-7b',
            'nous-hermes-2-falcon-40b',
            'nous-hermes-2-mpt-7b',
            'nous-hermes-2-mpt-30b',
            'nous-hermes-2-redpajama-7b',
            'nous-hermes-2-redpajama-13b',
            'nous-hermes-2-dolly-v2-3b',
            'nous-hermes-2-dolly-v2-7b',
            'nous-hermes-2-dolly-v2-12b',
            'nous-hermes-2-stablelm-3b',
            'nous-hermes-2-stablelm-7b',
            'nous-hermes-2-stablelm-zephyr',
            'nous-hermes-2-phi-2',
            'nous-hermes-2-phi-3-mini',
            'nous-hermes-2-phi-3-medium',
            'nous-hermes-2-phi-3-small',
            'nous-hermes-2-tinyllama'
        ];
    }

    // Проверка поддержки изображений моделью
    static supportsImages(model: string): boolean {
        return model.includes('vision') || 
               model.includes('gpt-4') ||
               model.includes('claude-3') ||
               model.includes('gemini');
    }

    // Проверка валидности подключения к серверу
    async validateConnection(): Promise<boolean> {
        try {
            console.log('G4FProvider.validateConnection: Testing connection...');
            console.log('G4FProvider.validateConnection: Server URL:', this.config.serverUrl);

            const response = await axios.get(`${this.config.serverUrl}/v1/models`, {
                timeout: 10000
            });

            console.log('G4FProvider.validateConnection: Connection successful');
            return true;
        } catch (error) {
            console.error('G4FProvider.validateConnection: Connection failed:', error);
            return false;
        }
    }

    // Получение списка доступных моделей с сервера
    async getServerModels(): Promise<string[]> {
        try {
            const response = await axios.get(`${this.config.serverUrl}/v1/models`, {
                timeout: 10000
            });

            if (response.data && response.data.data) {
                return response.data.data.map((model: any) => model.id);
            }

            return [];
        } catch (error) {
            console.error('G4FProvider.getServerModels: Failed to get models:', error);
            return [];
        }
    }
}
