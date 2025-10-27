import React, { useState } from 'react';
import { Event } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import Card, { CardHeader, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import EmptyState from '../../components/EmptyState';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons/Icons';
import { generateEventId } from '../../utils/idGenerator';
import { formatDate } from '../../utils/formatters';
import ExportButton from '../../components/ExportButton';
import { exportToCsv } from '../../utils/exporter';

const EventManagement: React.FC = () => {
    const { events, clients, addEvent, updateEvent, deleteEvent } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [eventToDelete, setEventToDelete] = useState<string | null>(null);

    const openModal = (event: Event | null = null) => {
        setCurrentEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setCurrentEvent(null);
        setIsModalOpen(false);
    };

    const openConfirmModal = (id: string) => {
        setEventToDelete(id);
        setIsConfirmModalOpen(true);
    };
    
    const closeConfirmModal = () => {
        setEventToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const clientId = formData.get('clientId') as string;
        const prefix = formData.get('prefix') as string;
        const startDate = formData.get('startDate') as string;
        const endDate = formData.get('endDate') as string;

        if (currentEvent) {
            updateEvent({ ...currentEvent, name, clientId, prefix, startDate, endDate });
        } else {
            const eventId = generateEventId(clientId, prefix.toUpperCase(), clients, events);
            addEvent({ eventId, name, clientId, prefix: prefix.toUpperCase(), startDate, endDate });
        }
        closeModal();
    };

    const handleDelete = () => {
        if (eventToDelete) {
            deleteEvent(eventToDelete);
        }
        closeConfirmModal();
    };

    const handleExportCSV = () => {
        const dataToExport = events.map(event => ({
            eventId: event.eventId,
            eventName: event.name,
            client: clients.find(c => c.id === event.clientId)?.name || 'N/A',
            prefix: event.prefix,
            startDate: event.startDate,
            endDate: event.endDate,
        }));
        exportToCsv('events', dataToExport);
    };
    
    const handleExportPDF = () => {
        alert('PDF export is coming soon!');
    };

    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-800">Manage Events</h2>
                    <div className="flex items-center space-x-2">
                        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
                        <Button onClick={() => openModal()} icon={<PlusIcon />}>Add Event</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {events.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Event ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Event Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Start Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">End Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {events.map(event => (
                                        <tr key={event.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 font-mono">{event.eventId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">{event.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{clients.find(c => c.id === event.clientId)?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(event.startDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(event.endDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Button size="sm" variant="secondary" onClick={() => openModal(event)} icon={<EditIcon />} aria-label={`Edit ${event.name}`} />
                                                <Button size="sm" variant="danger" onClick={() => openConfirmModal(event.id)} icon={<TrashIcon />} aria-label={`Delete ${event.name}`} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState message="No events have been created yet." />
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentEvent ? 'Edit Event' : 'Add Event'}>
                <form onSubmit={handleSave}>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Input id="name" name="name" label="Event Name" defaultValue={currentEvent?.name || ''} required autoFocus />
                        </div>
                        <div className="sm:col-span-2">
                            <Select id="clientId" name="clientId" label="Client" defaultValue={currentEvent?.clientId || ''} required>
                                <option value="" disabled>Select a client</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                        </div>
                        <Input id="prefix" name="prefix" label="Event Prefix (3-4 Chars)" defaultValue={currentEvent?.prefix || ''} required maxLength={4} />
                        <div /> 
                        <Input id="startDate" name="startDate" label="Start Date" type="date" defaultValue={currentEvent?.startDate || ''} required />
                        <Input id="endDate" name="endDate" label="End Date" type="date" defaultValue={currentEvent?.endDate || ''} required />
                    </div>
                    <div className="bg-neutral-100 px-6 py-3 flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationModal 
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                onConfirm={handleDelete}
                title="Delete Event"
                message="Are you sure you want to delete this event? This will also delete all associated trips. This action cannot be undone."
            />
        </>
    );
};

export default EventManagement;
