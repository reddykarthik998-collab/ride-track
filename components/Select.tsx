import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    id: string;
    children: React.ReactNode;
    error?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, children, error, ...props }) => {
    const errorClasses = 'border-brand-red focus:ring-brand-red focus:border-brand-red';
    const defaultClasses = 'border-neutral-300 focus:ring-brand-blue focus:border-brand-blue';
    
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
                {label}
            </label>
            <select
                id={id}
                className={`block w-full pl-3 pr-10 py-2 text-base sm:text-sm rounded-md bg-neutral-50 ${error ? errorClasses : defaultClasses}`}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                {...props}
            >
                {children}
            </select>
            {error && <p id={`${id}-error`} className="mt-1 text-sm text-brand-red">{error}</p>}
        </div>
    );
};

export default Select;