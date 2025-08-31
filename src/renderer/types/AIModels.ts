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
        id: 'gemini-2.0-flash-lite',
        name: 'Gemini 2.0 Flash Lite',
        provider: 'google',
        description: 'Lightweight and fast Gemini 2.0 model',
        contextWindow: '1M context window',
        version: 'Version: gemini-2.0-flash-lite'
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
    {
        id: 'gemma-3-27b-it',
        name: 'Gemma 3 27B IT',
        provider: 'google',
        description: 'Google\'s Gemma 3 27B instruction-tuned model',
        contextWindow: '8k context window',
        version: 'Version: gemma-3-27b-it'
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
    },

    // G4F Models - GPT4Free
    // GPT-5 Models
    {
        id: 'gpt-5',
        name: 'GPT-5 (Microsoft Copilot)',
        provider: 'g4f',
        description: 'Microsoft Copilot with GPT-5 via GPT4Free',
        contextWindow: '128k context window',
        version: 'Version: gpt-5'
    },
    {
        id: 'gpt-5-mini',
        name: 'GPT-5 Mini (Api.Airforce)',
        provider: 'g4f',
        description: 'Api.Airforce with GPT-5 Mini via GPT4Free',
        contextWindow: '64k context window',
        version: 'Version: gpt-5-mini'
    },
    {
        id: 'gpt-5-nano',
        name: 'GPT-5 Nano (Api.Airforce)',
        provider: 'g4f',
        description: 'Api.Airforce with GPT-5 Nano via GPT4Free',
        contextWindow: '32k context window',
        version: 'Version: gpt-5-nano'
    },
    {
        id: 'gpt-5-nano-2025-08-07',
        name: 'GPT-5 Nano 2025 (Pollinations AI)',
        provider: 'g4f',
        description: 'Pollinations AI with GPT-5 Nano via GPT4Free',
        contextWindow: '32k context window',
        version: 'Version: gpt-5-nano-2025-08-07'
    },
    {
        id: 'gpt-5-chat',
        name: 'GPT-5 Chat (Api.Airforce)',
        provider: 'g4f',
        description: 'Api.Airforce with GPT-5 Chat via GPT4Free',
        contextWindow: '64k context window',
        version: 'Version: gpt-5-chat'
    },
    {
        id: 'gpt-4.1-2025-04-14',
        name: 'GPT-4.1 2025 (Pollinations AI)',
        provider: 'g4f',
        description: 'Pollinations AI with GPT-4.1 via GPT4Free',
        contextWindow: '128k context window',
        version: 'Version: gpt-4.1-2025-04-14'
    },
    
    // OpenAI Models
    {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo (G4F)',
        provider: 'g4f',
        description: 'Fast and efficient model via GPT4Free',
        contextWindow: '16k context window',
        version: 'Version: gpt-3.5-turbo'
    },
    {
        id: 'gpt-4',
        name: 'GPT-4 (G4F)',
        provider: 'g4f',
        description: 'Powerful model via GPT4Free',
        contextWindow: '8k context window',
        version: 'Version: gpt-4'
    },
    {
        id: 'gpt-4o',
        name: 'GPT-4o (G4F)',
        provider: 'g4f',
        description: 'Latest GPT-4 model via GPT4Free',
        contextWindow: '128k context window',
        version: 'Version: gpt-4o'
    },
    {
        id: 'openai/gpt-oss-120b',
        name: 'GPT-OSS 120B (HuggingFace/DeepInfra)',
        provider: 'g4f',
        description: 'OpenAI GPT-OSS 120B via HuggingFace/DeepInfra',
        contextWindow: '128k context window',
        version: 'Version: openai/gpt-oss-120b'
    },
    
    // Anthropic Models
    {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku (G4F)',
        provider: 'g4f',
        description: 'Fast Claude model via GPT4Free',
        contextWindow: '200k context window',
        version: 'Version: claude-3-haiku'
    },
    
    // Google Models
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro (Api.Airforce)',
        provider: 'g4f',
        description: 'Api.Airforce with Gemini 2.5 Pro via GPT4Free',
        contextWindow: '1M context window',
        version: 'Version: gemini-2.5-pro'
    },
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash (Api.Airforce)',
        provider: 'g4f',
        description: 'Api.Airforce with Gemini 2.5 Flash via GPT4Free',
        contextWindow: '1M context window',
        version: 'Version: gemini-2.5-flash'
    },
    {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash Lite (Pollinations AI)',
        provider: 'g4f',
        description: 'Pollinations AI with Gemini 2.5 Flash Lite via GPT4Free',
        contextWindow: '1M context window',
        version: 'Version: gemini-2.5-flash-lite'
    },
    
    // Meta Models
    {
        id: 'llama-3-8b',
        name: 'Llama 3 8B (G4F)',
        provider: 'g4f',
        description: 'Meta\'s Llama 3 8B model via GPT4Free',
        contextWindow: '8k context window',
        version: 'Version: llama-3-8b'
    },
    {
        id: 'llama-3-70b',
        name: 'Llama 3 70B (G4F)',
        provider: 'g4f',
        description: 'Meta\'s Llama 3 70B model via GPT4Free',
        contextWindow: '8k context window',
        version: 'Version: llama-3-70b'
    },
    
    // Mistral Models
    {
        id: 'mistral-7b',
        name: 'Mistral 7B (G4F)',
        provider: 'g4f',
        description: 'Mistral 7B model via GPT4Free',
        contextWindow: '8k context window',
        version: 'Version: mistral-7b'
    },
    {
        id: 'mixtral-8x7b',
        name: 'Mixtral 8x7B (G4F)',
        provider: 'g4f',
        description: 'Mixtral 8x7B model via GPT4Free',
        contextWindow: '32k context window',
        version: 'Version: mixtral-8x7b'
    },
    
    // DeepSeek Models
    {
        id: 'deepseek-ai/DeepSeek-V3',
        name: 'DeepSeek V3 (HuggingFace)',
        provider: 'g4f',
        description: 'DeepSeek V3 via HuggingFace',
        contextWindow: '64k context window',
        version: 'Version: deepseek-ai/DeepSeek-V3'
    },
    {
        id: 'deepseek-ai/DeepSeek-V3.1',
        name: 'DeepSeek V3.1 (HuggingFace)',
        provider: 'g4f',
        description: 'DeepSeek V3.1 via HuggingFace',
        contextWindow: '64k context window',
        version: 'Version: deepseek-ai/DeepSeek-V3.1'
    },
    {
        id: 'deepseek-ai/DeepSeek-R1',
        name: 'DeepSeek R1 (HuggingFace)',
        provider: 'g4f',
        description: 'DeepSeek R1 via HuggingFace',
        contextWindow: '32k context window',
        version: 'Version: deepseek-ai/DeepSeek-R1'
    },
    {
        id: 'deepseek-ai/DeepSeek-R1-0528',
        name: 'DeepSeek R1 0528 (DeepInfra)',
        provider: 'g4f',
        description: 'DeepSeek R1 0528 via DeepInfra',
        contextWindow: '32k context window',
        version: 'Version: deepseek-ai/DeepSeek-R1-0528'
    },
    {
        id: 'deepseek-ai/deepseek-r1-distill-qwen-32b',
        name: 'DeepSeek R1 Distill Qwen 32B (Cloudflare AI)',
        provider: 'g4f',
        description: 'DeepSeek R1 Distill Qwen 32B via Cloudflare AI',
        contextWindow: '32k context window',
        version: 'Version: deepseek-ai/deepseek-r1-distill-qwen-32b'
    },
    
    // Qwen Models
    {
        id: 'Qwen/Qwen3-Coder-30B-A3B-Instruct',
        name: 'Qwen3 Coder 30B (HuggingFace)',
        provider: 'g4f',
        description: 'Qwen3 Coder 30B via HuggingFace',
        contextWindow: '32k context window',
        version: 'Version: Qwen/Qwen3-Coder-30B-A3B-Instruct'
    },
    {
        id: 'Qwen/Qwen3-Coder-480B-A35B-Instruct',
        name: 'Qwen3 Coder 480B (HuggingFace)',
        provider: 'g4f',
        description: 'Qwen3 Coder 480B via HuggingFace',
        contextWindow: '64k context window',
        version: 'Version: Qwen/Qwen3-Coder-480B-A35B-Instruct'
    },
    {
        id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
        name: 'Qwen2.5 Coder 32B (HuggingFace)',
        provider: 'g4f',
        description: 'Qwen2.5 Coder 32B via HuggingFace',
        contextWindow: '32k context window',
        version: 'Version: Qwen/Qwen2.5-Coder-32B-Instruct'
    },
    {
        id: 'Qwen/Qwen3-235B-A22B-fp8-tput',
        name: 'Qwen3 235B (HuggingFace Together)',
        provider: 'g4f',
        description: 'Qwen3 235B via HuggingFace Together',
        contextWindow: '64k context window',
        version: 'Version: Qwen/Qwen3-235B-A22B-fp8-tput'
    },
    
    // NousResearch Models
    {
        id: 'NousResearch/Hermes-4-405B',
        name: 'Hermes 4 405B (HuggingFace)',
        provider: 'g4f',
        description: 'NousResearch Hermes 4 405B via HuggingFace',
        contextWindow: '64k context window',
        version: 'Version: NousResearch/Hermes-4-405B'
    },
    
    // Code Models
    {
        id: 'codellama-7b',
        name: 'Code Llama 7B (G4F)',
        provider: 'g4f',
        description: 'Code-optimized Llama model via GPT4Free',
        contextWindow: '16k context window',
        version: 'Version: codellama-7b'
    },
    {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder (G4F)',
        provider: 'g4f',
        description: 'Code generation model via GPT4Free',
        contextWindow: '16k context window',
        version: 'Version: deepseek-coder'
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
    },
    {
        id: 'g4f',
        name: 'GPT4Free (G4F)',
        models: AI_MODELS.filter(model => model.provider === 'g4f')
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
