import React, { useState } from 'react';
import { Trip, Driver } from '../types';
import RideCard from './driver/RideCard';
import Input from '../components/Input';
import Button from '../components/Button';
import Card, { CardContent } from '../components/Card';
import { useAppContext } from '../contexts/AppContext';
import { formatDateTime } from '../utils/formatters';

interface DriverDashboardProps {
    driver: Driver;
    initialTrip: Trip | null;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ driver, initialTrip }) => {
    const { trips, updateTrip } = useAppContext();
    const [tripNumberInput, setTripNumberInput] = useState('');
    const [activeTrip, setActiveTrip] = useState<Trip | null>(initialTrip);
    const [error, setError] = useState('');

    const handleFindTrip = () => {
        const foundTrip = trips.find(t => t.tripNumber.toLowerCase() === tripNumberInput.toLowerCase() && t.driverId === driver.id);
        if (foundTrip) {
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
                setActiveTrip(null);
                setError('This trip has already been completed.');
            } else {
                 setActiveTrip(foundTrip);
                 setError('');
            }
        } else {
            setActiveTrip(null);
            setError(`Trip not found or not assigned to you. Please check the Trip Number.`);
        }
    };

    const handleTripCompletion = () => {
        setActiveTrip(null);
        setTripNumberInput('');
        setError('');
    };
    
    const handleCheckIn = (checkInTime: string, startOdometer: number) => {
        const updatedTrip: Trip = {
            ...activeTrip!,
            status: 'IN_PROGRESS',
            actualCheckInTime: checkInTime,
            actualStartOdometer: startOdometer,
            startOdometerPhotoUrl: 'https://via.placeholder.com/400x200.png?text=Start+Odometer'
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
            endOdometerPhotoUrl: 'https://via.placeholder.com/400x200.png?text=End+Odometer',
            remarks
        };
        updateTrip(updatedTrip);
        handleTripCompletion();
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">Welcome, {driver.name}</h1>
            
            {!activeTrip ? (
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
            ) : (
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
            )}
        </div>
    );
};

export default DriverDashboard;