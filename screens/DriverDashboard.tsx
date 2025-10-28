import React, { useState } from 'react';
import { Trip, Driver } from '../types';
import RideCard from './driver/RideCard';
import Input from '../components/Input';
import Button from '../components/Button';
import Card, { CardContent } from '../components/Card';
import { useAppContext } from '../contexts/AppContext';
import { apiService } from '../utils/apiService';
import { formatDateTime } from '../utils/formatters';

interface DriverDashboardProps {
    driver: Driver;
    initialTrip: Trip | null;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ driver, initialTrip }) => {
    const { updateTrip } = useAppContext();
    const [tripNumberInput, setTripNumberInput] = useState('');
    const [activeTrip, setActiveTrip] = useState<Trip | null>(initialTrip);
    const [completedTripView, setCompletedTripView] = useState<Trip | null>(null);
    const [error, setError] = useState('');

    const handleFindTrip = async () => {
        setError('');
        setCompletedTripView(null);
        setActiveTrip(null);
        try {
            // Fetch authoritative trip from API by number
            const foundTrip = await apiService.getTripByNumber(tripNumberInput.trim()) as Trip;
            if (foundTrip.driverId !== driver.id) {
                setError('Trip not found or not assigned to you. Please check the Trip Number.');
                return;
            }
            const now = new Date();
            const plannedCheckIn = new Date(foundTrip.plannedCheckInTime);
            const earliestLoginTime = new Date(plannedCheckIn.getTime() - 20 * 60 * 1000);

            if (now < earliestLoginTime) {
                setActiveTrip(null);
                const formattedDate = formatDateTime(foundTrip.plannedCheckInTime);
                setError(`This trip is scheduled for ${formattedDate}. Please try again closer to the scheduled time.`);
                return;
            }

            if (foundTrip.status === 'COMPLETED') {
                // Show read-only details for completed trip
                setCompletedTripView(foundTrip);
                setActiveTrip(null);
                setError('');
            } else if (foundTrip.status === 'IN_PROGRESS' && foundTrip.driverId === driver.id) {
                setActiveTrip(foundTrip);
                setError('');
            } else {
                 setActiveTrip(foundTrip);
                 setError('');
            }
        } catch (e) {
            setActiveTrip(null);
            setCompletedTripView(null);
            setError('Trip not found or not assigned to you. Please check the Trip Number.');
        }
    };

    const handleTripCompletion = () => {
        setActiveTrip(null);
        setCompletedTripView(null);
        setTripNumberInput('');
        setError('');
    };
    
    const handleCheckIn = (checkInTime: string, startOdometer: number) => {
        const updatedTrip: Trip = {
            ...activeTrip!,
            status: 'IN_PROGRESS',
            actualCheckInTime: checkInTime,
            actualStartOdometer: startOdometer
        };
        updateTrip(updatedTrip);
        setActiveTrip(updatedTrip);
    };

    const handleCheckOut = (endOdometer: number, remarks: string) => {
        const updatedTrip: Trip = {
            ...activeTrip!,
            status: 'COMPLETED',
            actualCheckOutTime: new Date().toISOString(),
            actualEndOdometer: endOdometer,
            remarks
        };
        updateTrip(updatedTrip);
        handleTripCompletion();
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">Welcome, {driver.name}</h1>
            
            {!activeTrip && !completedTripView ? (
                <Card>
                    <CardContent className="space-y-4">
                        <p className="text-neutral-600">Please enter the Trip Number provided by your company to begin.</p>
                        <div className="flex items-start gap-2">
                            <div className="flex-grow">
                                <Input 
                                    id="trip-number"
                                    label="Trip Number"
                                    value={tripNumberInput}
                                    onChange={e => setTripNumberInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleFindTrip()}
                                    placeholder="e.g., LUP00001"
                                    autoFocus
                                />
                            </div>
                            <Button onClick={handleFindTrip} className="mt-7">Find Trip</Button>
                        </div>
                        {error && <p className="text-brand-red text-sm mt-2">{error}</p>}
                    </CardContent>
                </Card>
            ) : activeTrip ? (
                <div className="space-y-6">
                    <RideCard
                        trip={activeTrip}
                        onCheckIn={handleCheckIn}
                        onCheckOut={handleCheckOut}
                    />
                     <Button variant="secondary" onClick={handleTripCompletion} className="w-full">
                        End Session & Enter New Trip Number
                    </Button>
                </div>
            ) : (
                <Card>
                    <CardContent className="space-y-4">
                        <h2 className="text-lg font-bold text-neutral-800">Trip {completedTripView?.tripNumber}</h2>
                        <p className="text-sm text-brand-green">This trip is already completed. Details shown below are read-only.</p>
                        <div className="p-3 bg-neutral-100 rounded-md text-sm space-y-2">
                            <p><strong>Client:</strong> {completedTripView?.bookingClientName}</p>
                            <p><strong>Reporting Point:</strong> {completedTripView?.reportingPoint}</p>
                            {completedTripView?.actualCheckInTime && <p><strong>Check-in:</strong> {formatDateTime(completedTripView.actualCheckInTime)}</p>}
                            {completedTripView?.actualStartOdometer && <p><strong>Start Odometer:</strong> {completedTripView.actualStartOdometer} km</p>}
                            {completedTripView?.actualCheckOutTime && <p><strong>Check-out:</strong> {formatDateTime(completedTripView.actualCheckOutTime)}</p>}
                            {completedTripView?.actualEndOdometer && <p><strong>End Odometer:</strong> {completedTripView.actualEndOdometer} km</p>}
                            {completedTripView?.remarks && <p><strong>Remarks:</strong> {completedTripView.remarks}</p>}
                        </div>
                        <Button variant="secondary" onClick={handleTripCompletion} className="w-full">Close</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DriverDashboard;