import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { GeminiAIProvider } from './providers/GeminiAIProvider';
import { LocalModelProvider } from './providers/LocalModelProvider';
import { AIProvider, AIMessage, AIResponse } from './types/AITypes';

export interface CodeContext {
    filePath?: string;
    selectedCode?: string;
    projectPath?: string;
    language?: string;
    existingCode?: string;
    cursorPosition?: { line: number; character: number };
    fileTree?: string;
    recentFiles?: string[];
    gitStatus?: string;
    taskType?: 'chat' | 'code_completion' | 'code_review' | 'refactor' | 'explain' | 'debug' | 'test_generation' | 'improvements';
}

export interface CodeAnalysis {
    suggestions: string[];
    issues: string[];
    improvements: string[];
    securityIssues: string[];
    performanceTips: string[];
}

export interface CodeGenerationOptions {
    language: string;
    framework?: string;
    style?: 'functional' | 'oop' | 'procedural';
    includeTests?: boolean;
    includeComments?: boolean;
}

export class AIManager {
    private providers: Map<string, AIProvider> = new Map();
    private currentProvider: AIProvider | null = null;
    private conversationHistory: AIMessage[] = [];
    private projectContext: Map<string, any> = new Map();
    private logCallback?: (message: string) => void;

    public setLogCallback(callback: (message: string) => void): void {
        this.logCallback = callback;
    }

    private log(message: string): void {
        console.log(`AIManager: ${message}`);
        if (this.logCallback) {
            this.logCallback(`AIManager: ${message}`);
        }
    }

    constructor() {
        this.initializeProviders();
        this.loadSavedProvider();
    }

    private initializeProviders(): void {
        // Initialize built-in providers
        this.providers.set('openai', new OpenAIProvider());
        this.providers.set('anthropic', new AnthropicProvider());
        this.providers.set('google', new GeminiAIProvider());
        this.providers.set('local', new LocalModelProvider());
    }

    private loadSavedProvider(): void {
        try {
            // For now, we'll load the provider from the renderer process
            // This will be handled by the renderer process calling getCurrentProvider
            this.log('loadSavedProvider called');
        } catch (error) {
            console.error('Failed to load saved provider:', error);
        }
    }

    public async loadProviderById(providerId: string): Promise<boolean> {
        this.log(`loadProviderById called with: ${providerId}`);
        
        const provider = this.providers.get(providerId);
        if (!provider) {
            this.log(`loadProviderById: Provider not found: ${providerId}`);
            return false;
        }

        this.log(`loadProviderById: Found provider: ${provider.getName()}`);
        this.log(`loadProviderById: Provider isConfigured: ${provider.isConfigured()}`);
        
        if (provider.isConfigured()) {
            this.currentProvider = provider;
            this.log(`loadProviderById: Set currentProvider to: ${provider.getName()}`);
            return true;
        } else {
            this.log(`loadProviderById: Provider ${providerId} is not configured`);
            return false;
        }
    }

    public getAvailableProviders(): Array<{id: string, name: string, isConfigured: boolean}> {
        return Array.from(this.providers.entries()).map(([id, provider]) => ({
            id,
            name: provider.getName(),
            isConfigured: provider.isConfigured()
        }));
    }

    public getCurrentProvider(): string | null {
        this.log('getCurrentProvider called');
        this.log(`this.currentProvider: ${this.currentProvider ? this.currentProvider.getName() : 'null'}`);
        
        if (!this.currentProvider) {
            this.log('No current provider set, returning null');
            return null;
        }
        
        // Find the provider ID by comparing the provider instance
        for (const [id, provider] of this.providers.entries()) {
            if (provider === this.currentProvider) {
                this.log(`Found current provider ID: ${id}`);
                return id;
            }
        }
        
        this.log('Current provider not found in providers map, returning null');
        return null;
    }

    public async setProvider(providerId: string, config: any): Promise<boolean> {
        this.log(`setProvider called with: ${providerId}, config keys: ${Object.keys(config).join(', ')}, has apiKey: ${!!config.apiKey}`);
        
        const provider = this.providers.get(providerId);
        if (!provider) {
            this.log(`setProvider: Provider not found: ${providerId}`);
            throw new Error(`Provider ${providerId} not found`);
        }

        this.log(`setProvider: Found provider: ${provider.getName()}`);
        this.log(`setProvider: Provider isConfigured before configure: ${provider.isConfigured()}`);

        try {
            this.log('setProvider: Calling provider.configure...');
            await provider.configure(config);
            this.log('setProvider: Provider configured successfully');
            this.log(`setProvider: Provider isConfigured after configure: ${provider.isConfigured()}`);
            
            this.currentProvider = provider;
            this.log(`setProvider: Set currentProvider to: ${provider.getName()}`);
            
            // Save the provider ID (will be handled by renderer process)
            this.log(`Provider configured successfully: ${providerId}`);
            
            return true;
        } catch (error) {
            this.log(`setProvider: Failed to configure provider ${providerId}: ${error}`);
            this.log(`setProvider: Error details: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }

    public async sendMessage(message: string, context?: CodeContext): Promise<AIResponse> {
        if (!this.currentProvider) {
            throw new Error('No AI provider configured');
        }

        // Prepare the message with context
        const aiMessage: AIMessage = {
            role: 'user',
            content: message,
            context: context || {}
        };

        // Add to conversation history
        this.conversationHistory.push(aiMessage);

        try {
            // Send message to AI provider
            const response = await this.currentProvider.sendMessage(
                this.conversationHistory,
                context || {}
            );

            // Add AI response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: response.content,
                context: {}
            });

            return response;
        } catch (error) {
            console.error('AI request failed:', error);
            throw new Error(`AI request failed: ${error}`);
        }
    }

    public async chatWithContext(message: string, context: CodeContext): Promise<AIResponse> {
        const enhancedMessage = this.buildContextualPrompt(message, context);
        return this.sendMessage(enhancedMessage, context);
    }

    private buildContextualPrompt(message: string, context: CodeContext): string {
        let prompt = message;

        if (context.filePath) {
            prompt += `\n\nFile: ${context.filePath}`;
        }

        if (context.selectedCode) {
            prompt += `\n\nSelected code:\n\`\`\`${context.language || ''}\n${context.selectedCode}\n\`\`\``;
        }

        if (context.existingCode) {
            prompt += `\n\nExisting code context:\n\`\`\`${context.language || ''}\n${context.existingCode}\n\`\`\``;
        }

        if (context.fileTree) {
            prompt += `\n\nProject structure:\n${context.fileTree}`;
        }

        if (context.gitStatus) {
            prompt += `\n\nGit status:\n${context.gitStatus}`;
        }

        return prompt;
    }

    public async analyzeCode(code: string, filePath: string): Promise<CodeAnalysis> {
        if (!this.currentProvider) {
            throw new Error('No AI provider configured');
        }

        const prompt = `Analyze the following code and provide a comprehensive review:

File: ${filePath}
Code:
\`\`\`
${code}
\`\`\`

Please provide analysis in the following JSON format:
{
  "suggestions": ["suggestion1", "suggestion2"],
  "issues": ["issue1", "issue2"],
  "improvements": ["improvement1", "improvement2"],
  "securityIssues": ["security1", "security2"],
  "performanceTips": ["tip1", "tip2"]
}`;

        const response = await this.sendMessage(prompt, {
            filePath,
            selectedCode: code,
            taskType: 'code_review'
        });

        try {
            // Try to parse JSON response
            const analysis = JSON.parse(response.content);
            return analysis;
        } catch {
            // Fallback to simple parsing
            return {
                suggestions: [],
                issues: [],
                improvements: [],
                securityIssues: [],
                performanceTips: []
            };
        }
    }

    public async generateCode(prompt: string, options: CodeGenerationOptions): Promise<string> {
        if (!this.currentProvider) {
            throw new Error('No AI provider configured');
        }

        const fullPrompt = `Generate code based on the following requirements:

${prompt}

Requirements:
- Language: ${options.language}
${options.framework ? `- Framework: ${options.framework}` : ''}
- Style: ${options.style || 'functional'}
${options.includeTests ? '- Include unit tests' : ''}
${options.includeComments ? '- Include detailed comments' : ''}

Please provide only the code without explanations:`;

        const response = await this.sendMessage(fullPrompt, {
            language: options.language,
            taskType: 'code_completion'
        });

        return response.content;
    }

    public async refactorCode(code: string, filePath: string, refactorType: 'extract_method' | 'rename' | 'optimize' | 'modernize'): Promise<string> {
        if (!this.currentProvider) {
            throw new Error('No AI provider configured');
        }

        const refactorPrompts = {
            extract_method: 'Extract the selected code into a separate method/function',
            rename: 'Suggest better names for variables, functions, and classes',
            optimize: 'Optimize the code for better performance and readability',
            modernize: 'Modernize the code using the latest language features and best practices'
        };

        const prompt = `${refactorPrompts[refactorType]}:

File: ${filePath}
Code:
\`\`\`
${code}
\`\`\`

Please provide the refactored code:`;

        const response = await this.sendMessage(prompt, {
            filePath,
            selectedCode: code,
            taskType: 'refactor'
        });

        return response.content;
    }

    public async explainCode(code: string, filePath: string): Promise<string> {
        if (!this.currentProvider) {
            throw new Error('No AI provider configured');
        }

        const prompt = `Explain this code in detail:

File: ${filePath}
Code:
\`\`\`
${code}
\`\`\`

Please explain:
1. What the code does
2. How it works
3. Key concepts used
4. Potential improvements`;

        const response = await this.sendMessage(prompt, {
            filePath,
            selectedCode: code,
            taskType: 'explain'
        });

        return response.content;
    }

    public async debugCode(code: string, filePath: string, errorMessage?: string): Promise<string> {
        if (!this.currentProvider) {
            throw new Error('No AI provider configured');
        }

        const prompt = `Debug this code:

File: ${filePath}
Code:
\`\`\`
${code}
\`\`\`
${errorMessage ? `Error: ${errorMessage}` : ''}

Please help identify and fix the issue:`;

        const response = await this.sendMessage(prompt, {
            filePath,
            selectedCode: code,
            taskType: 'debug'
        });

        return response.content;
    }

    public async generateTests(code: string, filePath: string, testFramework?: string): Promise<string> {
        if (!this.currentProvider) {
            throw new Error('No AI provider configured');
        }

        const prompt = `Generate comprehensive tests for this code:

File: ${filePath}
Code:
\`\`\`
${code}
\`\`\`
${testFramework ? `Test Framework: ${testFramework}` : ''}

Please generate unit tests that cover:
1. Happy path scenarios
2. Edge cases
3. Error conditions
4. Boundary conditions`;

        const response = await this.sendMessage(prompt, {
            filePath,
            selectedCode: code,
            taskType: 'test_generation'
        });

        return response.content;
    }

    public async suggestImprovements(code: string, filePath: string): Promise<string[]> {
        if (!this.currentProvider) {
            throw new Error('No AI provider configured');
        }

        const prompt = `Suggest improvements for this code:

File: ${filePath}
Code:
\`\`\`
${code}
\`\`\`

Please provide specific, actionable improvements:`;

        const response = await this.sendMessage(prompt, {
            filePath,
            selectedCode: code,
            taskType: 'improvements'
        });

        // Parse suggestions (simple line-by-line parsing)
        return response.content.split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => line.replace(/^[-*•]\s*/, '').trim());
    }

    public setProjectContext(projectPath: string, context: any): void {
        this.projectContext.set(projectPath, context);
    }

    public getProjectContext(projectPath: string): any {
        return this.projectContext.get(projectPath);
    }

    public clearConversation(): void {
        this.conversationHistory = [];
    }

    public getConversationHistory(): AIMessage[] {
        return [...this.conversationHistory];
    }

    public exportConversation(): string {
        return JSON.stringify(this.conversationHistory, null, 2);
    }

    public importConversation(history: AIMessage[]): void {
        this.conversationHistory = [...history];
    }
}
