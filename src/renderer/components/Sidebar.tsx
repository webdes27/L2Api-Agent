import React, { useState } from 'react';
import { FileNode } from './App';

interface SidebarProps {
    projectFiles: FileNode[];
    onFileSelect: (filePath: string) => void;
    onFolderToggle: (folderPath: string) => Promise<void>;
    currentProject: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ projectFiles, onFileSelect, onFolderToggle, currentProject }) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const toggleFolder = async (folderPath: string) => {
        // First toggle the visual state
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderPath)) {
                newSet.delete(folderPath);
            } else {
                newSet.add(folderPath);
                // Load folder contents when expanding
                onFolderToggle(folderPath);
            }
            return newSet;
        });
    };

    const getFileIcon = (fileName: string, isDirectory: boolean) => {
        if (isDirectory) {
            return '📁';
        }

        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js':
            case 'jsx':
                return '📄';
            case 'ts':
            case 'tsx':
                return '📘';
            case 'py':
                return '🐍';
            case 'html':
                return '🌐';
            case 'css':
                return '🎨';
            case 'json':
                return '📋';
            case 'md':
                return '📝';
            case 'uc':
                return '🎮';
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'svg':
                return '🖼️';
            default:
                return '📄';
        }
    };

    const renderFileTree = (nodes: FileNode[], depth: number = 0) => {
        return nodes.map(node => (
            <div key={node.path} style={{ marginLeft: depth * 16 }}>
                <div
                    className="file-item"
                    onClick={() => {
                        if (node.isDirectory) {
                            toggleFolder(node.path);
                        } else {
                            onFileSelect(node.path);
                        }
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        borderRadius: '3px',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <span className="file-icon" style={{ marginRight: '6px', fontSize: '14px' }}>
                        {node.isDirectory ? (expandedFolders.has(node.path) ? '📂' : '📁') : getFileIcon(node.name, false)}
                    </span>
                    <span className="file-name" style={{ 
                        flex: 1, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                    }}>
                        {node.name}
                    </span>
                </div>
                
                {node.isDirectory && expandedFolders.has(node.path) && node.children && (
                    <div>
                        {renderFileTree(node.children, depth + 1)}
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header" style={{ 
                padding: '12px 16px', 
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)'
            }}>
                <h3 style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                }}>
                    Explorer
                </h3>
                {currentProject && (
                    <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--text-secondary)', 
                        marginTop: '4px',
                        wordBreak: 'break-all'
                    }}>
                        {currentProject.split(/[/\\]/).pop()}
                    </div>
                )}
            </div>
            
            <div className="file-explorer">
                {currentProject ? (
                    <div className="file-tree">
                        {renderFileTree(projectFiles)}
                    </div>
                ) : (
                    <div style={{ 
                        padding: '20px', 
                        textAlign: 'center', 
                        color: 'var(--text-secondary)' 
                    }}>
                        <p>No project opened</p>
                        <p style={{ fontSize: '12px', marginTop: '8px' }}>
                            Use Ctrl+O to open a folder
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
