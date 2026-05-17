import React, { useMemo, useState } from 'react';
import { Trip, Event, Driver, Client, Fare } from '../../types';
import Card, { CardHeader, CardContent } from '../../components/Card';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { useAppContext } from '../../contexts/AppContext';
import EmptyState from '../../components/EmptyState';
import { formatCurrency, formatDuration, formatDateTime } from '../../utils/formatters';
import ExportButton from '../../components/ExportButton';
import { exportToCsv } from '../../utils/exporter';
import Input from '../../components/Input';

const Reports: React.FC = () => {
    const { trips, events, drivers, clients, fares } = useAppContext();
    const [selectedDriver, setSelectedDriver] = useState<string>('');
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const completedTripsData = useMemo(() => {
        return trips
            .filter(trip => trip.status === 'COMPLETED' && trip.actualCheckOutTime && trip.actualEndOdometer && trip.actualStartOdometer)
            .map(trip => {
                const event = events.find(e => e.id === trip.eventId);
                const driver = drivers.find(d => d.id === trip.driverId);
                const client = clients.find(c => c.id === trip.clientId);
                const fare = fares.find(f => f.id === trip.fareId);

                const durationMs = new Date(trip.actualCheckOutTime!).getTime() - new Date(trip.actualCheckInTime!).getTime();
                const distanceKm = trip.actualEndOdometer! - trip.actualStartOdometer!;

                let cost = 0;
                if (fare) {
                    const durationHours = durationMs / (1000 * 60 * 60);
                    cost = fare.baseFare + (distanceKm * fare.perKmCharge) + (durationHours * fare.perHourCharge);
                }
                
                return {
                    ...trip, event, driver, client, fare,
                    durationMs, distanceKm, cost
                };
            }).filter(Boolean)
              .filter(data => {
                if (selectedDriver && data!.driver?.id !== selectedDriver) return false;
                if (selectedClient && data!.client?.id !== selectedClient) return false;
                
                if (startDate || endDate) {
                    const tripDate = new Date(data!.actualCheckOutTime!);
                    if (startDate) {
                        const start = new Date(startDate);
                        // A trip on the start date should be included, so we check if tripDate is after the very beginning of the start date.
                        if (tripDate < start) return false;
                    }
                    if (endDate) {
                        const end = new Date(endDate);
                        // A trip on the end date should be included, so we set the time to the end of the day for comparison.
                        end.setHours(23, 59, 59, 999);
                        if (tripDate > end) return false;
                    }
                }
                
                return true;
            });
    }, [trips, events, drivers, clients, fares, selectedDriver, selectedClient, startDate, endDate]);

    const summary = useMemo(() => {
        return completedTripsData.reduce((acc, trip) => {
            acc.totalTrips += 1;
            acc.totalDistance += trip!.distanceKm;
            acc.totalCost += trip!.cost;
            return acc;
        }, { totalTrips: 0, totalDistance: 0, totalCost: 0 });
    }, [completedTripsData]);

    const handleExportCSV = () => {
        const dataToExport = completedTripsData.map(data => ({
            'Trip #': data.tripNumber,
            'Client': data.client?.name,
            'Driver': data.driver?.name,
            'Vehicle': data.driver?.vehicleName,
            'Distance (KM)': data.distanceKm.toFixed(1),
            'Duration': formatDuration(data.durationMs),
            'Cost (INR)': data.cost.toFixed(2),
            'Check-in Time': formatDateTime(data.actualCheckInTime!),
            'Check-out Time': formatDateTime(data.actualCheckOutTime!),
        }));
        exportToCsv('trip_report', dataToExport);
    };

    const handleExportPDF = () => {
        alert('PDF export is coming soon!');
    };

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-neutral-800">Trip Summary Reports</h2>
                <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-neutral-100 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <Input id="start-date" label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <Input id="end-date" label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        <Select id="driver-filter" label="Filter by Driver" value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} >
                            <option value="">All Drivers</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </Select>
                        <Select id="client-filter" label="Filter by Client" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
                            <option value="">All Clients</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                        <Button variant="secondary" onClick={() => { setSelectedDriver(''); setSelectedClient(''); setStartDate(''); setEndDate(''); }}>
                            Reset Filters
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-white rounded-lg border">
                        <p className="text-2xl font-bold text-neutral-800">{summary.totalTrips}</p>
                        <p className="text-sm text-neutral-500">Total Trips</p>
                    </div>
                     <div className="p-4 bg-white rounded-lg border">
                        <p className="text-2xl font-bold text-neutral-800">{summary.totalDistance.toFixed(0)} km</p>
                        <p className="text-sm text-neutral-500">Total Distance</p>
                    </div>
                     <div className="p-4 bg-white rounded-lg border">
                        <p className="text-2xl font-bold text-neutral-800">{formatCurrency(summary.totalCost)}</p>
                        <p className="text-sm text-neutral-500">Total Cost</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Trip #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Driver</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Distance (KM)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Cost</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Photos</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                            {completedTripsData.length > 0 ? completedTripsData.map(data => (
                                <tr key={data!.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{data!.tripNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{data!.client?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{data!.driver?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{data!.driver?.vehicleName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{data!.distanceKm.toFixed(0)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDuration(data!.durationMs)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatCurrency(data!.cost)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                        <div className="flex items-center space-x-2">
                                            {data!.startOdometerPhotoUrl && (
                                                <a href={data!.startOdometerPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Start</a>
                                            )}
                                            {data!.endOdometerPhotoUrl && (
                                                <a href={data!.endOdometerPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">End</a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8}>
                                        <EmptyState message="No completed trips match the current filters." />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default Reports;