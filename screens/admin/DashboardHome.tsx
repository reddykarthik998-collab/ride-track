import React from 'react';
import { Trip, Event, Driver, Client } from '../../types';
import Card, { CardContent, CardHeader } from '../../components/Card';
import { ClockIcon, CheckCircleIcon, CarIcon } from '../../components/icons/Icons';
import { useAppContext } from '../../contexts/AppContext';
import EmptyState from '../../components/EmptyState';

const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
};


const DashboardHome: React.FC = () => {
    const { trips, drivers, clients } = useAppContext();

    const inProgressCount = trips.filter(t => t.status === 'IN_PROGRESS').length;
    const assignedCount = trips.filter(t => t.status === 'ASSIGNED').length;
    const completedTodayCount = trips.filter(t => {
        if (t.status !== 'COMPLETED' || !t.actualCheckOutTime) return false;
        return isToday(t.actualCheckOutTime);
    }).length;

    const todaysTrips = trips.filter(t => {
        return isToday(t.plannedCheckInTime);
    }).sort((a, b) => {
        const statusOrder = { 'IN_PROGRESS': 1, 'ASSIGNED': 2, 'COMPLETED': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    const getStatusChip = (status: string) => {
        const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case 'ASSIGNED':
                return <span className={`${baseClasses} bg-blue-100 text-brand-blue`}>Assigned</span>;
            case 'IN_PROGRESS':
                return <span className={`${baseClasses} bg-yellow-100 text-brand-yellow`}>In Progress</span>;
            case 'COMPLETED':
                return <span className={`${baseClasses} bg-green-100 text-brand-green`}>Completed</span>;
            default:
                return null;
        }
    };

    const StatCard = ({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) => (
        <Card>
            <CardContent className="flex items-center p-4">
                <div className="p-3 rounded-full bg-brand-blue-light text-brand-blue">
                    {icon}
                </div>
                <div className="ml-4">
                    <p className="text-2xl font-bold text-neutral-800">{value}</p>
                    <p className="text-sm text-neutral-500">{label}</p>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<ClockIcon className="w-6 h-6"/>} value={inProgressCount} label="Trips In Progress" />
                <StatCard icon={<CarIcon className="w-6 h-6"/>} value={assignedCount} label="Assigned Trips" />
                <StatCard icon={<CheckCircleIcon className="w-6 h-6"/>} value={completedTodayCount} label="Completed Today" />
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-xl font-bold text-neutral-800">Today's Trips</h2>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        {todaysTrips.length > 0 ? (
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Trip #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Driver</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {todaysTrips.map(trip => (
                                        <tr key={trip.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{trip.tripNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{clients.find(c => c.id === trip.clientId)?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{drivers.find(d => d.id === trip.driverId)?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{getStatusChip(trip.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <EmptyState message="No trips scheduled for today." />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardHome;