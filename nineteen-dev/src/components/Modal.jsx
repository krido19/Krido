import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText, type = 'primary' }) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'purple':
                return {
                    border: 'border-purple-500/50',
                    shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
                    button: 'bg-purple-600 hover:bg-purple-500 text-white',
                    text: 'text-purple-400'
                };
            case 'pink':
                return {
                    border: 'border-pink-500/50',
                    shadow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]',
                    button: 'bg-pink-600 hover:bg-pink-500 text-white',
                    text: 'text-pink-500'
                };
            default:
                return {
                    border: 'border-cyan-500/50',
                    shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.2)]',
                    button: 'bg-cyan-500 hover:bg-cyan-400 text-black',
                    text: 'text-cyan-400'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className={`relative w-full max-w-md bg-gray-900/90 border ${styles.border} ${styles.shadow} rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h3 className={`text-xl font-bold tracking-wider ${styles.text}`}>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-300 leading-relaxed font-mono text-sm">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-4 p-6 bg-black/30">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-6 py-2 text-sm font-bold transition-all clip-path-polygon ${styles.button}`}
                        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                    >
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
