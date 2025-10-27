import React, { useState } from 'react';
import { Customer } from '../../types';
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

const CustomerManagement: React.FC = () => {
    const { customers, clients, addCustomer, updateCustomer, deleteCustomer } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

    const openModal = (customer: Customer | null = null) => {
        setCurrentCustomer(customer);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setCurrentCustomer(null);
        setIsModalOpen(false);
    };
    
    const openConfirmModal = (id: string) => {
        setCustomerToDelete(id);
        setIsConfirmModalOpen(true);
    };
    
    const closeConfirmModal = () => {
        setCustomerToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const phone = formData.get('phone') as string;
        const email = formData.get('email') as string;
        const clientId = formData.get('clientId') as string;

        if (currentCustomer) {
            updateCustomer({ ...currentCustomer, name, phone, email, clientId });
        } else {
            addCustomer({ name, phone, email, clientId });
        }
        closeModal();
    };

    const handleDelete = () => {
        if (customerToDelete) {
            deleteCustomer(customerToDelete);
        }
        closeConfirmModal();
    };

    const handleExportCSV = () => {
        const dataToExport = customers.map(customer => ({
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            client: clients.find(c => c.id === customer.clientId)?.name || 'N/A',
        }));
        exportToCsv('customers', dataToExport);
    };

    const handleExportPDF = () => {
        alert('PDF export is coming soon!');
    };

    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-800">Manage Customers</h2>
                    <div className="flex items-center space-x-2">
                        <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
                        <Button onClick={() => openModal()} icon={<PlusIcon />}>Add Customer</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {customers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client Company</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                    {customers.map(customer => (
                                        <tr key={customer.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">{customer.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{customer.phone}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{customer.email || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{clients.find(c => c.id === customer.clientId)?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Button size="sm" variant="secondary" onClick={() => openModal(customer)} icon={<EditIcon />} aria-label={`Edit ${customer.name}`} />
                                                <Button size="sm" variant="danger" onClick={() => openConfirmModal(customer.id)} icon={<TrashIcon />} aria-label={`Delete ${customer.name}`} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState message="No customers have been added yet." />
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentCustomer ? 'Edit Customer' : 'Add Customer'}>
                <form onSubmit={handleSave}>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            id="name"
                            name="name"
                            label="Customer Name"
                            defaultValue={currentCustomer?.name || ''}
                            required
                            autoFocus
                        />
                         <Input
                            id="phone"
                            name="phone"
                            label="Phone Number"
                            type="tel"
                            defaultValue={currentCustomer?.phone || ''}
                            required
                            pattern="[0-9]{10}"
                            title="Please enter a 10-digit phone number"
                        />
                        <div className="sm:col-span-2">
                            <Input
                                id="email"
                                name="email"
                                label="Email (Optional)"
                                type="email"
                                defaultValue={currentCustomer?.email || ''}
                            />
                        </div>
                        <div className="sm:col-span-2">
                             <Select id="clientId" name="clientId" label="Client Company" defaultValue={currentCustomer?.clientId || ''} required>
                                <option value="" disabled>Select a client company</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                        </div>
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
                title="Delete Customer"
                message="Are you sure you want to delete this customer? This may affect historical trip data."
            />
        </>
    );
};

export default CustomerManagement;