import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import Editor, { EditorRef } from './Editor';
import AIChat from './AIChat';
import StatusBar from './StatusBar';
import AISettings from './AISettings';
import ConfirmDialog from './ConfirmDialog';
import Terminal from './Terminal';

export interface FileNode {
    name: string;
    path: string;
    isDirectory: boolean;
    isFile: boolean;
    children?: FileNode[];
}

const App: React.FC = () => {
    const [currentProject, setCurrentProject] = useState<string | null>(null);
    const [openFiles, setOpenFiles] = useState<string[]>([]);
    const [activeFile, setActiveFile] = useState<string | null>(null);
    const [fileContents, setFileContents] = useState<Map<string, string>>(new Map());
    const [originalFileContents, setOriginalFileContents] = useState<Map<string, string>>(new Map());
    const [modifiedFiles, setModifiedFiles] = useState<Set<string>>(new Set());
    const [showAIChat, setShowAIChat] = useState(false);
    const [showAISettings, setShowAISettings] = useState(false);
    const [showTerminal, setShowTerminal] = useState(false);
    const [terminalHeight, setTerminalHeight] = useState(300);
    const [aiProvider, setAiProvider] = useState<string>('');
    const [projectFiles, setProjectFiles] = useState<FileNode[]>([]);
    
    // Panel sizes state
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [aiPanelWidth, setAiPanelWidth] = useState(350);
    
    // Editor ref for imperative operations
    const editorRef = useRef<EditorRef>(null);
    
    // Dialog state
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        filePath?: string;
        buttons: Array<{
            text: string;
            onClick: () => void;
            type?: 'primary' | 'secondary' | 'danger';
        }>;
    }>({
        isOpen: false,
        title: '',
        message: '',
        buttons: []
    });

    useEffect(() => {
        // Set up event listeners for main process communication
        console.log('App.tsx useEffect - checking electronAPI:', !!window.electronAPI);
        console.log('electronAPI object:', window.electronAPI);
        console.log('electronAPI.dialog:', window.electronAPI?.dialog);
        console.log('electronAPI.fs:', window.electronAPI?.fs);
        
        if (window.electronAPI) {
            console.log('electronAPI is available, setting up listeners');
            window.electronAPI.on('project:opened', (projectPath: string) => {
                console.log('Project opened:', projectPath);
                setCurrentProject(projectPath);
                loadProjectFiles(projectPath);
            });

            window.electronAPI.on('file:opened', (filePath: string) => {
                console.log('File opened:', filePath);
                openFile(filePath);
            });

            // Temporarily disabled to fix cloning error
            // window.electronAPI.on('project:state-loaded', (state: any) => {
            //     console.log('Project state loaded:', state);
            //     if (state.conversationHistory) {
            //         // Restore AI conversation
            //     }
            //     if (state.openFiles) {
            //         setOpenFiles(state.openFiles);
            //     }
            // });

            window.electronAPI.on('show-ai-chat', () => {
                console.log('Show AI Chat requested - setting showAIChat to true');
                setShowAIChat(true);
            });

            window.electronAPI.on('show-ai-settings', () => {
                console.log('Show AI Settings requested - setting showAISettings to true');
                setShowAISettings(true);
            });

            window.electronAPI.on('toggle-terminal', () => {
                console.log('Toggle Terminal requested');
                setShowTerminal(prev => !prev);
            });

            window.electronAPI.on('save-file', () => {
                if (activeFile) {
                    saveFile(activeFile);
                }
            });
        }

        return () => {
            // Cleanup event listeners
            if (window.electronAPI) {
                window.electronAPI.removeAllListeners('project:opened');
                window.electronAPI.removeAllListeners('file:opened');
                // window.electronAPI.removeAllListeners('project:state-loaded');
                window.electronAPI.removeAllListeners('show-ai-chat');
                window.electronAPI.removeAllListeners('show-ai-settings');
                window.electronAPI.removeAllListeners('toggle-terminal');
                window.electronAPI.removeAllListeners('save-file');
            }
        };
    }, [activeFile]);

    const loadDirectoryContents = async (dirPath: string): Promise<FileNode[]> => {
        try {
            console.log('Loading directory contents for:', dirPath);
            const files = await window.electronAPI.fs.readDirectory(dirPath);
            console.log('Directory contents:', files);
            
            const fileNodes = files.map((file: any) => {
                const node: FileNode = {
                    name: file.name,
                    path: file.path,
                    isDirectory: file.isDirectory,
                    isFile: file.isFile,
                    children: file.isDirectory ? [] : undefined // Empty array for directories, undefined for files
                };
                return node;
            });
            
            return fileNodes;
        } catch (error) {
            console.error('Error loading directory contents:', error);
            return [];
        }
    };

    const loadProjectFiles = async (projectPath: string) => {
        console.log('loadProjectFiles called with:', projectPath);
        const fileNodes = await loadDirectoryContents(projectPath);
        console.log('Final fileNodes:', fileNodes);
        setProjectFiles(fileNodes);
        console.log('Project files set successfully');
    };

    const handleFolderToggle = async (folderPath: string) => {
        console.log('Toggling folder:', folderPath);
        
        // Update the specific folder node to load its children
        const updateNodeChildren = async (nodes: FileNode[]): Promise<FileNode[]> => {
            const updatedNodes = [];
            for (const node of nodes) {
                if (node.path === folderPath && node.isDirectory) {
                    // Load children if they haven't been loaded yet (empty array means not loaded)
                    if (node.children && node.children.length === 0) {
                        console.log('Loading children for folder:', folderPath);
                        const children = await loadDirectoryContents(folderPath);
                        updatedNodes.push({
                            ...node,
                            children
                        });
                    } else {
                        updatedNodes.push(node);
                    }
                } else if (node.children && node.children.length > 0) {
                    // Recursively update children
                    const updatedChildren = await updateNodeChildren(node.children);
                    updatedNodes.push({
                        ...node,
                        children: updatedChildren
                    });
                } else {
                    updatedNodes.push(node);
                }
            }
            return updatedNodes;
        };

        const updatedFiles = await updateNodeChildren(projectFiles);
        setProjectFiles(updatedFiles);
    };

    const openFile = async (filePath: string) => {
        console.log('openFile called with:', filePath);
        
        try {
            // Always read the file content
            console.log('Reading file content...');
            const content = await window.electronAPI.fs.readFile(filePath);
            console.log('File content length:', content.length);
            
            // Update file contents
            setFileContents(prev => {
                const newMap = new Map(prev);
                newMap.set(filePath, content);
                console.log('Updated fileContents, new size:', newMap.size);
                return newMap;
            });

            // Store original content for comparison
            setOriginalFileContents(prev => {
                if (!prev.has(filePath)) {
                    const newMap = new Map(prev);
                    newMap.set(filePath, content);
                    return newMap;
                }
                return prev;
            });

            // Add to open files if not already there
            if (!openFiles.includes(filePath)) {
                console.log('Adding file to openFiles');
                setOpenFiles(prev => {
                    const newOpenFiles = [...prev, filePath];
                    console.log('New openFiles:', newOpenFiles);
                    return newOpenFiles;
                });
            }
            
            // Set as active file
            console.log('Setting active file to:', filePath);
            setActiveFile(filePath);
            
        } catch (error) {
            console.error('Failed to open file:', error);
            alert(`Ошибка открытия файла: ${error}`);
        }
    };

    // Make functions available globally for menu access
    useEffect(() => {
        (window as any).openFile = openFile;
        (window as any).setCurrentProject = setCurrentProject;
        (window as any).loadProjectFiles = loadProjectFiles;
        return () => {
            delete (window as any).openFile;
            delete (window as any).setCurrentProject;
            delete (window as any).loadProjectFiles;
        };
    }, [openFiles]); // Re-create when openFiles changes

    const closeFile = (filePath: string) => {
        setOpenFiles(prev => prev.filter(path => path !== filePath));
        setFileContents(prev => {
            const newMap = new Map(prev);
            newMap.delete(filePath);
            return newMap;
        });
        
        if (activeFile === filePath) {
            const remainingFiles = openFiles.filter(path => path !== filePath);
            setActiveFile(remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1] : null);
        }
    };

    const saveFile = async (filePath: string): Promise<void> => {
        const content = fileContents.get(filePath);
        if (content !== undefined) {
            try {
                await window.electronAPI.fs.writeFile(filePath, content);
                console.log('File saved:', filePath);
                
                // Update original content and clear modified flag
                setOriginalFileContents(prev => {
                    const newMap = new Map(prev);
                    newMap.set(filePath, content);
                    return newMap;
                });
                
                setModifiedFiles(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(filePath);
                    return newSet;
                });
            } catch (error) {
                console.error('Failed to save file:', error);
                throw error; // Re-throw so caller can handle it
            }
        }
    };

    const updateFileContent = (filePath: string, content: string) => {
        setFileContents(prev => {
            const newMap = new Map(prev);
            newMap.set(filePath, content);
            return newMap;
        });

        // Check if file is modified
        const originalContent = originalFileContents.get(filePath) || '';
        if (content !== originalContent) {
            setModifiedFiles(prev => new Set(prev).add(filePath));
        } else {
            setModifiedFiles(prev => {
                const newSet = new Set(prev);
                newSet.delete(filePath);
                return newSet;
            });
        }
    };

    const closeDialog = () => {
        setDialogState(prev => ({ ...prev, isOpen: false }));
    };

    const showSaveDialog = (filePath: string) => {
        const fileName = filePath.split(/[/\\]/).pop() || filePath;
        
        setDialogState({
            isOpen: true,
            title: 'Unsaved Changes',
            message: `File "${fileName}" has unsaved changes.\n\nDo you want to save your changes?`,
            filePath,
            buttons: [
                {
                    text: 'Save',
                    type: 'primary',
                    onClick: async () => {
                        closeDialog();
                        try {
                            await saveFile(filePath);
                            // File saved successfully, close it
                            if (editorRef.current) {
                                editorRef.current.closeFile(filePath);
                            }
                        } catch (error) {
                            console.error('Failed to save file:', error);
                            showSaveErrorDialog(filePath, fileName);
                        }
                    }
                },
                {
                    text: "Don't Save",
                    type: 'danger',
                    onClick: () => {
                        closeDialog();
                        showDiscardDialog(filePath, fileName);
                    }
                },
                {
                    text: 'Cancel',
                    type: 'secondary',
                    onClick: () => {
                        closeDialog();
                        // File stays open, do nothing
                    }
                }
            ]
        });
    };

    const showDiscardDialog = (filePath: string, fileName: string) => {
        setDialogState({
            isOpen: true,
            title: 'Discard Changes',
            message: `Are you sure you want to discard all changes to "${fileName}"?\n\nThis action cannot be undone.`,
            filePath,
            buttons: [
                {
                    text: 'Discard Changes',
                    type: 'danger',
                    onClick: () => {
                        closeDialog();
                        if (editorRef.current) {
                            editorRef.current.closeFile(filePath);
                        }
                    }
                },
                {
                    text: 'Keep Open',
                    type: 'secondary',
                    onClick: () => {
                        closeDialog();
                        // File stays open, do nothing
                    }
                }
            ]
        });
    };

    const showSaveErrorDialog = (filePath: string, fileName: string) => {
        setDialogState({
            isOpen: true,
            title: 'Save Failed',
            message: `Failed to save file "${fileName}".\n\nDo you want to close the file anyway and lose your changes?`,
            filePath,
            buttons: [
                {
                    text: 'Close Anyway',
                    type: 'danger',
                    onClick: () => {
                        closeDialog();
                        if (editorRef.current) {
                            editorRef.current.closeFile(filePath);
                        }
                    }
                },
                {
                    text: 'Keep Open',
                    type: 'secondary',
                    onClick: () => {
                        closeDialog();
                        // File stays open, do nothing
                    }
                }
            ]
        });
    };

    const handleFileCloseRequest = (filePath: string) => {
        if (modifiedFiles.has(filePath)) {
            showSaveDialog(filePath);
        } else {
            // File not modified, close directly
            if (editorRef.current) {
                editorRef.current.closeFile(filePath);
            }
        }
    };

    const handleSendToAI = (command: string) => {
        if (showAIChat) {
            // Send command to AI chat
            const message = `Execute this terminal command and explain what it does:\n\`\`\`bash\n${command}\n\`\`\``;
            // You can implement this by exposing a method from AIChat component
            // For now, we'll just show the AI chat if it's not visible
            if (!showAIChat) {
                setShowAIChat(true);
            }
        } else {
            // Show AI chat and send the command
            setShowAIChat(true);
            // The command will be sent when AI chat is ready
        }
    };

    const saveProjectState = async () => {
        if (currentProject) {
            const state = {
                conversationHistory: [], // This would come from AIChat component
                openFiles,
                recentChanges: [], // This would track file changes
                metadata: {
                    activeFile,
                    aiProvider
                }
            };

            try {
                await window.electronAPI.memory.saveProjectState(currentProject, state);
            } catch (error) {
                console.error('Failed to save project state:', error);
            }
        }
    };

    // Auto-save project state periodically
    useEffect(() => {
        const interval = setInterval(saveProjectState, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, [currentProject, openFiles, activeFile, aiProvider]);

    // Helper function to get file language from extension
    const getFileLanguage = (filePath: string | null): string => {
        if (!filePath) return 'Text';
        
        const extension = filePath.split('.').pop()?.toLowerCase();
        const languageMap: { [key: string]: string } = {
            'js': 'JavaScript',
            'ts': 'TypeScript',
            'jsx': 'React JSX',
            'tsx': 'React TSX',
            'html': 'HTML',
            'css': 'CSS',
            'scss': 'SCSS',
            'sass': 'Sass',
            'json': 'JSON',
            'xml': 'XML',
            'md': 'Markdown',
            'py': 'Python',
            'java': 'Java',
            'cpp': 'C++',
            'c': 'C',
            'cs': 'C#',
            'php': 'PHP',
            'rb': 'Ruby',
            'go': 'Go',
            'rs': 'Rust',
            'swift': 'Swift',
            'kt': 'Kotlin',
            'scala': 'Scala',
            'uc': 'UnrealScript',
            'txt': 'Text',
            'log': 'Log'
        };
        
        return languageMap[extension || ''] || 'Text';
    };

    // Resize handlers
    const handleSidebarResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Sidebar resize start');
        
        const startX = e.clientX;
        const startWidth = sidebarWidth;
        
        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            const newWidth = Math.max(200, Math.min(600, startWidth + deltaX));
            console.log('Sidebar resizing:', newWidth);
            setSidebarWidth(newWidth);
        };
        
        const handleMouseUp = () => {
            console.log('Sidebar resize end');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleAiPanelResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('AI Panel resize start');
        
        const startX = e.clientX;
        const startWidth = aiPanelWidth;
        
        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = startX - e.clientX; // Reverse for right panel
            const newWidth = Math.max(250, Math.min(800, startWidth + deltaX));
            console.log('AI Panel resizing:', newWidth);
            setAiPanelWidth(newWidth);
        };
        
        const handleMouseUp = () => {
            console.log('AI Panel resize end');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="app">
            <div className="main-container">
                {/* Левая панель - Дерево проекта */}
                <div 
                    className="sidebar"
                    style={{ 
                        width: `${sidebarWidth}px`,
                        flex: `0 0 ${sidebarWidth}px`
                    }}
                >
                    <Sidebar
                        projectFiles={projectFiles}
                        onFileSelect={openFile}
                        onFolderToggle={handleFolderToggle}
                        currentProject={currentProject}
                    />
                </div>

                {/* Разделитель для левой панели */}
                <div 
                    className="resizer"
                    onMouseDown={handleSidebarResizeStart}
                    style={{
                        width: '8px',
                        background: 'transparent',
                        cursor: 'col-resize',
                        zIndex: 1000
                    }}
                />

                {/* Центральная панель - Редактор */}
                <div className="content-area" style={{ position: 'relative' }}>
                    {openFiles.length === 0 ? (
                        <>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                height: showTerminal ? `calc(100% - ${terminalHeight}px)` : '100%',
                                color: 'var(--text-secondary)',
                                fontSize: '16px',
                                transition: 'height 0.2s ease'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h2>Добро пожаловать в L2Api Agent!</h2>
                                    <p>Откройте файл или папку для начала работы</p>
                                    <div style={{ marginTop: '20px' }}>
                                        <button 
                                            className="button primary"
                                            onClick={async () => {
                                                console.log('Opening file dialog...');
                                                console.log('electronAPI available:', !!window.electronAPI);
                                                console.log('dialog available:', !!window.electronAPI?.dialog);
                                                
                                                if (window.electronAPI && window.electronAPI.dialog) {
                                                    try {
                                                        console.log('Calling dialog.openFile()...');
                                                        const filePath = await window.electronAPI.dialog.openFile();
                                                        console.log('Dialog returned:', filePath);
                                                        if (filePath) {
                                                            console.log('File opened from welcome screen:', filePath);
                                                            await openFile(filePath);
                                                        } else {
                                                            console.log('No file selected');
                                                        }
                                                    } catch (error) {
                                                        console.error('Failed to open file:', error);
                                                        alert(`Ошибка открытия файла: ${error}`);
                                                    }
                                                } else {
                                                    console.error('electronAPI or dialog not available');
                                                    alert('electronAPI или dialog недоступны');
                                                }
                                            }}
                                            style={{ marginRight: '10px' }}
                                        >
                                            Открыть файл
                                        </button>
                                        <button 
                                            className="button primary"
                                            onClick={async () => {
                                                console.log('Opening folder dialog...');
                                                if (window.electronAPI && window.electronAPI.dialog) {
                                                    try {
                                                        const projectPath = await window.electronAPI.dialog.openFolder();
                                                        console.log('Dialog returned:', projectPath);
                                                        if (projectPath) {
                                                            console.log('Project opened from welcome screen:', projectPath);
                                                            setCurrentProject(projectPath);
                                                            await loadProjectFiles(projectPath);
                                                        }
                                                    } catch (error) {
                                                        console.error('Failed to open folder:', error);
                                                    }
                                                } else {
                                                    console.error('electronAPI or dialog not available');
                                                }
                                            }}
                                        >
                                            Открыть папку
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <Terminal
                                isVisible={showTerminal}
                                onClose={() => setShowTerminal(false)}
                                onSendToAI={handleSendToAI}
                                height={terminalHeight}
                                onHeightChange={setTerminalHeight}
                            />
                        </>
                    ) : (
                        <>
                            <div style={{ 
                                height: showTerminal ? `calc(100% - ${terminalHeight}px)` : '100%',
                                transition: 'height 0.2s ease'
                            }}>
                                <Editor
                                    ref={editorRef}
                                    openFiles={openFiles}
                                    activeFile={activeFile}
                                    fileContents={fileContents}
                                    modifiedFiles={modifiedFiles}
                                    onFileContentChange={updateFileContent}
                                    onFileClose={closeFile}
                                    onFileCloseRequest={handleFileCloseRequest}
                                    onFileSelect={setActiveFile}
                                    onFileSave={saveFile}
                                />
                            </div>
                            <Terminal
                                isVisible={showTerminal}
                                onClose={() => setShowTerminal(false)}
                                onSendToAI={handleSendToAI}
                                height={terminalHeight}
                                onHeightChange={setTerminalHeight}
                            />
                        </>
                    )}
                </div>

                {/* Разделитель для правой панели */}
                <div 
                    className="resizer"
                    onMouseDown={handleAiPanelResizeStart}
                    style={{
                        width: '8px',
                        background: 'transparent',
                        cursor: 'col-resize',
                        zIndex: 1000
                    }}
                />

                {/* Правая панель - AI Agent */}
                <div 
                    className="ai-panel"
                    style={{ 
                        width: `${aiPanelWidth}px`,
                        flex: `0 0 ${aiPanelWidth}px`
                    }}
                >
                    {showAIChat ? (
                        <AIChat
                            onClose={() => setShowAIChat(false)}
                            currentFile={activeFile || undefined}
                            selectedCode=""
                            projectPath={currentProject || undefined}
                            fileContent={fileContents.get(activeFile || '')}
                            fileLanguage={getFileLanguage(activeFile)}
                            cursorPosition={{ line: 1, column: 1 }} // This should come from editor
                        />
                    ) : showAISettings ? (
                        <AISettings
                            onClose={() => setShowAISettings(false)}
                            onProviderChange={setAiProvider}
                        />
                    ) : (
                        <div className="ai-welcome">
                            <h3>AI Assistant</h3>
                            <p>Нажмите кнопки ниже для работы с AI</p>
                            <div className="ai-buttons">
                                <button 
                                    className="button primary"
                                    onClick={() => setShowAIChat(true)}
                                >
                                    💬 Chat with AI
                                </button>
                                <button 
                                    className="button"
                                    onClick={() => setShowAISettings(true)}
                                >
                                    ⚙️ AI Settings
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <StatusBar
                currentProject={currentProject}
                activeFile={activeFile}
                aiProvider={aiProvider}
                onShowAIChat={() => setShowAIChat(true)}
                onShowAISettings={() => setShowAISettings(true)}
            />
            
            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={dialogState.isOpen}
                title={dialogState.title}
                message={dialogState.message}
                buttons={dialogState.buttons}
                onClose={closeDialog}
            />
        </div>
    );
};

export default App;
