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

    constructor() {
        this.initializeProviders();
    }

    private initializeProviders(): void {
        // Initialize built-in providers
        this.providers.set('openai', new OpenAIProvider());
        this.providers.set('anthropic', new AnthropicProvider());
        this.providers.set('google', new GeminiAIProvider());
        this.providers.set('local', new LocalModelProvider());
    }

    public getAvailableProviders(): Array<{id: string, name: string, isConfigured: boolean}> {
        return Array.from(this.providers.entries()).map(([id, provider]) => ({
            id,
            name: provider.getName(),
            isConfigured: provider.isConfigured()
        }));
    }

    public async setProvider(providerId: string, config: any): Promise<boolean> {
        const provider = this.providers.get(providerId);
        if (!provider) {
            throw new Error(`Provider ${providerId} not found`);
        }

        try {
            await provider.configure(config);
            this.currentProvider = provider;
            return true;
        } catch (error) {
            console.error(`Failed to configure provider ${providerId}:`, error);
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
