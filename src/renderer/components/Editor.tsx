import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as monaco from 'monaco-editor';

interface EditorProps {
    openFiles: string[];
    activeFile: string | null;
    fileContents: Map<string, string>;
    modifiedFiles: Set<string>;
    onFileContentChange: (filePath: string, content: string) => void;
    onFileClose: (filePath: string) => void;
    onFileCloseRequest: (filePath: string) => void;
    onFileSelect: (filePath: string) => void;
    onFileSave: (filePath: string) => Promise<void>;
}

interface EditorRef {
    closeFile: (filePath: string) => void;
}

const Editor = forwardRef<EditorRef, EditorProps>(({
    openFiles,
    activeFile,
    fileContents,
    modifiedFiles,
    onFileContentChange,
    onFileClose,
    onFileCloseRequest,
    onFileSelect,
    onFileSave
}, ref) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const modelsRef = useRef<Map<string, monaco.editor.ITextModel>>(new Map());

    const getLanguageFromExtension = (filePath: string): string => {
        const extension = filePath.split('.').pop()?.toLowerCase();
        
        switch (extension) {
            case 'js':
            case 'jsx':
                return 'javascript';
            case 'ts':
            case 'tsx':
                return 'typescript';
            case 'py':
                return 'python';
            case 'html':
                return 'html';
            case 'css':
                return 'css';
            case 'json':
                return 'json';
            case 'md':
                return 'markdown';
            case 'xml':
                return 'xml';
            case 'sql':
                return 'sql';
            case 'yaml':
            case 'yml':
                return 'yaml';
            case 'uc':
                return 'cpp'; // UnrealScript is similar to C++
            default:
                return 'plaintext';
        }
    };

    const getOrCreateModel = (filePath: string): monaco.editor.ITextModel => {
        let model = modelsRef.current.get(filePath);
        
        if (!model) {
            const content = fileContents.get(filePath) || '';
            const language = getLanguageFromExtension(filePath);
            const uri = monaco.Uri.file(filePath);
            
            model = monaco.editor.createModel(content, language, uri);
            modelsRef.current.set(filePath, model);

            // Set up content change listener for this model
            model.onDidChangeContent(() => {
                const currentContent = model!.getValue();
                onFileContentChange(filePath, currentContent);
            });
        }
        
        return model;
    };

    const handleFileCloseRequest = (filePath: string) => {
        // Simply delegate to parent component to handle dialog logic
        onFileCloseRequest(filePath);
    };

    const handleFileClose = (filePath: string) => {
        // This is called when file should actually be closed (after dialogs handled by parent)
        const model = modelsRef.current.get(filePath);
        if (model) {
            model.dispose();
            modelsRef.current.delete(filePath);
        }
        onFileClose(filePath);
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        closeFile: handleFileClose
    }));

    useEffect(() => {
        if (containerRef.current && !editorRef.current) {
            // Configure Monaco Editor theme
            monaco.editor.defineTheme('vs-dark-custom', {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: {
                    'editor.background': '#1e1e1e',
                    'editor.foreground': '#d4d4d4',
                    'editorLineNumber.foreground': '#858585',
                    'editor.selectionBackground': '#264f78',
                    'editor.inactiveSelectionBackground': '#3a3d41'
                }
            });

            // Create the editor
            editorRef.current = monaco.editor.create(containerRef.current, {
                theme: 'vs-dark-custom',
                automaticLayout: true,
                fontSize: 14,
                fontFamily: 'Cascadia Code, Fira Code, Consolas, monospace',
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 2,
                insertSpaces: true
            });

            // Set up save shortcut
            editorRef.current.addAction({
                id: 'save-file',
                label: 'Save File',
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
                run: async () => {
                    if (activeFile) {
                        try {
                            await onFileSave(activeFile);
                        } catch (error) {
                            console.error('Failed to save file:', error);
                        }
                    }
                }
            });
        }

        return () => {
            if (editorRef.current) {
                editorRef.current.dispose();
                editorRef.current = null;
            }
            // Dispose all models
            modelsRef.current.forEach(model => model.dispose());
            modelsRef.current.clear();
        };
    }, []);

    // Update editor model when active file changes
    useEffect(() => {
        console.log('Editor useEffect - activeFile:', activeFile);
        
        if (editorRef.current && activeFile) {
            const model = getOrCreateModel(activeFile);
            editorRef.current.setModel(model);
            console.log('Switched to model for:', activeFile);
        }
    }, [activeFile, fileContents]);

    const getFileName = (filePath: string): string => {
        return filePath.split(/[/\\]/).pop() || filePath;
    };

    const isFileModified = (filePath: string): boolean => {
        return modifiedFiles.has(filePath);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Tabs */}
            {openFiles.length > 0 && (
                <div style={{
                    display: 'flex',
                    backgroundColor: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    overflow: 'auto'
                }}>
                    {openFiles.map(filePath => (
                        <div
                            key={filePath}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px 12px',
                                backgroundColor: activeFile === filePath ? 'var(--bg-primary)' : 'transparent',
                                borderRight: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                minWidth: '120px',
                                fontSize: '13px',
                                color: activeFile === filePath ? 'var(--text-primary)' : 'var(--text-secondary)'
                            }}
                            onClick={() => onFileSelect(filePath)}
                        >
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {getFileName(filePath)}
                                {isFileModified(filePath) && ' •'}
                            </span>
                            <button
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    padding: '2px 4px',
                                    marginLeft: '8px',
                                    fontSize: '16px',
                                    lineHeight: 1
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileCloseRequest(filePath);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Editor */}
            <div style={{ flex: 1, position: 'relative' }}>
                {activeFile ? (
                    <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
                ) : (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '16px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ margin: '0 0 16px 0', fontWeight: 'normal' }}>L2Api Agent</h2>
                            <p>Open a file to start editing</p>
                            <p style={{ fontSize: '14px', marginTop: '16px' }}>
                                Press <kbd style={{ 
                                    background: 'var(--bg-tertiary)', 
                                    padding: '2px 6px', 
                                    borderRadius: '3px',
                                    border: '1px solid var(--border-color)'
                                }}>Ctrl+O</kbd> to open a project
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

Editor.displayName = 'Editor';

export default Editor;
export type { EditorRef };
