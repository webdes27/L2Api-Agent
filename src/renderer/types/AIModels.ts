export interface AIModel {
    id: string;
    name: string;
    provider: string;
    description: string;
    contextWindow: string;
    version: string;
}

export interface AIProvider {
    id: string;
    name: string;
    models: AIModel[];
}

// Общий список всех моделей AI
export const AI_MODELS: AIModel[] = [
    // OpenAI Models - Legacy (GPT-3.x)
    {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        description: 'Fast and efficient for most tasks.',
        contextWindow: '16k context window',
        version: 'Version: gpt-3.5-turbo'
    },
    
    // OpenAI Models - Generation 4.x
    {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        description: 'OpenAI\'s powerful model for daily and complex tasks.',
        contextWindow: '8k context window',
        version: 'Version: GPT-4-0613'
    },
    {
        id: 'gpt-4-turbo-preview',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        description: 'GPT-4 with improved speed and efficiency.',
        contextWindow: '128k context window',
        version: 'Version: GPT-4-turbo'
    },
    
    // OpenAI Models - Generation 5.x (newest)
    {
        id: 'gpt-5',
        name: 'GPT-5',
        provider: 'openai',
        description: 'OpenAI\'s next generation model. Most advanced reasoning.',
        contextWindow: '128k context window',
        version: 'Version: GPT-5-preview'
    },

    // Anthropic Models - Legacy (Claude 2.x)
    {
        id: 'claude-2.1',
        name: 'Claude 2.1',
        provider: 'anthropic',
        description: 'Previous generation Claude model',
        contextWindow: '200k context window',
        version: 'Version: claude-2.1'
    },
    
    // Anthropic Models - Generation 3.x
    {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        description: 'Fast and lightweight Claude model',
        contextWindow: '200k context window',
        version: 'Version: claude-3-haiku'
    },
    {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        provider: 'anthropic',
        description: 'Balanced performance and speed',
        contextWindow: '200k context window',
        version: 'Version: claude-3-sonnet'
    },
    {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        description: 'Claude\'s most powerful model for complex tasks',
        contextWindow: '200k context window',
        version: 'Version: claude-3-opus'
    },
    
    // Anthropic Models - Generation 4.x (newest)
    {
        id: 'claude-4-sonnet',
        name: 'Claude 4 Sonnet',
        provider: 'anthropic',
        description: 'Claude 4 Sonnet with 1M context',
        contextWindow: '1M context window',
        version: 'Version: claude-4-sonnet'
    },
    {
        id: 'claude-4.1-opus',
        name: 'Claude 4.1 Opus',
        provider: 'anthropic',
        description: 'Most capable Claude model',
        contextWindow: '200k context window',
        version: 'Version: claude-4.1'
    },

    // Google Models - Legacy (без версии)
    {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'google',
        description: 'Standard model for general tasks',
        contextWindow: '32k context window',
        version: 'Version: gemini-pro'
    },
    {
        id: 'gemini-pro-vision',
        name: 'Gemini Pro Vision',
        provider: 'google',
        description: 'Multimodal model with image understanding',
        contextWindow: '16k context window',
        version: 'Version: gemini-pro-vision'
    },
    
    // Google Models - Generation 1.5
    {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google',
        description: 'Capable model for complex reasoning tasks',
        contextWindow: '1M context window',
        version: 'Version: gemini-1.5-pro'
    },
    {
        id: 'gemini-1.5-pro-latest',
        name: 'Gemini 1.5 Pro (Latest)',
        provider: 'google',
        description: 'Latest 1.5 generation advanced model with 2M context',
        contextWindow: '2M context window',
        version: 'Version: gemini-1.5-pro-latest'
    },
    {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'google',
        description: 'Efficient model for quick responses',
        contextWindow: '1M context window',
        version: 'Version: gemini-1.5-flash'
    },
    {
        id: 'gemini-1.5-flash-latest',
        name: 'Gemini 1.5 Flash (Latest)',
        provider: 'google',
        description: 'Latest fast model with multimodal capabilities',
        contextWindow: '1M context window',
        version: 'Version: gemini-1.5-flash-latest'
    },
    
    // Google Models - Generation 2.0
    {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'google',
        description: 'Fast and efficient Gemini 2.0 model',
        contextWindow: '1M context window',
        version: 'Version: gemini-2.0-flash'
    },
    {
        id: 'gemini-2.0-pro',
        name: 'Gemini 2.0 Pro',
        provider: 'google',
        description: 'Advanced Gemini 2.0 model for complex tasks',
        contextWindow: '2M context window',
        version: 'Version: gemini-2.0-pro'
    },
    
    // Google Models - Generation 2.5 (newest)
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'google',
        description: 'Advanced reasoning model with improved capabilities',
        contextWindow: '2M context window',
        version: 'Version: gemini-2.5-pro'
    },
    {
        id: 'gemini-2.5-pro-latest',
        name: 'Gemini 2.5 Pro (Latest)',
        provider: 'google',
        description: 'Google\'s newest and most advanced model with enhanced reasoning',
        contextWindow: '2M context window',
        version: 'Version: gemini-2.5-pro-latest'
    },
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'google',
        description: 'High-performance model optimized for speed',
        contextWindow: '1M context window',
        version: 'Version: gemini-2.5-flash'
    },
    {
        id: 'gemini-2.5-flash-latest',
        name: 'Gemini 2.5 Flash (Latest)',
        provider: 'google',
        description: 'Fastest Gemini model with enhanced speed and efficiency',
        contextWindow: '1M context window',
        version: 'Version: gemini-2.5-flash-latest'
    },

    // DeepSeek Models
    {
        id: 'deepseek-r1-0528',
        name: 'deepseek-r1-0528',
        provider: 'deepseek',
        description: 'DeepSeek reasoning model',
        contextWindow: '32k context window',
        version: 'Version: deepseek-r1'
    },
    {
        id: 'deepseek-v3.1',
        name: 'deepseek-v3.1',
        provider: 'deepseek',
        description: 'Latest DeepSeek model',
        contextWindow: '64k context window',
        version: 'Version: deepseek-v3.1'
    },

    // Other Models
    {
        id: 'qrok-code-fast-1',
        name: 'qrok-code-fast-1',
        provider: 'qrok',
        description: 'Optimized for code generation',
        contextWindow: '32k context window',
        version: 'Version: qrok-code-1'
    }
];

// Группировка моделей по провайдерам
export const AI_PROVIDERS: AIProvider[] = [
    {
        id: 'openai',
        name: 'OpenAI',
        models: AI_MODELS.filter(model => model.provider === 'openai')
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        models: AI_MODELS.filter(model => model.provider === 'anthropic')
    },
    {
        id: 'google',
        name: 'Google',
        models: AI_MODELS.filter(model => model.provider === 'google')
    },
    {
        id: 'deepseek',
        name: 'DeepSeek',
        models: AI_MODELS.filter(model => model.provider === 'deepseek')
    },
    {
        id: 'qrok',
        name: 'Qrok',
        models: AI_MODELS.filter(model => model.provider === 'qrok')
    },
    {
        id: 'local',
        name: 'Local Models',
        models: [] // Локальные модели будут загружаться динамически
    }
];

// Утилитарные функции
export const getModelById = (id: string): AIModel | undefined => {
    return AI_MODELS.find(model => model.id === id);
};

export const getModelsByProvider = (providerId: string): AIModel[] => {
    return AI_MODELS.filter(model => model.provider === providerId);
};

export const getProviderByModelId = (modelId: string): string | undefined => {
    const model = getModelById(modelId);
    return model?.provider;
};
