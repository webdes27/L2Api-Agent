import axios from 'axios';

export interface G4FConfig {
    serverUrl: string;
    apiKey?: string;
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
            apiKey: config.apiKey,
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

            const requestUrl = `${this.config.serverUrl}/v1/chat/completions`;
            console.log('G4FProvider.generateContent: Request URL:', requestUrl);
            console.log('G4FProvider.generateContent: Request body:', JSON.stringify(requestBody, null, 2));

            // Сначала проверяем, доступен ли сервер
            try {
                const headers: any = {};
                
                // Добавляем Authorization заголовок если есть API ключ
                if (this.config.apiKey) {
                    headers['Authorization'] = `Bearer ${this.config.apiKey}`;
                }

                // Пробуем разные эндпоинты для проверки доступности сервера
                try {
                    await axios.get(`${this.config.serverUrl}/v1/models`, { 
                        headers,
                        timeout: 5000 
                    });
                    console.log('G4FProvider.generateContent: Server is reachable via /v1/models');
                } catch (modelsError) {
                    console.log('G4FProvider.generateContent: /v1/models not available, trying root endpoint...');
                    
                    // Пробуем корневой эндпоинт
                    try {
                        await axios.get(`${this.config.serverUrl}/`, { 
                            headers,
                            timeout: 5000 
                        });
                        console.log('G4FProvider.generateContent: Server is reachable via root endpoint');
                    } catch (rootError) {
                        console.log('G4FProvider.generateContent: Root endpoint also not available, but server responds');
                        // Сервер отвечает, просто эндпоинты могут быть другими
                    }
                }
            } catch (pingError) {
                console.error('G4FProvider.generateContent: Server ping failed:', pingError);
                if (axios.isAxiosError(pingError) && pingError.code === 'ECONNREFUSED') {
                    throw new Error(`G4F server is not running at ${this.config.serverUrl}. Please check the server URL and ensure the server is started.`);
                }
            }

            const headers: any = {
                'Content-Type': 'application/json'
            };

            // Добавляем Authorization заголовок если есть API ключ
            if (this.config.apiKey) {
                headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            }

            const response = await axios.post<{ choices: Array<{ message: { content: string } }> }>(
                requestUrl,
                requestBody,
                {
                    headers,
                    timeout: this.config.timeout
                }
            );

            console.log('G4FProvider.generateContent: Response received, status:', response.status);
            console.log('G4FProvider.generateContent: Response data:', response.data);

            if (!response.data.choices || response.data.choices.length === 0) {
                throw new Error('No response from G4F server');
            }

            const choice = response.data.choices[0];
            if (!choice.message || !choice.message.content) {
                throw new Error('Invalid response format from G4F server');
            }

            console.log('G4FProvider.generateContent: Successfully extracted content, length:', choice.message.content.length);
            return choice.message.content;

        } catch (error) {
            console.error('G4F API error:', error);
            console.error('Error details:', {
                isAxiosError: axios.isAxiosError(error),
                code: axios.isAxiosError(error) ? error.code : 'N/A',
                status: axios.isAxiosError(error) ? error.response?.status : 'N/A',
                statusText: axios.isAxiosError(error) ? error.response?.statusText : 'N/A',
                data: axios.isAxiosError(error) ? error.response?.data : 'N/A',
                message: error instanceof Error ? error.message : 'Unknown error'
            });

            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNREFUSED') {
                    throw new Error(`G4F server is not running at ${this.config.serverUrl}. Please check the server URL and ensure the server is started.`);
                } else if (error.code === 'ENOTFOUND') {
                    throw new Error(`G4F server URL ${this.config.serverUrl} is not reachable. Please check the URL.`);
                } else if (error.code === 'ETIMEDOUT') {
                    throw new Error(`G4F server at ${this.config.serverUrl} is not responding (timeout). Please check if the server is running.`);
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

            // Сначала проверяем базовое подключение
            try {
                const headers: any = {};
                
                // Добавляем Authorization заголовок если есть API ключ
                if (this.config.apiKey) {
                    headers['Authorization'] = `Bearer ${this.config.apiKey}`;
                }
                
                // Пробуем разные эндпоинты для проверки доступности сервера
                try {
                    const response = await axios.get(`${this.config.serverUrl}/v1/models`, {
                        headers,
                        timeout: 10000
                    });
    
                    console.log('G4FProvider.validateConnection: Connection successful via /v1/models, status:', response.status);
                    console.log('G4FProvider.validateConnection: Response data:', response.data);
                    return true;
                } catch (modelsError) {
                    console.log('G4FProvider.validateConnection: /v1/models not available, trying root endpoint...');
                    
                    // Пробуем корневой эндпоинт
                    try {
                        const rootResponse = await axios.get(`${this.config.serverUrl}/`, {
                            headers,
                            timeout: 10000
                        });
    
                        console.log('G4FProvider.validateConnection: Connection successful via root endpoint, status:', rootResponse.status);
                        console.log('G4FProvider.validateConnection: Root response data:', rootResponse.data);
                        return true;
                    } catch (rootError) {
                        console.log('G4FProvider.validateConnection: Root endpoint also not available, but server responds');
                        
                        // Если сервер отвечает (не ECONNREFUSED), считаем что он доступен
                        if (axios.isAxiosError(rootError) && rootError.code !== 'ECONNREFUSED') {
                            console.log('G4FProvider.validateConnection: Server is reachable, returning true');
                            return true;
                        }
                        
                        throw rootError;
                    }
                }
            } catch (requestError) {
                console.error('G4FProvider.validateConnection: Request failed:', requestError);
                
                if (axios.isAxiosError(requestError)) {
                    const errorDetails = {
                        code: requestError.code,
                        status: requestError.response?.status,
                        statusText: requestError.response?.statusText,
                        data: requestError.response?.data,
                        message: requestError.message
                    };
                    console.error('G4FProvider.validateConnection: Axios error details:', errorDetails);
                    
                    // Даем более понятные сообщения об ошибках
                    if (requestError.code === 'ECONNREFUSED') {
                        console.error('G4FProvider.validateConnection: Connection refused - server is not running or wrong port');
                    } else if (requestError.code === 'ENOTFOUND') {
                        console.error('G4FProvider.validateConnection: Host not found - check the server URL');
                    } else if (requestError.code === 'ETIMEDOUT') {
                        console.error('G4FProvider.validateConnection: Connection timeout - server is not responding');
                    }
                }
                return false;
            }
        } catch (error) {
            console.error('G4FProvider.validateConnection: Unexpected error:', error);
            return false;
        }
    }

    // Получение списка доступных моделей с сервера
    async getServerModels(): Promise<string[]> {
        try {
            console.log('G4FProvider.getServerModels: Fetching models from server...');
            
            const headers: any = {};
            
            // Добавляем Authorization заголовок если есть API ключ
            if (this.config.apiKey) {
                headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            }

            // Пробуем разные эндпоинты для получения моделей
            try {
                const response = await axios.get(`${this.config.serverUrl}/v1/models`, {
                    headers,
                    timeout: 10000
                });
    
                console.log('G4FProvider.getServerModels: Response received via /v1/models:', response.status);
                console.log('G4FProvider.getServerModels: Response data:', response.data);
    
                if (response.data && response.data.data) {
                    const models = response.data.data.map((model: any) => model.id);
                    console.log('G4FProvider.getServerModels: Extracted models:', models);
                    return models;
                }
    
                console.log('G4FProvider.getServerModels: No models data in response');
                return [];
            } catch (modelsError) {
                console.log('G4FProvider.getServerModels: /v1/models not available, trying alternative endpoints...');
                
                // Пробуем альтернативные эндпоинты
                const alternativeEndpoints = [
                    '/models',
                    '/api/models',
                    '/v1/models/list',
                    '/models/list'
                ];
                
                for (const endpoint of alternativeEndpoints) {
                    try {
                        console.log(`G4FProvider.getServerModels: Trying endpoint: ${endpoint}`);
                        const altResponse = await axios.get(`${this.config.serverUrl}${endpoint}`, {
                            headers,
                            timeout: 10000
                        });
                        
                        console.log(`G4FProvider.getServerModels: Success via ${endpoint}:`, altResponse.status);
                        console.log(`G4FProvider.getServerModels: Response data:`, altResponse.data);
                        
                        // Пытаемся извлечь модели из ответа
                        if (altResponse.data && altResponse.data.data) {
                            const models = altResponse.data.data.map((model: any) => model.id);
                            console.log('G4FProvider.getServerModels: Extracted models from alternative endpoint:', models);
                            return models;
                        } else if (altResponse.data && Array.isArray(altResponse.data)) {
                            // Возможно, модели передаются как массив напрямую
                            const models = altResponse.data.map((model: any) => model.id || model);
                            console.log('G4FProvider.getServerModels: Extracted models from array response:', models);
                            return models;
                        }
                        
                        break;
                    } catch (endpointError) {
                        console.log(`G4FProvider.getServerModels: Endpoint ${endpoint} failed:`, endpointError);
                        continue;
                    }
                }
                
                console.log('G4FProvider.getServerModels: All endpoints failed, returning empty list');
                return [];
            }
        } catch (error) {
            console.error('G4FProvider.getServerModels: Failed to get models:', error);
            if (axios.isAxiosError(error)) {
                console.error('G4FProvider.getServerModels: Axios error details:', {
                    code: error.code,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    message: error.message
                });
            }
            return [];
        }
    }

    // Диагностический метод для проверки доступных эндпоинтов
    async diagnoseEndpoints(): Promise<{ available: string[], errors: any[] }> {
        const available: string[] = [];
        const errors: any[] = [];
        
        const endpoints = [
            '/',
            '/v1/models',
            '/models',
            '/api/models',
            '/v1/chat/completions',
            '/chat/completions',
            '/api/chat/completions'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const headers: any = {};
                if (this.config.apiKey) {
                    headers['Authorization'] = `Bearer ${this.config.apiKey}`;
                }
                
                const response = await axios.get(`${this.config.serverUrl}${endpoint}`, {
                    headers,
                    timeout: 5000
                });
                
                available.push(`${endpoint} (${response.status})`);
                console.log(`G4FProvider.diagnoseEndpoints: ${endpoint} available with status ${response.status}`);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    errors.push(`${endpoint}: ${error.response?.status || error.code} - ${error.message}`);
                    console.log(`G4FProvider.diagnoseEndpoints: ${endpoint} failed: ${error.response?.status || error.code}`);
                } else {
                    errors.push(`${endpoint}: ${error}`);
                }
            }
        }
        
        return { available, errors };
    }
}
