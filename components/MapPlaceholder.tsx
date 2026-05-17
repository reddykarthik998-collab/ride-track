import React from 'react';
import { MapPinIcon } from './icons/Icons';

const MapPlaceholder: React.FC = () => {
    return (
        <div className="w-full h-full bg-neutral-300 flex flex-col justify-center items-center text-neutral-500 rounded-md">
            <div className="relative">
                <MapPinIcon className="w-16 h-16 text-brand-blue" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-blue opacity-30 animate-ping"></div>
            </div>
            <p className="mt-4 font-semibold">Live Map Feature Coming Soon</p>
            <p className="text-sm">This is a visual placeholder.</p>
        </div>
    );
};

export default MapPlaceholder;
