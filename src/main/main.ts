import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import * as path from 'path';
import { spawn, exec } from 'child_process';
import { AIManager } from '../ai/AIManager';
import { ProjectMemoryManager } from '../ai/memory/ProjectMemoryManager';

class L2ApiAgent {
    private mainWindow: BrowserWindow | null = null;
    private aiManager: AIManager;
    private memoryManager: ProjectMemoryManager;

    constructor() {
        this.aiManager = new AIManager();
        this.memoryManager = new ProjectMemoryManager();
        this.initializeApp();
    }

    private initializeApp(): void {
        app.whenReady().then(() => {
            this.createWindow();
            this.setupMenus();
            this.setupIpcHandlers();
        });

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createWindow();
            }
        });
    }

    private createWindow(): void {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            },
            // icon: path.join(__dirname, '../../assets/icon.png'),
            title: 'L2Api Agent',
            show: false
        });

        const isDev = process.env.NODE_ENV === 'development';
        
        if (isDev) {
            this.mainWindow.loadURL('http://localhost:3000');
            this.mainWindow.webContents.openDevTools();
        } else {
            this.mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
        }

        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    private setupMenus(): void {
        const template = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Open File',
                        accelerator: 'CmdOrCtrl+Shift+O',
                        click: async () => {
                            // Execute the same code as the button - call the same IPC handler
                            await this.mainWindow?.webContents.executeJavaScript(`
                                (async () => {
                                    console.log('Opening file dialog from menu...');
                                    console.log('electronAPI available:', !!window.electronAPI);
                                    console.log('dialog available:', !!window.electronAPI?.dialog);
                                    
                                    if (window.electronAPI && window.electronAPI.dialog) {
                                        try {
                                            console.log('Calling dialog.openFile()...');
                                            const filePath = await window.electronAPI.dialog.openFile();
                                            console.log('Dialog returned:', filePath);
                                            if (filePath) {
                                                console.log('File opened from menu:', filePath);
                                                // Call the same openFile function as the button
                                                if (window.openFile) {
                                                    await window.openFile(filePath);
                                                }
                                            } else {
                                                console.log('No file selected');
                                            }
                                        } catch (error) {
                                            console.error('Failed to open file from menu:', error);
                                            alert('Ошибка открытия файла: ' + error);
                                        }
                                    } else {
                                        console.error('electronAPI or dialog not available');
                                        alert('electronAPI или dialog недоступны');
                                    }
                                })()
                            `);
                        }
                    },
                    {
                        label: 'Open Folder',
                        accelerator: 'CmdOrCtrl+O',
                        click: async () => {
                            // Execute the same code as the button - call the same IPC handler
                            await this.mainWindow?.webContents.executeJavaScript(`
                                (async () => {
                                    console.log('Opening folder dialog from menu...');
                                    if (window.electronAPI && window.electronAPI.dialog) {
                                        try {
                                            const projectPath = await window.electronAPI.dialog.openFolder();
                                            console.log('Dialog returned:', projectPath);
                                            if (projectPath) {
                                                console.log('Project opened from menu:', projectPath);
                                                // Call the same logic as the button
                                                if (window.setCurrentProject && window.loadProjectFiles) {
                                                    window.setCurrentProject(projectPath);
                                                    await window.loadProjectFiles(projectPath);
                                                }
                                            }
                                        } catch (error) {
                                            console.error('Failed to open folder from menu:', error);
                                        }
                                    } else {
                                        console.error('electronAPI or dialog not available');
                                    }
                                })()
                            `);
                        }
                    },
                    {
                        label: 'Save',
                        accelerator: 'CmdOrCtrl+S',
                        click: () => {
                            this.mainWindow?.webContents.send('save-file');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Exit',
                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                        click: () => {
                            app.quit();
                        }
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' }
                ]
            },
            {
                label: 'AI',
                submenu: [
                    {
                        label: 'Chat with AI',
                        accelerator: 'CmdOrCtrl+Shift+A',
                        click: () => {
                            console.log('AI Chat menu clicked');
                            this.mainWindow?.webContents.send('show-ai-chat');
                        }
                    },
                    {
                        label: 'AI Settings',
                        click: () => {
                            console.log('AI Settings menu clicked');
                            this.mainWindow?.webContents.send('show-ai-settings');
                        }
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { role: 'reload' },
                    { role: 'forceReload' },
                    { role: 'toggleDevTools' },
                    { type: 'separator' },
                    { role: 'resetZoom' },
                    { role: 'zoomIn' },
                    { role: 'zoomOut' },
                    { type: 'separator' },
                    {
                        label: 'Terminal',
                        accelerator: 'Ctrl+`',
                        click: () => {
                            this.mainWindow?.webContents.send('toggle-terminal');
                        }
                    },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template as any);
        Menu.setApplicationMenu(menu);
    }

    private setupIpcHandlers(): void {
        // AI related handlers
        ipcMain.handle('ai:send-message', async (event, message: string, context?: any) => {
            return await this.aiManager.sendMessage(message, context);
        });

        ipcMain.handle('ai:get-providers', async () => {
            return this.aiManager.getAvailableProviders();
        });

        ipcMain.handle('ai:set-provider', async (event, providerId: string, config: any) => {
            return this.aiManager.setProvider(providerId, config);
        });

        // AI UI handlers
        ipcMain.handle('ai:show-chat', async () => {
            console.log('AI show chat requested via IPC');
            this.mainWindow?.webContents.send('show-ai-chat');
            return true;
        });

        ipcMain.handle('ai:show-settings', async () => {
            console.log('AI show settings requested via IPC');
            this.mainWindow?.webContents.send('show-ai-settings');
            return true;
        });

        // Project memory handlers
        ipcMain.handle('memory:save-project-state', async (event, projectPath: string, state: any) => {
            return this.memoryManager.saveProjectState(projectPath, state);
        });

        ipcMain.handle('memory:load-project-state', async (event, projectPath: string) => {
            return this.memoryManager.loadProjectState(projectPath);
        });

        // File system handlers
        ipcMain.handle('fs:read-file', async (event, filePath: string) => {
            const fs = require('fs').promises;
            try {
                return await fs.readFile(filePath, 'utf-8');
            } catch (error) {
                throw new Error(`Failed to read file: ${error}`);
            }
        });

        ipcMain.handle('fs:write-file', async (event, filePath: string, content: string) => {
            const fs = require('fs').promises;
            try {
                await fs.writeFile(filePath, content, 'utf-8');
                return true;
            } catch (error) {
                throw new Error(`Failed to write file: ${error}`);
            }
        });

        ipcMain.handle('fs:read-directory', async (event, dirPath: string) => {
            const fs = require('fs').promises;
            const path = require('path');
            try {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                return entries.map((entry: any) => ({
                    name: entry.name,
                    path: path.join(dirPath, entry.name),
                    isDirectory: entry.isDirectory(),
                    isFile: entry.isFile()
                }));
            } catch (error) {
                throw new Error(`Failed to read directory: ${error}`);
            }
        });

        // Dialog handlers
        ipcMain.handle('dialog:open-file', async () => {
            const result = await dialog.showOpenDialog(this.mainWindow!, {
                properties: ['openFile'],
                filters: [
                    { name: 'All Files', extensions: ['*'] },
                    { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'less', 'py', 'java', 'cpp', 'c', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'sql', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'uc'] },
                    { name: 'UnrealScript', extensions: ['uc'] }
                ]
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
                return result.filePaths[0];
            }
            return null;
        });

        ipcMain.handle('dialog:open-folder', async () => {
            const result = await dialog.showOpenDialog(this.mainWindow!, {
                properties: ['openDirectory']
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
                return result.filePaths[0];
            }
            return null;
        });

        // Terminal handlers
        ipcMain.handle('terminal:execute-command', async (event, command: string, workingDirectory: string) => {
            try {
                return new Promise((resolve, reject) => {
                    // Use cmd.exe instead of PowerShell for better encoding support
                    const fullCommand = `chcp 65001 >nul && ${command}`;
                    
                    exec(fullCommand, { 
                        cwd: workingDirectory,
                        shell: 'cmd.exe',
                        maxBuffer: 1024 * 1024, // 1MB buffer
                        encoding: 'utf8'
                    }, (error, stdout, stderr) => {
                        if (error) {
                            resolve({
                                output: `Error: ${error.message}\n${stderr}`,
                                newDirectory: workingDirectory
                            });
                        } else {
                            let newDirectory = workingDirectory;
                            
                            // Handle cd command
                            if (command.trim().startsWith('cd ')) {
                                const targetDir = command.trim().substring(3).trim();
                                if (targetDir === '..') {
                                    newDirectory = path.dirname(workingDirectory);
                                } else if (targetDir.startsWith('\\') || targetDir.includes(':')) {
                                    newDirectory = targetDir;
                                } else {
                                    newDirectory = path.join(workingDirectory, targetDir);
                                }
                            }
                            
                            resolve({
                                output: stdout || stderr || 'Command executed successfully',
                                newDirectory: newDirectory
                            });
                        }
                    });
                });
            } catch (error) {
                return {
                    output: `Error: ${error instanceof Error ? error.message : String(error)}`,
                    newDirectory: workingDirectory
                };
            }
        });
    }
}

new L2ApiAgent();
