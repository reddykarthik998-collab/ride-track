import React from 'react';
import { LogoutIcon } from './icons/Icons';

interface HeaderProps {
    title: string;
    icon: React.ReactNode;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, icon, onLogout }) => {
    return (
        <header className="bg-brand-blue shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            {icon}
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">{title}</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onLogout}
                            aria-label="Logout and return to role selection"
                            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors duration-200"
                        >
                            <LogoutIcon className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};