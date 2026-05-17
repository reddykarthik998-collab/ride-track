import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, ...props }) => {
    const errorClasses = 'border-brand-red focus:ring-brand-red focus:border-brand-red';
    const defaultClasses = 'border-neutral-300 focus:ring-brand-blue focus:border-brand-blue';

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
                {label}
            </label>
            <input
                id={id}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-neutral-400 focus:outline-none sm:text-sm bg-neutral-50 ${error ? errorClasses : defaultClasses}`}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                {...props}
            />
            {error && <p id={`${id}-error`} className="mt-1 text-sm text-brand-red">{error}</p>}
        </div>
    );
};

export default Input;