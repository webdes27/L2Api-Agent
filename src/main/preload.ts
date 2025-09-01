import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // AI API
    ai: {
        sendMessage: (message: string, context?: any) => 
            ipcRenderer.invoke('ai:send-message', message, context),
        getProviders: () => {
            console.log('Preload: getProviders called');
            return ipcRenderer.invoke('ai:get-providers').then((result) => {
                console.log('Preload: getProviders result:', result);
                return result;
            }).catch((error) => {
                console.error('Preload: getProviders error:', error);
                throw error;
            });
        },
        getCurrentProvider: () => 
            ipcRenderer.invoke('ai:get-current-provider'),
        loadProvider: (providerId: string) => 
            ipcRenderer.invoke('ai:load-provider', providerId),
        setProvider: (providerId: string, config: any) => {
            console.log('Preload: setProvider called with:', { providerId, config: { ...config, apiKey: config.apiKey ? '***' : 'undefined' } });
            return ipcRenderer.invoke('ai:set-provider', providerId, config).then((result) => {
                console.log('Preload: setProvider result:', result);
                return result;
            }).catch((error) => {
                console.error('Preload: setProvider error:', error);
                throw error;
            });
        },
        testConnection: () => {
            console.log('Preload: testConnection called');
            return ipcRenderer.invoke('ai:test-connection').then((result) => {
                console.log('Preload: testConnection result:', result);
                return result;
            }).catch((error) => {
                console.error('Preload: testConnection error:', error);
                throw error;
            });
        },
        showChat: () => ipcRenderer.invoke('ai:show-chat'),
        showSettings: () => ipcRenderer.invoke('ai:show-settings')
    },

    // Memory API
    memory: {
        saveProjectState: (projectPath: string, state: any) => 
            ipcRenderer.invoke('memory:save-project-state', projectPath, state),
        loadProjectState: (projectPath: string) => 
            ipcRenderer.invoke('memory:load-project-state', projectPath)
    },

    // File System API
    fs: {
        readFile: (filePath: string) => 
            ipcRenderer.invoke('fs:read-file', filePath),
        writeFile: (filePath: string, content: string) => 
            ipcRenderer.invoke('fs:write-file', filePath, content),
        readDirectory: (dirPath: string) => 
            ipcRenderer.invoke('fs:read-directory', dirPath)
    },

    // Dialog API
    dialog: {
        openFile: () => ipcRenderer.invoke('dialog:open-file'),
        openFolder: () => ipcRenderer.invoke('dialog:open-folder')
    },

    // Terminal API
    terminal: {
        executeCommand: (command: string, workingDirectory: string) => 
            ipcRenderer.invoke('terminal:execute-command', command, workingDirectory)
    },

    // Event listeners
    on: (channel: string, callback: (...args: any[]) => void) => {
        const validChannels = [
            'save-file',
            'show-ai-chat',
            'show-ai-settings',
            'toggle-terminal',
            'project:opened',
            'project:state-loaded',
            'file:opened',
            'main-log'
        ];
        
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, callback);
        }
    },

    // Remove listeners
    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    }
});

// Extend the Window interface
declare global {
    interface Window {
        electronAPI: {
            ai: {
                sendMessage: (message: string, context?: any) => Promise<any>;
                getProviders: () => Promise<any[]>;
                getCurrentProvider: () => Promise<string | null>;
                loadProvider: (providerId: string) => Promise<boolean>;
                setProvider: (providerId: string, config: any) => Promise<boolean>;
                testConnection: () => Promise<boolean>;
                showChat: () => Promise<boolean>;
                showSettings: () => Promise<boolean>;
            };
            memory: {
                saveProjectState: (projectPath: string, state: any) => Promise<boolean>;
                loadProjectState: (projectPath: string) => Promise<any>;
            };
            fs: {
                readFile: (filePath: string) => Promise<string>;
                writeFile: (filePath: string, content: string) => Promise<boolean>;
                readDirectory: (dirPath: string) => Promise<any[]>;
            };
            dialog: {
                openFile: () => Promise<string | null>;
                openFolder: () => Promise<string | null>;
            };
            terminal: {
                executeCommand: (command: string, workingDirectory: string) => Promise<{
                    output: string;
                    newDirectory: string;
                }>;
            };
            on: (channel: string, callback: (...args: any[]) => void) => void;
            removeAllListeners: (channel: string) => void;
        };
    }
}
