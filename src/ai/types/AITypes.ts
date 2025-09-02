export interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    context?: {
        filePath?: string;
        selectedCode?: string;
        projectPath?: string;
        taskType?: 'chat' | 'code_completion' | 'code_review' | 'refactor' | 'explain' | 'debug' | 'test_generation' | 'improvements';
        [key: string]: any;
    };
    timestamp?: number;
}

export interface AIResponse {
    content: string;
    model?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    finishReason?: string;
    metadata?: {
        [key: string]: any;
    };
}

export interface AIProviderConfig {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    [key: string]: any;
}

export interface AIProvider {
    getName(): string;
    isConfigured(): boolean;
    configure(config: AIProviderConfig): Promise<void>;
    sendMessage(messages: AIMessage[], context?: any): Promise<AIResponse>;
    getModels(): Promise<string[]>;
    testConnection(): Promise<boolean>;
}

export interface LocalModelConfig extends AIProviderConfig {
    endpoint: string;
    modelPath?: string;
    useGPU?: boolean;
    gpuLayers?: number;
    contextWindow?: number;
}

export interface ProjectContext {
    projectPath: string;
    language: string;
    framework?: string;
    dependencies: string[];
    structure: FileTree;
    openFiles: string[];
    recentChanges: FileChange[];
}

export interface FileTree {
    [path: string]: {
        type: 'file' | 'directory';
        children?: FileTree;
        lastModified?: number;
        size?: number;
    };
}

export interface FileChange {
    filePath: string;
    changeType: 'created' | 'modified' | 'deleted';
    timestamp: number;
    diff?: string;
}

export interface MemoryEntry {
    id: string;
    projectPath: string;
    timestamp: number;
    context: ProjectContext;
    conversationHistory: AIMessage[];
    metadata: {
        [key: string]: any;
    };
}
