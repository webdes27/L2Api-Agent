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
    // OpenAI Models
    {
        id: 'gpt-5',
        name: 'GPT-5',
        provider: 'openai',
        description: 'OpenAI\'s next generation model. Most advanced reasoning.',
        contextWindow: '128k context window',
        version: 'Version: GPT-5-preview'
    },
    {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        description: 'OpenAI\'s latest model. Powerful, for daily and complex tasks alike.',
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
    {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        description: 'Fast and efficient for most tasks.',
        contextWindow: '16k context window',
        version: 'Version: gpt-3.5-turbo'
    },

    // Anthropic Models
    {
        id: 'claude-4-sonnet',
        name: 'claude-4-sonnet-1m',
        provider: 'anthropic',
        description: 'Claude 4 Sonnet with 1M context',
        contextWindow: '1M context window',
        version: 'Version: claude-4-sonnet'
    },
    {
        id: 'claude-4.1-opus',
        name: 'claude-4.1-opus',
        provider: 'anthropic',
        description: 'Most capable Claude model',
        contextWindow: '200k context window',
        version: 'Version: claude-4.1'
    },
    {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        description: 'Claude\'s most powerful model for complex tasks',
        contextWindow: '200k context window',
        version: 'Version: claude-3-opus'
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
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        description: 'Fast and lightweight Claude model',
        contextWindow: '200k context window',
        version: 'Version: claude-3-haiku'
    },
    {
        id: 'claude-2.1',
        name: 'Claude 2.1',
        provider: 'anthropic',
        description: 'Previous generation Claude model',
        contextWindow: '200k context window',
        version: 'Version: claude-2.1'
    },

    // Google Models
    {
        id: 'gemini-2.5-pro',
        name: 'gemini-2.5-pro',
        provider: 'google',
        description: 'Google\'s advanced reasoning model',
        contextWindow: '1M context window',
        version: 'Version: gemini-2.5-pro'
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
