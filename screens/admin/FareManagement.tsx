import React, { useState } from 'react';
import { Fare, FareType } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import Card, { CardHeader, CardContent } from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import EmptyState from '../../components/EmptyState';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons/Icons';
import ExportButton from '../../components/ExportButton';
import { exportToCsv } from '../../utils/exporter';

const FareManagement: React.FC = () => {
    const { fares, addFare, updateFare, deleteFare } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [currentFare, setCurrentFare] = useState<Fare | null>(null);
    const [fareToDelete, setFareToDelete] = useState<string | null>(null);

    const openModal = (fare: Fare | null = null) => {
        setCurrentFare(fare);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setCurrentFare(null);
        setIsModalOpen(false);
    };

    const openConfirmModal = (id: string) => {
        setFareToDelete(id);
        setIsConfirmModalOpen(true);
    };
    
    const closeConfirmModal = () => {
        setFareToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const type = formData.get('type') as FareType;
        const baseFare = Number(formData.get('baseFare'));
        const perKmCharge = Number(formData.get('perKmCharge'));
        const perHourCharge = Number(formData.get('perHourCharge'));

        if (currentFare) {
            updateFare({ ...currentFare, name, type, baseFare, perKmCharge, perHourCharge });
        } else {
            addFare({ name, type, baseFare, perKmCharge, perHourCharge });
        }
        closeModal();
    };

    const handleDelete = () => {
        if (fareToDelete) {
            deleteFare(fareToDelete);
        }
        closeConfirmModal();
    };

    const handleExportCSV = () => {
        const dataToExport = fares.map(({ id, ...rest }) => rest);
        exportToCsv('fares', dataToExport);
    };

    const handleExportPDF = () => {
        alert('PDF export is coming soon!');
    };

    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-800">Manage Fares</h2>
                    <div className="flex items-center space-x-2">
                        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
                        <Button onClick={() => openModal()} icon={<PlusIcon />}>Add Fare</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {fares.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Fare Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Base (₹)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Per KM (₹)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Per Hour (₹)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {fares.map(fare => (
                                        <tr key={fare.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">{fare.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{fare.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{fare.baseFare}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{fare.perKmCharge}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{fare.perHourCharge}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Button size="sm" variant="secondary" onClick={() => openModal(fare)} icon={<EditIcon />} aria-label={`Edit ${fare.name}`} />
                                                <Button size="sm" variant="danger" onClick={() => openConfirmModal(fare.id)} icon={<TrashIcon />} aria-label={`Delete ${fare.name}`} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState message="No fares have been added yet." />
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentFare ? 'Edit Fare' : 'Add Fare'}>
                <form onSubmit={handleSave}>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Input id="name" name="name" label="Fare Name" defaultValue={currentFare?.name || ''} required autoFocus />
                        </div>
                        <Select id="type" name="type" label="Fare Type" defaultValue={currentFare?.type || ''} required>
                            <option value="" disabled>Select a type</option>
                            <option value={FareType.LOCAL}>Local</option>
                            <option value={FareType.OUTSTATION}>Outstation</option>
                        </Select>
                        <Input id="baseFare" name="baseFare" label="Base Fare (₹)" type="number" defaultValue={currentFare?.baseFare || ''} required />
                        <Input id="perKmCharge" name="perKmCharge" label="Per KM Charge (₹)" type="number" step="0.1" defaultValue={currentFare?.perKmCharge || ''} required />
                        <Input id="perHourCharge" name="perHourCharge" label="Per Hour Charge (₹)" type="number" step="0.1" defaultValue={currentFare?.perHourCharge || ''} required />
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
                title="Delete Fare"
                message="Are you sure you want to delete this fare? This will also unassign it from any trips."
            />
        </>
    );
};

export default FareManagement;
