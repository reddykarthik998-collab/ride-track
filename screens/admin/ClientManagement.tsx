import React, { useState } from 'react';
import { Client } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import Card, { CardHeader, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import EmptyState from '../../components/EmptyState';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons/Icons';
import ExportButton from '../../components/ExportButton';
import { exportToCsv } from '../../utils/exporter';
import { GENERAL_CLIENT_ID } from '../../constants';

const ClientManagement: React.FC = () => {
    const { clients, addClient, updateClient, deleteClient } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState<Client | null>(null);
    const [clientToDelete, setClientToDelete] = useState<string | null>(null);

    const openModal = (client: Client | null = null) => {
        setCurrentClient(client);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setCurrentClient(null);
        setIsModalOpen(false);
    };

    const openConfirmModal = (id: string) => {
        setClientToDelete(id);
        setIsConfirmModalOpen(true);
    };
    
    const closeConfirmModal = () => {
        setClientToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const prefix = formData.get('prefix') as string;

        if (currentClient) {
            updateClient({ ...currentClient, name, prefix });
        } else {
            addClient({ name, prefix });
        }
        closeModal();
    };

    const handleDelete = () => {
        if (clientToDelete) {
            deleteClient(clientToDelete);
        }
        closeConfirmModal();
    };

    const handleExportCSV = () => {
        const dataToExport = clients.map(({ id, ...rest }) => rest);
        exportToCsv('clients', dataToExport);
    };

    const handleExportPDF = () => {
        alert('PDF export is coming soon!');
    };

    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-800">Manage Clients</h2>
                    <div className="flex items-center space-x-2">
                        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
                        <Button onClick={() => openModal()} icon={<PlusIcon />}>Add Client</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {clients.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">ID Prefix</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {clients.map(client => {
                                        const isGeneralClient = client.id === GENERAL_CLIENT_ID;
                                        return (
                                            <tr key={client.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">{client.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 font-mono">{client.prefix}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <Button size="sm" variant="secondary" onClick={() => openModal(client)} icon={<EditIcon />} aria-label={`Edit ${client.name}`} disabled={isGeneralClient} />
                                                    <Button size="sm" variant="danger" onClick={() => openConfirmModal(client.id)} icon={<TrashIcon />} aria-label={`Delete ${client.name}`} disabled={isGeneralClient} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState message="No clients have been added yet." />
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentClient ? 'Edit Client' : 'Add Client'}>
                <form onSubmit={handleSave}>
                    <div className="p-6 space-y-4">
                        <Input
                            id="name"
                            name="name"
                            label="Client Name"
                            defaultValue={currentClient?.name || ''}
                            required
                            autoFocus
                        />
                        <Input
                            id="prefix"
                            name="prefix"
                            label="ID Prefix (e.g., LUP)"
                            defaultValue={currentClient?.prefix || ''}
                            maxLength={4}
                            required
                        />
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
                title="Delete Client"
                message="Are you sure you want to delete this client? This will also delete all associated events and trips. This action is irreversible."
            />
        </>
    );
};

export default ClientManagement;