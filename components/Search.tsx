import React from 'react';
import { SearchIcon } from './icons/Icons';

interface SearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const Search: React.FC<SearchProps> = ({ value, onChange, placeholder = 'Search...' }) => {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:placeholder-neutral-400 focus:ring-1 focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default Search;
