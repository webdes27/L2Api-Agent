import * as fs from 'fs';
import * as path from 'path';

export interface CodeAnalysisResult {
    functions: FunctionInfo[];
    classes: ClassInfo[];
    imports: ImportInfo[];
    exports: ExportInfo[];
    dependencies: string[];
    complexity: number;
    language: string;
    framework?: string;
}

export interface FunctionInfo {
    name: string;
    startLine: number;
    endLine: number;
    parameters: string[];
    returnType?: string;
    docstring?: string;
    complexity: number;
}

export interface ClassInfo {
    name: string;
    startLine: number;
    endLine: number;
    methods: FunctionInfo[];
    properties: string[];
    extends?: string;
    implements?: string[];
}

export interface ImportInfo {
    module: string;
    items: string[];
    isDefault: boolean;
    alias?: string;
}

export interface ExportInfo {
    name: string;
    type: 'function' | 'class' | 'variable' | 'default';
    isDefault: boolean;
}

export class CodeAnalyzer {
    
    public async analyzeFile(filePath: string): Promise<CodeAnalysisResult> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            const extension = path.extname(filePath).toLowerCase();
            
            switch (extension) {
                case '.ts':
                case '.tsx':
                case '.js':
                case '.jsx':
                    return this.analyzeJavaScript(content, extension);
                case '.py':
                    return this.analyzePython(content);
                case '.java':
                    return this.analyzeJava(content);
                case '.cs':
                    return this.analyzeCSharp(content);
                default:
                    return this.analyzeGeneric(content, extension);
            }
        } catch (error) {
            console.error('Failed to analyze file:', error);
            return this.getEmptyResult();
        }
    }

    private analyzeJavaScript(content: string, extension: string): CodeAnalysisResult {
        const lines = content.split('\n');
        const functions: FunctionInfo[] = [];
        const classes: ClassInfo[] = [];
        const imports: ImportInfo[] = [];
        const exports: ExportInfo[] = [];

        // Analyze imports
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // ES6 imports
            const importMatch = line.match(/^import\s+(.*?)\s+from\s+['"`](.+?)['"`]/);
            if (importMatch) {
                const importSpec = importMatch[1];
                const module = importMatch[2];
                
                if (importSpec.includes('{')) {
                    // Named imports
                    const namedImports = importSpec.replace(/[{}]/g, '').split(',').map(s => s.trim());
                    imports.push({
                        module,
                        items: namedImports,
                        isDefault: false
                    });
                } else {
                    // Default import
                    imports.push({
                        module,
                        items: [importSpec],
                        isDefault: true
                    });
                }
            }

            // CommonJS require
            const requireMatch = line.match(/const\s+(.+?)\s+=\s+require\(['"`](.+?)['"`]\)/);
            if (requireMatch) {
                imports.push({
                    module: requireMatch[2],
                    items: [requireMatch[1]],
                    isDefault: true
                });
            }
        }

        // Analyze functions
        const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\(|(\w+)\s*:\s*(?:async\s+)?\()/g;
        let match;
        
        while ((match = functionRegex.exec(content)) !== null) {
            const functionName = match[1] || match[2] || match[3];
            if (functionName) {
                const startLine = content.substring(0, match.index).split('\n').length;
                
                // Find function end (simplified)
                const endLine = this.findFunctionEnd(content, match.index);
                
                functions.push({
                    name: functionName,
                    startLine,
                    endLine,
                    parameters: this.extractParameters(content, match.index),
                    complexity: this.calculateComplexity(content.substring(match.index, this.findFunctionEndIndex(content, match.index)))
                });
            }
        }

        // Analyze classes
        const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?\s*{/g;
        
        while ((match = classRegex.exec(content)) !== null) {
            const className = match[1];
            const extendsClass = match[2];
            const implementsClasses = match[3] ? match[3].split(',').map(s => s.trim()) : undefined;
            
            const startLine = content.substring(0, match.index).split('\n').length;
            const endLine = this.findClassEnd(content, match.index);
            
            classes.push({
                name: className,
                startLine,
                endLine,
                methods: [],
                properties: [],
                extends: extendsClass,
                implements: implementsClasses
            });
        }

        // Analyze exports
        const exportRegex = /export\s+(?:default\s+)?(?:function\s+(\w+)|class\s+(\w+)|const\s+(\w+)|(\w+))/g;
        
        while ((match = exportRegex.exec(content)) !== null) {
            const exportName = match[1] || match[2] || match[3] || match[4];
            const isDefault = content.substring(match.index, match.index + 20).includes('default');
            
            exports.push({
                name: exportName,
                type: match[1] ? 'function' : match[2] ? 'class' : 'variable',
                isDefault
            });
        }

        return {
            functions,
            classes,
            imports,
            exports,
            dependencies: imports.map(imp => imp.module),
            complexity: this.calculateOverallComplexity(content),
            language: extension === '.ts' || extension === '.tsx' ? 'typescript' : 'javascript',
            framework: this.detectJSFramework(imports)
        };
    }

    private analyzePython(content: string): CodeAnalysisResult {
        const lines = content.split('\n');
        const functions: FunctionInfo[] = [];
        const classes: ClassInfo[] = [];
        const imports: ImportInfo[] = [];

        // Analyze imports
        for (const line of lines) {
            const trimmed = line.trim();
            
            // import module
            const importMatch = trimmed.match(/^import\s+(.+)/);
            if (importMatch) {
                const modules = importMatch[1].split(',').map(s => s.trim());
                modules.forEach(module => {
                    imports.push({
                        module,
                        items: [module],
                        isDefault: true
                    });
                });
            }

            // from module import items
            const fromImportMatch = trimmed.match(/^from\s+(.+?)\s+import\s+(.+)/);
            if (fromImportMatch) {
                const module = fromImportMatch[1];
                const items = fromImportMatch[2].split(',').map(s => s.trim());
                
                imports.push({
                    module,
                    items,
                    isDefault: false
                });
            }
        }

        // Analyze functions
        const functionRegex = /def\s+(\w+)\s*\((.*?)\):/g;
        let match;
        
        while ((match = functionRegex.exec(content)) !== null) {
            const functionName = match[1];
            const parameters = match[2].split(',').map(s => s.trim()).filter(s => s);
            const startLine = content.substring(0, match.index).split('\n').length;
            
            functions.push({
                name: functionName,
                startLine,
                endLine: startLine + 10, // Simplified
                parameters,
                complexity: 1 // Simplified
            });
        }

        // Analyze classes
        const classRegex = /class\s+(\w+)(?:\((.+?)\))?:/g;
        
        while ((match = classRegex.exec(content)) !== null) {
            const className = match[1];
            const baseClass = match[2];
            const startLine = content.substring(0, match.index).split('\n').length;
            
            classes.push({
                name: className,
                startLine,
                endLine: startLine + 20, // Simplified
                methods: [],
                properties: [],
                extends: baseClass
            });
        }

        return {
            functions,
            classes,
            imports,
            exports: [],
            dependencies: imports.map(imp => imp.module),
            complexity: this.calculateOverallComplexity(content),
            language: 'python',
            framework: this.detectPythonFramework(imports)
        };
    }

    private analyzeJava(content: string): CodeAnalysisResult {
        // Simplified Java analysis
        const classes: ClassInfo[] = [];
        const imports: ImportInfo[] = [];

        // Extract imports
        const importRegex = /import\s+(static\s+)?(.+?);/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
            imports.push({
                module: match[2],
                items: [match[2].split('.').pop() || ''],
                isDefault: true
            });
        }

        // Extract classes
        const classRegex = /(?:public\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?\s*{/g;
        
        while ((match = classRegex.exec(content)) !== null) {
            const className = match[1];
            const extendsClass = match[2];
            const implementsClasses = match[3] ? match[3].split(',').map(s => s.trim()) : undefined;
            
            const startLine = content.substring(0, match.index).split('\n').length;
            
            classes.push({
                name: className,
                startLine,
                endLine: startLine + 50, // Simplified
                methods: [],
                properties: [],
                extends: extendsClass,
                implements: implementsClasses
            });
        }

        return {
            functions: [],
            classes,
            imports,
            exports: [],
            dependencies: imports.map(imp => imp.module),
            complexity: this.calculateOverallComplexity(content),
            language: 'java'
        };
    }

    private analyzeCSharp(content: string): CodeAnalysisResult {
        // Simplified C# analysis
        const classes: ClassInfo[] = [];
        const imports: ImportInfo[] = [];

        // Extract using statements
        const usingRegex = /using\s+(.+?);/g;
        let match;
        
        while ((match = usingRegex.exec(content)) !== null) {
            imports.push({
                module: match[1],
                items: [match[1]],
                isDefault: true
            });
        }

        // Extract classes
        const classRegex = /(?:public\s+)?(?:partial\s+)?class\s+(\w+)(?:\s*:\s*([\w,\s]+))?\s*{/g;
        
        while ((match = classRegex.exec(content)) !== null) {
            const className = match[1];
            const inheritance = match[2] ? match[2].split(',').map(s => s.trim()) : [];
            
            const startLine = content.substring(0, match.index).split('\n').length;
            
            classes.push({
                name: className,
                startLine,
                endLine: startLine + 50, // Simplified
                methods: [],
                properties: [],
                extends: inheritance[0],
                implements: inheritance.slice(1)
            });
        }

        return {
            functions: [],
            classes,
            imports,
            exports: [],
            dependencies: imports.map(imp => imp.module),
            complexity: this.calculateOverallComplexity(content),
            language: 'csharp'
        };
    }

    private analyzeGeneric(content: string, extension: string): CodeAnalysisResult {
        return {
            functions: [],
            classes: [],
            imports: [],
            exports: [],
            dependencies: [],
            complexity: content.split('\n').length,
            language: extension.substring(1) || 'unknown'
        };
    }

    private findFunctionEnd(content: string, startIndex: number): number {
        // Simplified function end detection
        const lines = content.substring(startIndex).split('\n');
        let braceCount = 0;
        let inFunction = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.includes('{')) {
                braceCount += (line.match(/{/g) || []).length;
                inFunction = true;
            }
            
            if (line.includes('}')) {
                braceCount -= (line.match(/}/g) || []).length;
                
                if (inFunction && braceCount <= 0) {
                    return content.substring(0, startIndex).split('\n').length + i + 1;
                }
            }
        }
        
        return content.substring(0, startIndex).split('\n').length + 10;
    }

    private findFunctionEndIndex(content: string, startIndex: number): number {
        // Find the end index of a function in the content
        let braceCount = 0;
        let i = startIndex;
        
        while (i < content.length) {
            if (content[i] === '{') braceCount++;
            if (content[i] === '}') braceCount--;
            
            if (braceCount < 0) break;
            i++;
        }
        
        return i;
    }

    private findClassEnd(content: string, startIndex: number): number {
        // Similar to findFunctionEnd but for classes
        return this.findFunctionEnd(content, startIndex);
    }

    private extractParameters(content: string, functionStartIndex: number): string[] {
        // Extract function parameters
        const functionDeclaration = content.substring(functionStartIndex, functionStartIndex + 200);
        const paramMatch = functionDeclaration.match(/\(([^)]*)\)/);
        
        if (paramMatch && paramMatch[1]) {
            return paramMatch[1].split(',').map(param => param.trim()).filter(param => param);
        }
        
        return [];
    }

    private calculateComplexity(code: string): number {
        // Simple cyclomatic complexity calculation
        let complexity = 1; // Base complexity
        
        const complexityKeywords = [
            'if', 'else', 'elif', 'while', 'for', 'foreach', 'switch', 'case',
            'try', 'catch', 'finally', '&&', '||', '?', ':'
        ];
        
        for (const keyword of complexityKeywords) {
            const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'));
            if (matches) {
                complexity += matches.length;
            }
        }
        
        return complexity;
    }

    private calculateOverallComplexity(content: string): number {
        return Math.min(this.calculateComplexity(content), 100); // Cap at 100
    }

    private detectJSFramework(imports: ImportInfo[]): string | undefined {
        const modules = imports.map(imp => imp.module);
        
        if (modules.some(m => m.includes('react'))) return 'React';
        if (modules.some(m => m.includes('vue'))) return 'Vue.js';
        if (modules.some(m => m.includes('@angular'))) return 'Angular';
        if (modules.some(m => m.includes('express'))) return 'Express.js';
        if (modules.some(m => m.includes('next'))) return 'Next.js';
        
        return undefined;
    }

    private detectPythonFramework(imports: ImportInfo[]): string | undefined {
        const modules = imports.map(imp => imp.module);
        
        if (modules.some(m => m.includes('django'))) return 'Django';
        if (modules.some(m => m.includes('flask'))) return 'Flask';
        if (modules.some(m => m.includes('fastapi'))) return 'FastAPI';
        if (modules.some(m => m.includes('tornado'))) return 'Tornado';
        
        return undefined;
    }

    private getEmptyResult(): CodeAnalysisResult {
        return {
            functions: [],
            classes: [],
            imports: [],
            exports: [],
            dependencies: [],
            complexity: 0,
            language: 'unknown'
        };
    }
}
