import React from 'react';
import Card, { CardContent, CardHeader } from '../../components/Card';
import MapPlaceholder from '../../components/MapPlaceholder';
import { useAppContext } from '../../contexts/AppContext';

const LiveMap: React.FC = () => {
    const { trips, drivers } = useAppContext();
    const inProgressTrips = trips.filter(t => t.status === 'IN_PROGRESS');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold text-neutral-800">Live Vehicle Tracking</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="h-96 w-full bg-neutral-200 rounded-md">
                           <MapPlaceholder />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                         <h2 className="text-xl font-bold text-neutral-800">Active Trips ({inProgressTrips.length})</h2>
                    </CardHeader>
                    <CardContent>
                        {inProgressTrips.length > 0 ? (
                            <ul className="divide-y divide-neutral-200">
                                {inProgressTrips.map(trip => {
                                    const driver = drivers.find(d => d.id === trip.driverId);
                                    return (
                                        <li key={trip.id} className="py-3">
                                            <p className="font-semibold">{trip.tripNumber}</p>
                                            <p className="text-sm text-neutral-500">Driver: {driver?.name || 'N/A'}</p>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <p className="text-neutral-500 text-sm">No trips are currently in progress.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LiveMap;