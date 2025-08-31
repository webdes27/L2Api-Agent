import axios from 'axios';

export interface GeminiConfig {
    apiKey: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
}

export interface GeminiMessage {
    role: 'user' | 'model';
    parts: Array<{
        text?: string;
        inlineData?: {
            mimeType: string;
            data: string;
        };
    }>;
}

export interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
            role: string;
        };
        finishReason: string;
        index: number;
        safetyRatings: Array<{
            category: string;
            probability: string;
        }>;
    }>;
    promptFeedback?: {
        safetyRatings: Array<{
            category: string;
            probability: string;
        }>;
    };
}

export class GeminiProvider {
    private config: GeminiConfig;
    private baseURL = 'https://generativelanguage.googleapis.com/v1beta';

    constructor(config: GeminiConfig) {
        this.config = config;
    }

    async generateContent(
        messages: GeminiMessage[],
        systemPrompt?: string
    ): Promise<string> {
        try {
            // Объединяем системный промпт с сообщениями пользователя
            const contents: GeminiMessage[] = [];
            
            if (systemPrompt) {
                contents.push({
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                });
                contents.push({
                    role: 'model',
                    parts: [{ text: 'Понял, буду следовать этим инструкциям.' }]
                });
            }

            contents.push(...messages);

            const requestBody = {
                contents: contents,
                generationConfig: {
                    temperature: this.config.temperature || 0.7,
                    topK: this.config.topK || 40,
                    topP: this.config.topP || 0.95,
                    maxOutputTokens: this.config.maxTokens || 2048,
                    stopSequences: []
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
                ]
            };

            const response = await axios.post<GeminiResponse>(
                `${this.baseURL}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000
                }
            );

            if (!response.data.candidates || response.data.candidates.length === 0) {
                throw new Error('No response from Gemini API');
            }

            const candidate = response.data.candidates[0];
            
            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                throw new Error('Invalid response format from Gemini API');
            }

            return candidate.content.parts[0].text || '';

        } catch (error) {
            console.error('Gemini API error:', error);
            
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Invalid Gemini API key');
                } else if (error.response?.status === 429) {
                    throw new Error('Gemini API rate limit exceeded');
                } else if (error.response?.status === 400) {
                    const errorMessage = error.response.data?.error?.message || 'Bad request to Gemini API';
                    throw new Error(`Gemini API error: ${errorMessage}`);
                }
            }
            
            throw new Error(`Failed to get response from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async generateContentWithImage(
        text: string,
        imageData: string,
        mimeType: string,
        systemPrompt?: string
    ): Promise<string> {
        const message: GeminiMessage = {
            role: 'user',
            parts: [
                { text },
                {
                    inlineData: {
                        mimeType,
                        data: imageData
                    }
                }
            ]
        };

        return this.generateContent([message], systemPrompt);
    }

    updateConfig(newConfig: Partial<GeminiConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    getConfig(): GeminiConfig {
        return { ...this.config };
    }

    // Метод для получения доступных моделей
    static getAvailableModels(): string[] {
        return [
            // Legacy Models (без версии)
            'gemini-pro',
            'gemini-pro-vision',
            
            // Generation 1.5
            'gemini-1.5-pro',
            'gemini-1.5-pro-latest',
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            
            // Generation 2.5 (newest)
            'gemini-2.5-pro',
            'gemini-2.5-pro-latest',
            'gemini-2.5-flash',
            'gemini-2.5-flash-latest'
        ];
    }

    // Проверка поддержки изображений моделью
    static supportsImages(model: string): boolean {
        return model.includes('vision') || 
               model.includes('1.5') || 
               model.includes('2.5');
    }

    // Проверка валидности API ключа
    async validateApiKey(): Promise<boolean> {
        try {
            const testMessage: GeminiMessage = {
                role: 'user',
                parts: [{ text: 'Hello' }]
            };

            await this.generateContent([testMessage]);
            return true;
        } catch (error) {
            return false;
        }
    }
}
