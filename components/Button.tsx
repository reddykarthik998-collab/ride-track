import React from 'react';

// FIX: Updated ButtonProps to add an optional `size` property and make `children` optional.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'sm' | 'md';
    className?: string;
    icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', icon, ...props }) => {
    // FIX: Padding is now handled by `sizeClasses` based on the `size` prop, so it's removed from baseClasses.
    const baseClasses = 'rounded-md font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses = {
        sm: 'p-2',
        md: 'px-4 py-2',
    };

    const variantClasses = {
        primary: 'bg-brand-blue text-white hover:bg-blue-700 focus:ring-brand-blue',
        secondary: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 focus:ring-neutral-500',
        danger: 'bg-brand-red text-white hover:bg-red-700 focus:ring-brand-red',
        success: 'bg-brand-green text-white hover:bg-green-700 focus:ring-brand-green',
    };

    return (
        <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
            {icon && <span className="w-5 h-5">{icon}</span>}
            {children}
        </button>
    );
};

export default Button;