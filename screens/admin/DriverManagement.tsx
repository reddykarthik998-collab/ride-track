import React, { useState, useMemo } from 'react';
import { Driver } from '../../types';
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
import Search from '../../components/Search';

const DriverManagement: React.FC = () => {
    const { drivers, addDriver, updateDriver, deleteDriver } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
    const [driverToDelete, setDriverToDelete] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDrivers = useMemo(() => {
        if (!searchQuery) {
            return drivers;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return drivers.filter(driver =>
            driver.name.toLowerCase().includes(lowercasedQuery) ||
            driver.phone.toLowerCase().includes(lowercasedQuery) ||
            driver.vehicleLicensePlate.toLowerCase().includes(lowercasedQuery)
        );
    }, [drivers, searchQuery]);

    const openModal = (driver: Driver | null = null) => {
        setCurrentDriver(driver);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setCurrentDriver(null);
        setIsModalOpen(false);
    };
    
    const openConfirmModal = (id: string) => {
        setDriverToDelete(id);
        setIsConfirmModalOpen(true);
    };
    
    const closeConfirmModal = () => {
        setDriverToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const phone = formData.get('phone') as string;
        const vehicleName = formData.get('vehicleName') as string;
        const vehicleLicensePlate = formData.get('vehicleLicensePlate') as string;

        if (currentDriver) {
            updateDriver({ ...currentDriver, name, phone, vehicleName, vehicleLicensePlate });
        } else {
            addDriver({ name, phone, vehicleName, vehicleLicensePlate });
        }
        closeModal();
    };

    const handleDelete = () => {
        if (driverToDelete) {
            deleteDriver(driverToDelete);
        }
        closeConfirmModal();
    };

    const handleExportCSV = () => {
        const dataToExport = filteredDrivers.map(({ id, ...rest }) => rest);
        exportToCsv('drivers', dataToExport);
    };

    const handleExportPDF = () => {
        alert('PDF export is coming soon!');
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-neutral-800">
                        Manage Drivers
                        <span className="text-base font-normal text-neutral-500 ml-2">
                            ({filteredDrivers.length} of {drivers.length})
                        </span>
                    </h2>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex-grow sm:flex-grow-0 sm:w-64">
                            <Search 
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search name, plate, or phone..."
                            />
                        </div>
                        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
                        <Button onClick={() => openModal()} icon={<PlusIcon />}>Add Driver</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredDrivers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Driver Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Vehicle Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">License Plate</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {filteredDrivers.map(driver => (
                                        <tr key={driver.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">{driver.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{driver.phone}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{driver.vehicleName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 font-mono">{driver.vehicleLicensePlate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Button size="sm" variant="secondary" onClick={() => openModal(driver)} icon={<EditIcon />} aria-label={`Edit ${driver.name}`} />
                                                <Button size="sm" variant="danger" onClick={() => openConfirmModal(driver.id)} icon={<TrashIcon />} aria-label={`Delete ${driver.name}`} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState message={searchQuery ? `No drivers found for "${searchQuery}".` : "No drivers have been added yet."} />
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentDriver ? 'Edit Driver' : 'Add Driver'}>
                <form onSubmit={handleSave}>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            id="name"
                            name="name"
                            label="Driver Name"
                            defaultValue={currentDriver?.name || ''}
                            required
                            autoFocus
                        />
                         <Input
                            id="phone"
                            name="phone"
                            label="Phone Number"
                            type="tel"
                            defaultValue={currentDriver?.phone || ''}
                            required
                            pattern="[0-9]{10}"
                            title="Please enter a 10-digit phone number"
                        />
                        <Input
                            id="vehicleName"
                            name="vehicleName"
                            label="Vehicle Name"
                            defaultValue={currentDriver?.vehicleName || ''}
                            required
                        />
                        <Input
                            id="vehicleLicensePlate"
                            name="vehicleLicensePlate"
                            label="License Plate"
                            defaultValue={currentDriver?.vehicleLicensePlate || ''}
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
                title="Delete Driver"
                message="Are you sure you want to delete this driver? This action cannot be undone."
            />
        </>
    );
};

export default DriverManagement;