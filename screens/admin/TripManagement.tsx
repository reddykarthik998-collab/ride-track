import React, { useState, useMemo } from 'react';
import { Trip } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import Card, { CardHeader, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { PlusIcon, EditIcon, TrashIcon, ShareIcon, CloseIcon } from '../../components/icons/Icons';
import ConfirmationModal from '../../components/ConfirmationModal';
import ShareTripModal from '../../components/ShareTripModal';
import { formatDateTime } from '../../utils/formatters';
import Modal from '../../components/Modal';
import { apiService } from '../../utils/apiService';
import TripFormModal from '../../components/TripFormModal';
import ExportButton from '../../components/ExportButton';
import { exportToCsv } from '../../utils/exporter';

const TripManagement: React.FC = () => {
    const { trips, clients, drivers, fares, events, deleteTrip } = useAppContext();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
    const [tripToDelete, setTripToDelete] = useState<string | null>(null);
    const [tripToShare, setTripToShare] = useState<Trip | null>(null);
    const [photoTrip, setPhotoTrip] = useState<Trip | null>(null);
    
    const tripsWithData = useMemo(() => {
        return trips.map(trip => ({
            ...trip,
            clientName: clients.find(c => c.id === trip.clientId)?.name || 'N/A',
            driverName: drivers.find(d => d.id === trip.driverId)?.name || 'N/A'
        })).sort((a,b) => new Date(b.plannedCheckInTime).getTime() - new Date(a.plannedCheckInTime).getTime());
    }, [trips, clients, drivers]);

    const openFormModal = (trip: Trip | null = null) => {
        setTripToEdit(trip);
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setTripToEdit(null);
        setIsFormModalOpen(false);
    };

    const openConfirmModal = (id: string) => {
        setTripToDelete(id);
    };

    const handleDelete = () => {
        if (tripToDelete) {
            deleteTrip(tripToDelete);
            setTripToDelete(null);
        }
    };

    const handleExportCSV = () => {
        const dataToExport = tripsWithData.map(trip => {
            const driver = drivers.find(d => d.id === trip.driverId);
            const event = events.find(e => e.id === trip.eventId);
            const fare = fares.find(f => f.id === trip.fareId);
            return {
                'Trip Number': trip.tripNumber,
                'Bill Number': (trip as any).billNumber || 'N/A',
                'Status': trip.status,
                'Client': trip.clientName,
                'Event': event?.name || 'N/A',
                'Booking Client/Dept': trip.bookingClientName,
                'Description': trip.description || 'N/A',
                'Reporting Point': trip.reportingPoint,
                'Reporting To': trip.reportingTo,
                'Reporting To Phone': trip.reportingToPhone,
                'Driver': trip.driverName,
                'Driver Phone': driver?.phone || 'N/A',
                'Vehicle': driver?.vehicleName || 'N/A',
                'License Plate': driver?.vehicleLicensePlate || 'N/A',
                'Fare': fare?.name || 'N/A',
                'Destination URL': trip.destinationUrl || 'N/A',
                'Planned Check-in': formatDateTime(trip.plannedCheckInTime),
                'Planned Odometer': trip.plannedStartOdometer,
                'Actual Check-in': trip.actualCheckInTime ? formatDateTime(trip.actualCheckInTime) : 'N/A',
                'Actual Start Odometer': trip.actualStartOdometer ?? 'N/A',
                'Start Photo URL': trip.startOdometerPhotoUrl || 'N/A',
                'Actual Check-out': trip.actualCheckOutTime ? formatDateTime(trip.actualCheckOutTime) : 'N/A',
                'Actual End Odometer': trip.actualEndOdometer ?? 'N/A',
                'End Photo URL': trip.endOdometerPhotoUrl || 'N/A',
                'Remarks': trip.remarks || 'N/A',
            };
        });
        exportToCsv('trips', dataToExport);
    };
    const handleExportPDF = () => {
        alert('PDF export is coming soon!');
    };

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

    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-800">Manage Trips</h2>
                    <div className="flex items-center space-x-2">
                        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
                        <Button icon={<PlusIcon />} onClick={() => openFormModal()}>Add Trip</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {tripsWithData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Trip #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Bill #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Driver</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Check-in Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {tripsWithData.map(trip => (
                                        <tr key={trip.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{trip.tripNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{(trip as any).billNumber || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{trip.clientName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{trip.driverName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDateTime(trip.plannedCheckInTime)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusChip(trip.status)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Button size="sm" variant="secondary" onClick={() => setTripToShare(trip)} icon={<ShareIcon />} aria-label={`Share trip ${trip.tripNumber}`} />
                                                <Button size="sm" variant="secondary" onClick={() => setPhotoTrip(trip)} aria-label={`View photos ${trip.tripNumber}`}>
                                                    👁
                                                </Button>
                                                <Button size="sm" variant="secondary" icon={<EditIcon />} onClick={() => openFormModal(trip)} aria-label={`Edit trip ${trip.tripNumber}`} />
                                                <Button size="sm" variant="danger" onClick={() => openConfirmModal(trip.id)} icon={<TrashIcon />} aria-label={`Delete trip ${trip.tripNumber}`} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState message="No trips have been created yet." />
                    )}
                </CardContent>
            </Card>

            <TripFormModal
                isOpen={isFormModalOpen}
                onClose={closeFormModal}
                tripToEdit={tripToEdit}
            />

            <ShareTripModal 
                isOpen={!!tripToShare}
                onClose={() => setTripToShare(null)}
                trip={tripToShare}
            />

            {/* Photos Modal */}
            <Modal isOpen={!!photoTrip} onClose={() => setPhotoTrip(null)} title={`Photos for Trip ${photoTrip?.tripNumber || ''}`}>
                {photoTrip?.status !== 'COMPLETED' ? (
                    <div className="p-6 text-sm text-neutral-600">Photos will be available after the trip is marked as Completed.</div>
                ) : (
                    <div className="p-6 space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold mb-1">Start Odometer Photo</h4>
                            {photoTrip && <img alt="Start Odometer" className="w-full rounded" src={apiService.getStartPhotoUrl(photoTrip.id)} />}
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-1">End Odometer Photo</h4>
                            {photoTrip && <img alt="End Odometer" className="w-full rounded" src={apiService.getEndPhotoUrl(photoTrip.id)} />}
                        </div>
                    </div>
                )}
            </Modal>
            
            <ConfirmationModal 
                isOpen={!!tripToDelete}
                onClose={() => setTripToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Trip"
                message="Are you sure you want to delete this trip? This action cannot be undone."
            />
        </>
    );
};

export default TripManagement;