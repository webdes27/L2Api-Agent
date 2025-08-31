import * as fs from 'fs';
import * as path from 'path';
import { MemoryEntry, ProjectContext, AIMessage, FileTree, FileChange } from '../types/AITypes';

export interface ProjectMemory {
    id: string;
    projectPath: string;
    timestamp: number;
    context: ProjectContext;
    conversationHistory: AIMessage[];
    metadata: {
        lastOpened: number;
        openFiles: string[];
        recentChanges: FileChange[];
        gitInfo?: {
            branch: string;
            lastCommit: string;
            status: string;
        };
        userPreferences?: {
            preferredLanguage?: string;
            codeStyle?: string;
            aiProvider?: string;
        };
        projectStats?: {
            totalFiles: number;
            totalLines: number;
            languages: { [lang: string]: number };
        };
    };
}

export class ProjectMemoryManager {
    private memoryDir: string;
    private cache: Map<string, ProjectMemory> = new Map();
    private cacheTimeout = 5 * 60 * 1000; // 5 minutes

    constructor() {
        // Store memory in user's app data directory
        const os = require('os');
        this.memoryDir = path.join(os.homedir(), '.l2api-agent', 'memory');
        this.ensureMemoryDir();
    }

    private ensureMemoryDir(): void {
        if (!fs.existsSync(this.memoryDir)) {
            fs.mkdirSync(this.memoryDir, { recursive: true });
        }
    }

    public async saveProjectState(projectPath: string, state: {
        conversationHistory: AIMessage[];
        openFiles: string[];
        recentChanges: FileChange[];
        metadata?: any;
    }): Promise<boolean> {
        try {
            const projectContext = await this.analyzeProject(projectPath);
            const gitInfo = await this.getGitInfo(projectPath);
            const projectStats = await this.getProjectStats(projectPath);
            
            const memoryEntry: ProjectMemory = {
                id: this.generateId(projectPath),
                projectPath,
                timestamp: Date.now(),
                context: {
                    ...projectContext,
                    openFiles: state.openFiles,
                    recentChanges: state.recentChanges
                },
                conversationHistory: state.conversationHistory,
                metadata: {
                    lastOpened: Date.now(),
                    openFiles: state.openFiles,
                    recentChanges: state.recentChanges,
                    gitInfo,
                    userPreferences: state.metadata?.userPreferences || {},
                    projectStats
                }
            };

            const memoryFile = this.getMemoryFilePath(projectPath);
            await fs.promises.writeFile(
                memoryFile, 
                JSON.stringify(memoryEntry, null, 2),
                'utf-8'
            );

            // Update cache
            this.cache.set(projectPath, memoryEntry);

            // Also save a backup
            const backupFile = `${memoryFile}.backup`;
            if (fs.existsSync(memoryFile.replace('.json', '.backup.json'))) {
                await fs.promises.copyFile(
                    memoryFile.replace('.json', '.backup.json'),
                    backupFile
                );
            }
            await fs.promises.copyFile(memoryFile, memoryFile.replace('.json', '.backup.json'));

            return true;
        } catch (error) {
            console.error('Failed to save project state:', error);
            return false;
        }
    }

    public async loadProjectState(projectPath: string): Promise<ProjectMemory | null> {
        try {
            // Check cache first
            const cached = this.cache.get(projectPath);
            if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                return cached;
            }

            const memoryFile = this.getMemoryFilePath(projectPath);
            
            if (!fs.existsSync(memoryFile)) {
                return null;
            }

            const content = await fs.promises.readFile(memoryFile, 'utf-8');
            const memoryEntry: ProjectMemory = JSON.parse(content);

            // Validate the memory entry
            if (!this.isValidMemoryEntry(memoryEntry)) {
                console.warn('Invalid memory entry found, attempting to recover from backup');
                return await this.loadBackupState(projectPath);
            }

            // Update cache
            this.cache.set(projectPath, memoryEntry);

            return memoryEntry;
        } catch (error) {
            console.error('Failed to load project state:', error);
            // Try to load from backup
            return await this.loadBackupState(projectPath);
        }
    }

    private async loadBackupState(projectPath: string): Promise<ProjectMemory | null> {
        try {
            const backupFile = this.getMemoryFilePath(projectPath).replace('.json', '.backup.json');
            
            if (!fs.existsSync(backupFile)) {
                return null;
            }

            const content = await fs.promises.readFile(backupFile, 'utf-8');
            const memoryEntry: ProjectMemory = JSON.parse(content);

            if (this.isValidMemoryEntry(memoryEntry)) {
                return memoryEntry;
            }

            return null;
        } catch (error) {
            console.error('Failed to load backup state:', error);
            return null;
        }
    }

    public async getProjectMemories(): Promise<ProjectMemory[]> {
        try {
            const files = await fs.promises.readdir(this.memoryDir);
            const memoryFiles = files.filter(f => f.endsWith('.json') && !f.includes('.backup'));
            
            const memories: ProjectMemory[] = [];
            
            for (const file of memoryFiles) {
                try {
                    const content = await fs.promises.readFile(
                        path.join(this.memoryDir, file), 
                        'utf-8'
                    );
                    const memory: ProjectMemory = JSON.parse(content);
                    
                    if (this.isValidMemoryEntry(memory)) {
                        memories.push(memory);
                    }
                } catch (error) {
                    console.warn(`Failed to load memory file ${file}:`, error);
                }
            }

            return memories.sort((a, b) => b.metadata.lastOpened - a.metadata.lastOpened);
        } catch (error) {
            console.error('Failed to get project memories:', error);
            return [];
        }
    }

    public async deleteProjectMemory(projectPath: string): Promise<boolean> {
        try {
            const memoryFile = this.getMemoryFilePath(projectPath);
            const backupFile = memoryFile.replace('.json', '.backup.json');
            
            if (fs.existsSync(memoryFile)) {
                await fs.promises.unlink(memoryFile);
            }
            
            if (fs.existsSync(backupFile)) {
                await fs.promises.unlink(backupFile);
            }

            // Remove from cache
            this.cache.delete(projectPath);
            
            return true;
        } catch (error) {
            console.error('Failed to delete project memory:', error);
            return false;
        }
    }

    public async updateProjectMetadata(projectPath: string, updates: Partial<ProjectMemory['metadata']>): Promise<boolean> {
        try {
            const memory = await this.loadProjectState(projectPath);
            if (!memory) {
                return false;
            }

            memory.metadata = { ...memory.metadata, ...updates };
            memory.timestamp = Date.now();

            const memoryFile = this.getMemoryFilePath(projectPath);
            await fs.promises.writeFile(
                memoryFile, 
                JSON.stringify(memory, null, 2),
                'utf-8'
            );

            // Update cache
            this.cache.set(projectPath, memory);

            return true;
        } catch (error) {
            console.error('Failed to update project metadata:', error);
            return false;
        }
    }

    public async getRecentProjects(limit: number = 10): Promise<ProjectMemory[]> {
        const memories = await this.getProjectMemories();
        return memories.slice(0, limit);
    }

    public async searchProjects(query: string): Promise<ProjectMemory[]> {
        const memories = await this.getProjectMemories();
        const lowerQuery = query.toLowerCase();
        
        return memories.filter(memory => 
            memory.projectPath.toLowerCase().includes(lowerQuery) ||
            memory.context.language.toLowerCase().includes(lowerQuery) ||
            (memory.context.framework && memory.context.framework.toLowerCase().includes(lowerQuery))
        );
    }

    private async analyzeProject(projectPath: string): Promise<ProjectContext> {
        try {
            const structure = await this.buildFileTree(projectPath);
            const language = this.detectPrimaryLanguage(structure);
            const framework = this.detectFramework(structure, projectPath);
            const dependencies = await this.getDependencies(projectPath);

            return {
                projectPath,
                language,
                framework,
                dependencies,
                structure,
                openFiles: [],
                recentChanges: []
            };
        } catch (error) {
            console.error('Failed to analyze project:', error);
            return {
                projectPath,
                language: 'unknown',
                dependencies: [],
                structure: {},
                openFiles: [],
                recentChanges: []
            };
        }
    }

    private async getGitInfo(projectPath: string): Promise<{ branch: string; lastCommit: string; status: string } | undefined> {
        try {
            const { execSync } = require('child_process');
            
            // Check if it's a git repository
            const gitDir = path.join(projectPath, '.git');
            if (!fs.existsSync(gitDir)) {
                return undefined;
            }

            const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: projectPath }).toString().trim();
            const lastCommit = execSync('git rev-parse HEAD', { cwd: projectPath }).toString().trim().substring(0, 8);
            const status = execSync('git status --porcelain', { cwd: projectPath }).toString().trim();

            return { branch, lastCommit, status };
        } catch (error) {
            console.warn('Failed to get git info:', error);
            return undefined;
        }
    }

    private async getProjectStats(projectPath: string): Promise<{ totalFiles: number; totalLines: number; languages: { [lang: string]: number } }> {
        const stats = {
            totalFiles: 0,
            totalLines: 0,
            languages: {} as { [lang: string]: number }
        };

        const languageMap: { [ext: string]: string } = {
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'javascript',
            '.tsx': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.cs': 'csharp',
            '.cpp': 'cpp',
            '.c': 'c',
            '.go': 'go',
            '.rs': 'rust',
            '.php': 'php',
            '.rb': 'ruby',
            '.swift': 'swift',
            '.kt': 'kotlin',
            '.html': 'html',
            '.css': 'css',
            '.scss': 'scss',
            '.json': 'json',
            '.xml': 'xml',
            '.md': 'markdown'
        };

        const countFiles = async (dirPath: string): Promise<void> => {
            try {
                const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
                
                for (const entry of entries) {
                    if (entry.name.startsWith('.') || 
                        ['node_modules', 'dist', 'build', 'out', '__pycache__', 'venv', '.git'].includes(entry.name)) {
                        continue;
                    }

                    const fullPath = path.join(dirPath, entry.name);

                    if (entry.isDirectory()) {
                        await countFiles(fullPath);
                    } else {
                        stats.totalFiles++;
                        const ext = path.extname(entry.name).toLowerCase();
                        const language = languageMap[ext] || 'other';
                        stats.languages[language] = (stats.languages[language] || 0) + 1;

                        try {
                            const content = await fs.promises.readFile(fullPath, 'utf-8');
                            const lines = content.split('\n').length;
                            stats.totalLines += lines;
                        } catch {
                            // Ignore binary files
                        }
                    }
                }
            } catch (error) {
                console.warn(`Failed to count files in ${dirPath}:`, error);
            }
        };

        await countFiles(projectPath);
        return stats;
    }

    private async buildFileTree(dirPath: string, maxDepth: number = 3, currentDepth: number = 0): Promise<FileTree> {
        const tree: FileTree = {};

        if (currentDepth >= maxDepth) {
            return tree;
        }

        try {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                // Skip hidden files and common ignored directories
                if (entry.name.startsWith('.') || 
                    ['node_modules', 'dist', 'build', 'out', '__pycache__', 'venv'].includes(entry.name)) {
                    continue;
                }

                const fullPath = path.join(dirPath, entry.name);
                const relativePath = path.relative(dirPath, fullPath);

                if (entry.isDirectory()) {
                    tree[relativePath] = {
                        type: 'directory',
                        children: await this.buildFileTree(fullPath, maxDepth, currentDepth + 1)
                    };
                } else {
                    const stats = await fs.promises.stat(fullPath);
                    tree[relativePath] = {
                        type: 'file',
                        lastModified: stats.mtime.getTime(),
                        size: stats.size
                    };
                }
            }
        } catch (error) {
            console.warn(`Failed to read directory ${dirPath}:`, error);
        }

        return tree;
    }

    private detectPrimaryLanguage(structure: FileTree): string {
        const extensions: { [ext: string]: number } = {};
        
        const countExtensions = (tree: FileTree) => {
            for (const [name, node] of Object.entries(tree)) {
                if (node.type === 'file') {
                    const ext = path.extname(name).toLowerCase();
                    if (ext) {
                        extensions[ext] = (extensions[ext] || 0) + 1;
                    }
                } else if (node.children) {
                    countExtensions(node.children);
                }
            }
        };

        countExtensions(structure);

        // Language mapping
        const languageMap: { [ext: string]: string } = {
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'javascript',
            '.tsx': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.cs': 'csharp',
            '.cpp': 'cpp',
            '.c': 'c',
            '.go': 'go',
            '.rs': 'rust',
            '.php': 'php',
            '.rb': 'ruby',
            '.swift': 'swift',
            '.kt': 'kotlin'
        };

        let maxCount = 0;
        let primaryLanguage = 'unknown';

        for (const [ext, count] of Object.entries(extensions)) {
            if (count > maxCount && languageMap[ext]) {
                maxCount = count;
                primaryLanguage = languageMap[ext];
            }
        }

        return primaryLanguage;
    }

    private detectFramework(structure: FileTree, projectPath: string): string | undefined {
        // Check for common framework indicators
        if (structure['package.json']) {
            // Check for React/Next.js/etc
            try {
                const packageJsonPath = path.join(projectPath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
                    
                    if (deps.next) return 'Next.js';
                    if (deps.react) return 'React';
                    if (deps.vue) return 'Vue.js';
                    if (deps.angular || deps['@angular/core']) return 'Angular';
                    if (deps.express) return 'Express.js';
                }
            } catch (error) {
                // Ignore parsing errors
            }
        }

        if (structure['requirements.txt'] || structure['setup.py'] || structure['pyproject.toml']) {
            return 'Python';
        }

        if (structure['Cargo.toml']) {
            return 'Rust';
        }

        if (structure['go.mod']) {
            return 'Go';
        }

        return undefined;
    }

    private async getDependencies(projectPath: string): Promise<string[]> {
        const dependencies: string[] = [];

        // JavaScript/TypeScript
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
                dependencies.push(...Object.keys(deps));
            } catch (error) {
                // Ignore parsing errors
            }
        }

        // Python
        const requirementsPath = path.join(projectPath, 'requirements.txt');
        if (fs.existsSync(requirementsPath)) {
            try {
                const content = fs.readFileSync(requirementsPath, 'utf-8');
                const pythonDeps = content.split('\n')
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('#'))
                    .map(line => line.split('==')[0].split('>=')[0].split('<=')[0]);
                dependencies.push(...pythonDeps);
            } catch (error) {
                // Ignore parsing errors
            }
        }

        return dependencies;
    }

    private generateId(projectPath: string): string {
        return Buffer.from(projectPath).toString('base64').replace(/[/+=]/g, '');
    }

    private getMemoryFilePath(projectPath: string): string {
        const id = this.generateId(projectPath);
        return path.join(this.memoryDir, `${id}.json`);
    }

    private isValidMemoryEntry(entry: any): entry is ProjectMemory {
        return entry &&
               typeof entry.id === 'string' &&
               typeof entry.projectPath === 'string' &&
               typeof entry.timestamp === 'number' &&
               entry.context &&
               Array.isArray(entry.conversationHistory) &&
               entry.metadata;
    }

    public clearCache(): void {
        this.cache.clear();
    }
}
