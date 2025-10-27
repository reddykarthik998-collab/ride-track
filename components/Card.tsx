
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`p-4 border-b border-neutral-200 ${className}`}>
            {children}
        </div>
    );
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`p-4 ${className}`}>
            {children}
        </div>
    );
};

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`p-4 bg-neutral-100 border-t border-neutral-200 ${className}`}>
            {children}
        </div>
    );
};


export default Card;
