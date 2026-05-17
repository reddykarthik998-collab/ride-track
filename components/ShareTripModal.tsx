import React, { useState } from 'react';
import { Trip } from '../types';
import Modal from './Modal';
import Button from './Button';
import { ShareIcon, ClipboardIcon, CheckIcon, MessageIcon } from './icons/Icons';
import { useAppContext } from '../contexts/AppContext';

interface ShareTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    trip: Trip | null;
}

const ShareTripModal: React.FC<ShareTripModalProps> = ({ isOpen, onClose, trip }) => {
    const [isCopied, setIsCopied] = useState(false);
    const { drivers } = useAppContext();
    
    if (!isOpen || !trip) return null;

    const driver = drivers.find(d => d.id === trip.driverId);
    const shareText = `New Trip Assignment: Your Trip Number is ${trip.tripNumber}. Please log in to the Sree Hari Travels app to start.`;
    const smsLink = driver ? `sms:${driver.phone}?body=${encodeURIComponent(shareText)}` : '';
    const canShare = !!navigator.share;

    const handleShare = async () => {
        try {
            await navigator.share({
                title: 'New Trip Assignment',
                text: shareText,
            });
        } catch (error) {
            console.error('Error sharing:', error);
            // Fallback could be added here if needed, but we have copy as a manual fallback
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(trip.tripNumber).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share Trip with Driver">
            <div className="p-6 space-y-4">
                <p className="text-neutral-600">Share the following trip number with the driver:</p>
                {driver && (
                    <div className="p-3 bg-neutral-100 rounded-md">
                        <p className="font-semibold text-neutral-800">{driver.name}</p>
                        <p className="text-sm text-neutral-500">{driver.phone}</p>
                    </div>
                )}
                <div className="bg-neutral-100 p-4 rounded-lg text-center flex items-center justify-between">
                    <p className="text-2xl font-bold text-neutral-800 tracking-widest">{trip.tripNumber}</p>
                     <Button 
                        variant="secondary"
                        size="sm"
                        onClick={handleCopy} 
                        icon={isCopied ? <CheckIcon/> : <ClipboardIcon />}>
                        {isCopied ? 'Copied' : 'Copy'}
                    </Button>
                </div>
                <div className="bg-blue-50 border-l-4 border-brand-blue p-4">
                     <p className="text-sm text-neutral-700">Message to send: "{shareText}"</p>
                </div>
            </div>
            <div className="bg-neutral-100 px-6 py-3 flex justify-end items-center space-x-2">
                <Button variant="secondary" onClick={onClose}>
                    Done
                </Button>
                 {canShare && (
                    <Button variant="secondary" onClick={handleShare} icon={<ShareIcon />}>
                        Share...
                    </Button>
                )}
                {driver?.phone && (
                    <a href={smsLink}>
                        <Button icon={<MessageIcon/>}>Send SMS</Button>
                    </a>
                )}
            </div>
        </Modal>
    );
};

export default ShareTripModal;