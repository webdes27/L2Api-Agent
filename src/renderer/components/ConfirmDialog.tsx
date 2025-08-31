import React from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    buttons: {
        text: string;
        onClick: () => void;
        type?: 'primary' | 'secondary' | 'danger';
    }[];
    onClose: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    buttons,
    onClose
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="dialog-overlay" onClick={handleBackdropClick}>
            <div className="dialog-content">
                <div className="dialog-header">
                    <h3 className="dialog-title">{title}</h3>
                    <button 
                        className="dialog-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                <div className="dialog-body">
                    <p className="dialog-message">{message}</p>
                </div>
                <div className="dialog-footer">
                    {buttons.map((button, index) => (
                        <button
                            key={index}
                            className={`dialog-button ${button.type || 'secondary'}`}
                            onClick={button.onClick}
                        >
                            {button.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
