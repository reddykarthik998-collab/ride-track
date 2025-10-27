import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { DownloadIcon } from './icons/Icons';

interface ExportButtonProps {
    onExportCSV: () => void;
    onExportPDF: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExportCSV, onExportPDF }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className="relative inline-block text-left" ref={wrapperRef}>
            <div>
                <Button type="button" variant="secondary" onClick={() => setIsOpen(!isOpen)} icon={<DownloadIcon />}>
                    Export
                </Button>
            </div>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button
                            onClick={() => { onExportCSV(); setIsOpen(false); }}
                            className="text-neutral-700 block w-full text-left px-4 py-2 text-sm hover:bg-neutral-100"
                            role="menuitem"
                        >
                            Export as CSV
                        </button>
                        <button
                            onClick={() => { onExportPDF(); setIsOpen(false); }}
                            className="text-neutral-700 block w-full text-left px-4 py-2 text-sm hover:bg-neutral-100"
                            role="menuitem"
                        >
                            Export as PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportButton;
