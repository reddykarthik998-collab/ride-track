import React from 'react';
import { PlusIcon } from './icons/Icons';

interface EmptyStateProps {
    message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
    return (
        <div className="text-center py-10 px-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-neutral-100">
                <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-neutral-900">No items found</h3>
            <p className="mt-1 text-sm text-neutral-500">{message}</p>
        </div>
    );
};

export default EmptyState;
