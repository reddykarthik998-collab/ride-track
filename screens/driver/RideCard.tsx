import React, { useState, useEffect } from 'react';
import { Trip, TripStatus, Event } from '../../types';
import Card, { CardContent, CardFooter, CardHeader } from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { CameraIcon, CheckIcon, MapPinIcon, ChevronRightIcon } from '../../components/icons/Icons';
import { useAppContext } from '../../contexts/AppContext';
import { apiService } from '../../utils/apiService';
import { formatDateTime } from '../../utils/formatters';

interface RideCardProps {
    trip: Trip;
    onCheckIn: (checkInTime: string, startOdometer: number) => void;
    onCheckOut: (endOdometer: number, remarks: string) => void;
}

const RideCard: React.FC<RideCardProps> = ({ trip, onCheckIn, onCheckOut }) => {
    const { clients, events, drivers } = useAppContext();
    const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);
    const [isCheckOutModalOpen, setCheckOutModalOpen] = useState(false);
    
    const [checkInTime, setCheckInTime] = useState(trip.plannedCheckInTime ? new Date(trip.plannedCheckInTime).toISOString().slice(0, 16) : '');
    const [startOdometer, setStartOdometer] = useState(String(trip.plannedStartOdometer || ''));
    
    const [endOdometer, setEndOdometer] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');
    const [startPhoto, setStartPhoto] = useState<File | null>(null);
    const [endPhoto, setEndPhoto] = useState<File | null>(null);

    useEffect(() => {
        setCheckInTime(new Date(trip.plannedCheckInTime).toISOString().slice(0, 16));
        setStartOdometer(String(trip.plannedStartOdometer));
    }, [trip]);

    const handleCheckIn = async () => {
        if (!startOdometer) {
            alert('Please enter the starting odometer reading.');
            return;
        }
        try {
            onCheckIn(new Date(checkInTime).toISOString(), Number(startOdometer));
            if (startPhoto) {
                await apiService.uploadStartPhoto(trip.id, startPhoto);
            }
            setCheckInModalOpen(false);
        } catch (error) {
            alert('Failed to check in. Please try again.');
            console.error('Check-in error:', error);
        }
    };
    
    const handleCheckOut = async () => {
        if (!endOdometer) {
            alert('Please enter the ending odometer reading.');
            return;
        }
        if (Number(endOdometer) <= (trip.actualStartOdometer || 0)) {
            alert('End odometer must be greater than the start odometer.');
            return;
        }
        try {
            onCheckOut(Number(endOdometer), remarks);
            if (endPhoto) {
                await apiService.uploadEndPhoto(trip.id, endPhoto);
            }
            setCheckOutModalOpen(false);
        } catch (error) {
            alert('Failed to check out. Please try again.');
            console.error('Check-out error:', error);
        }
    };

    const getStatusChip = (status: TripStatus) => {
        const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case 'ASSIGNED': return <span className={`${baseClasses} bg-blue-100 text-brand-blue`}>Assigned</span>;
            case 'IN_PROGRESS': return <span className={`${baseClasses} bg-yellow-100 text-brand-yellow`}>In Progress</span>;
            case 'COMPLETED': return <span className={`${baseClasses} bg-green-100 text-brand-green`}>Completed</span>;
            default: return null;
        }
    };
    
    const driver = drivers.find(d => d.id === trip.driverId);
    const client = clients.find(c => c.id === trip.clientId);
    const event = events.find(e => e.id === trip.eventId);

    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-bold text-neutral-800">{trip.tripNumber}</h2>
                        <p className="text-sm text-neutral-500">{client?.name || 'Unknown Client'}</p>
                        {event && <p className="text-sm text-neutral-500">Event: {event.name}</p>}
                    </div>
                    {getStatusChip(trip.status)}
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 bg-neutral-100 rounded-md text-sm space-y-2">
                        <h3 className="font-bold text-neutral-700">Trip Details</h3>
                        <p><strong>Vehicle:</strong> {driver?.vehicleName} ({driver?.vehicleLicensePlate})</p>
                        <p><strong>Client:</strong> {trip.bookingClientName}</p>
                        <p><strong>Customer Name:</strong> {trip.customerName}</p>
                        <p><strong>Customer Number:</strong> {trip.customerNumber}</p>
                        {trip.description && <p><strong>Description:</strong> {trip.description}</p>}
                    </div>
                    
                    {trip.status !== 'ASSIGNED' && (
                        <div className="p-3 bg-blue-50 rounded-md text-sm space-y-2">
                             <h3 className="font-bold text-neutral-700">Trip Log</h3>
                             {trip.actualCheckInTime && <p><strong>Check-in:</strong> {formatDateTime(trip.actualCheckInTime)}</p>}
                             {trip.actualStartOdometer && <p><strong>Start Odometer:</strong> {trip.actualStartOdometer} km</p>}
                             {trip.actualCheckOutTime && <p><strong>Check-out:</strong> {formatDateTime(trip.actualCheckOutTime)}</p>}
                             {trip.actualEndOdometer && <p><strong>End Odometer:</strong> {trip.actualEndOdometer} km</p>}
                             {trip.remarks && <p><strong>Remarks:</strong> {trip.remarks}</p>}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end items-center space-x-2">
                    {trip.destinationUrl && (
                        <a href={trip.destinationUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="secondary" icon={<MapPinIcon className="w-5 h-5"/>}>
                                View Map
                            </Button>
                        </a>
                    )}
                    {trip.status === 'ASSIGNED' && (
                        <Button onClick={() => setCheckInModalOpen(true)} icon={<ChevronRightIcon className="w-5 h-5"/>}>Check In</Button>
                    )}
                    {trip.status === 'IN_PROGRESS' && (
                        <Button onClick={() => setCheckOutModalOpen(true)} variant="success" icon={<CheckIcon className="w-5 h-5"/>}>Check Out</Button>
                    )}
                </CardFooter>
            </Card>

            {/* Check-in Modal */}
            <Modal isOpen={isCheckInModalOpen} onClose={() => setCheckInModalOpen(false)} title="Start Trip">
                <div className="p-6 space-y-4">
                    <Input id="start-time" label="Start Time" type="datetime-local" value={checkInTime} onChange={e => setCheckInTime(e.target.value)} />
                    <Input id="start-odo" label="Start Odometer (km)" type="number" value={startOdometer} onChange={e => setStartOdometer(e.target.value)} />
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Odometer Photo</label>
                        <input type="file" accept="image/*" capture="environment" onChange={e => setStartPhoto(e.target.files?.[0] || null)} className="block w-full text-sm" />
                        {startPhoto && <p className="text-xs text-neutral-500 mt-1">{startPhoto.name}</p>}
                    </div>
                </div>
                <div className="bg-neutral-100 px-6 py-3 text-right">
                    <Button variant="secondary" onClick={() => setCheckInModalOpen(false)} className="mr-2">Cancel</Button>
                    <Button onClick={handleCheckIn}>Confirm Check-in</Button>
                </div>
            </Modal>
            
            {/* Check-out Modal */}
            <Modal isOpen={isCheckOutModalOpen} onClose={() => setCheckOutModalOpen(false)} title="End Trip">
                 <div className="p-6 space-y-4">
                    <Input id="end-odo" label="End Odometer (km)" type="number" value={endOdometer} onChange={e => setEndOdometer(e.target.value)} autoFocus/>
                    <div>
                         <label className="block text-sm font-medium text-neutral-700 mb-1">Odometer Photo</label>
                         <input type="file" accept="image/*" capture="environment" onChange={e => setEndPhoto(e.target.files?.[0] || null)} className="block w-full text-sm" />
                         {endPhoto && <p className="text-xs text-neutral-500 mt-1">{endPhoto.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-neutral-700 mb-1">Remarks (Optional)</label>
                        <textarea 
                            id="remarks" 
                            rows={3} 
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                        />
                    </div>
                </div>
                <div className="bg-neutral-100 px-6 py-3 text-right">
                    <Button variant="secondary" onClick={() => setCheckOutModalOpen(false)} className="mr-2">Cancel</Button>
                    <Button onClick={handleCheckOut} variant="success">Confirm Check-out</Button>
                </div>
            </Modal>
        </>
    );
};

export default RideCard;