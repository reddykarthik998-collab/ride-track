import React, { useEffect } from 'react';
import { CheckCircleIcon, CloseIcon } from './icons/Icons';
import { useAppContext, ToastMessage } from '../contexts/AppContext';

export const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    const baseClasses = 'flex items-center w-full max-w-xs p-4 my-2 text-gray-500 bg-white rounded-lg shadow-lg';
    const typeClasses = {
        success: 'text-green-500 bg-green-100',
        error: 'text-red-500 bg-red-100',
        info: 'text-blue-500 bg-blue-100',
    };
    const iconClasses = {
        success: 'bg-green-100 text-green-500',
        error: 'bg-red-100 text-red-500',
        info: 'bg-blue-100 text-blue-500',
    };

    return (
        <div className={baseClasses} role="alert">
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconClasses[toast.type]}`}>
                <CheckCircleIcon className="w-5 h-5" />
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
                aria-label="Close"
                onClick={() => onDismiss(toast.id)}
            >
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useAppContext();
    return (
        <div className="fixed top-5 right-5 z-[100]">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
};
