import React, { useState, useEffect, useMemo } from 'react';
import { Trip } from '../types';
import { useAppContext } from '../contexts/AppContext';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import { generateTripNumber } from '../utils/idGenerator';
import { formatDateForInput } from '../utils/formatters';

interface TripFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripToEdit: Trip | null;
}

interface TripFormState {
    clientId: string;
    eventId?: string;
    bookingClientName: string;
    dutySlipNumber: string;
    
    driverPhone: string;
    driverName: string;
    vehicleName: string;
    vehicleLicensePlate: string;
    
    fareId: string;
    description?: string;
    customerName: string;
    customerNumber: string;
    checkInDate: string;
    checkInTime: string;
    checkOutDate: string;
    checkOutTime: string;
    startOdometer: number | string;
    endOdometer: number | string;
    destinationUrl?: string;
}


const TripFormModal: React.FC<TripFormModalProps> = ({ isOpen, onClose, tripToEdit }) => {
    const { 
        clients, events, drivers, fares, trips, customers,
        addTrip, updateTrip, addDriver, addCustomer
    } = useAppContext();

    const initialFormState: TripFormState = {
        eventId: '',
        clientId: '',
        bookingClientName: '',
        dutySlipNumber: '',
        driverPhone: '',
        driverName: '',
        vehicleName: '',
        vehicleLicensePlate: '',
        fareId: '',
        customerName: '',
        customerNumber: '',
        checkInDate: '',
        checkInTime: '',
        checkOutDate: '',
        checkOutTime: '',
        startOdometer: '',
        endOdometer: '',
        description: '',
        destinationUrl: '',
    };

    const [formData, setFormData] = useState<TripFormState>(initialFormState);
    const [isExistingDriver, setIsExistingDriver] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof TripFormState, string>>>({});
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            setErrors({}); 
            if (tripToEdit) {
                const driver = drivers.find(d => d.id === tripToEdit.driverId);
                const checkInDateTime = tripToEdit.plannedCheckInTime ? new Date(tripToEdit.plannedCheckInTime) : null;
                const checkOutDateTime = tripToEdit.plannedCheckOutTime ? new Date(tripToEdit.plannedCheckOutTime) : null;
                
                setFormData({
                    ...initialFormState,
                    ...tripToEdit,
                    driverPhone: driver?.phone || '',
                    driverName: driver?.name || '',
                    vehicleName: driver?.vehicleName || '',
                    vehicleLicensePlate: driver?.vehicleLicensePlate || '',
                    checkInDate: checkInDateTime ? checkInDateTime.toISOString().split('T')[0] : '',
                    checkInTime: checkInDateTime ? checkInDateTime.toTimeString().slice(0, 5) : '',
                    checkOutDate: checkOutDateTime ? checkOutDateTime.toISOString().split('T')[0] : '',
                    checkOutTime: checkOutDateTime ? checkOutDateTime.toTimeString().slice(0, 5) : '',
                    startOdometer: tripToEdit.plannedStartOdometer || '',
                    endOdometer: tripToEdit.plannedEndOdometer || '',
                });
                setIsExistingDriver(!!driver);
            } else {
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                setFormData({
                    ...initialFormState,
                    checkInDate: now.toISOString().split('T')[0],
                    checkInTime: now.toTimeString().slice(0, 5),
                    checkOutDate: tomorrow.toISOString().split('T')[0],
                    checkOutTime: now.toTimeString().slice(0, 5),
                });
                setIsExistingDriver(false);
            }
        }
    }, [tripToEdit, isOpen, drivers]);

    const filteredEvents = useMemo(() => {
        if (!formData.clientId) return [];
        return events.filter(e => e.clientId === formData.clientId);
    }, [events, formData.clientId]);

    const filteredCustomers = useMemo(() => {
        if (!formData.clientId) return [];
        return customers.filter(c => c.clientId === formData.clientId);
    }, [customers, formData.clientId]);
    
    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        setFormData(prev => ({ ...prev, clientId, eventId: '', customerName: '', customerNumber: '' }));
        if (errors.clientId || errors.eventId) {
            setErrors(prev => ({...prev, clientId: undefined, eventId: undefined}));
        }
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const customerId = e.target.value;
        const selectedCustomer = customers.find(c => c.id === customerId);

        if (selectedCustomer) {
            setFormData(prev => ({
                ...prev,
                customerName: selectedCustomer.name,
                customerNumber: selectedCustomer.phone
            }));
            setErrors(prev => ({...prev, customerName: undefined, customerNumber: undefined }));
        }
    };

    const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const phone = e.target.value;
        const existingDriver = drivers.find(d => d.phone === phone);
        if (existingDriver) {
            setFormData(prev => ({
                ...prev,
                driverName: existingDriver.name,
                vehicleName: existingDriver.vehicleName,
                vehicleLicensePlate: existingDriver.vehicleLicensePlate,
            }));
            setIsExistingDriver(true);
        } else {
            setFormData(prev => ({
                ...prev,
                driverName: '',
                vehicleName: '',
                vehicleLicensePlate: '',
            }));
            setIsExistingDriver(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof TripFormState]) {
            setErrors(prev => ({...prev, [name]: undefined}));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof TripFormState, string>> = {};
        if (!formData.clientId) newErrors.clientId = 'Client is required.';
        
        if (!formData.driverPhone.trim()) {
            newErrors.driverPhone = 'Driver phone is required.';
        } else if (!/^\d{10}$/.test(formData.driverPhone.trim())) {
            newErrors.driverPhone = 'Please enter a valid 10-digit phone number.';
        }
        
        if (!formData.driverName.trim()) newErrors.driverName = 'Driver name is required.';
        if (!formData.vehicleName.trim()) newErrors.vehicleName = 'Vehicle name is required.';
        if (!formData.vehicleLicensePlate.trim()) newErrors.vehicleLicensePlate = 'Vehicle plate is required.';
        
        if (!formData.fareId) newErrors.fareId = 'Fare is required.';
        if (!formData.bookingClientName.trim()) newErrors.bookingClientName = 'Booking client/dept is required.';
        if (!formData.dutySlipNumber.trim()) newErrors.dutySlipNumber = 'Duty Slip Number is required.';
        if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required.';
        if (!formData.customerNumber.trim()) {
            newErrors.customerNumber = 'Customer number is required.';
        } else if (!/^\d{10}$/.test(formData.customerNumber.trim())) {
            newErrors.customerNumber = 'Please enter a valid 10-digit phone number.';
        }
        if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required.';
        if (!formData.checkInTime) newErrors.checkInTime = 'Check-in time is required.';
        if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required.';
        if (!formData.checkOutTime) newErrors.checkOutTime = 'Check-out time is required.';
        if (formData.startOdometer === '' || Number(formData.startOdometer) < 0) {
            newErrors.startOdometer = 'Start odometer must be a non-negative number.';
        }
        if (formData.endOdometer === '' || Number(formData.endOdometer) < 0) {
            newErrors.endOdometer = 'End odometer must be a non-negative number.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;
        if (isSaving) return;
        setIsSaving(true);

        try {
            let driverId: string;
            const existingDriver = drivers.find(d => d.phone === formData.driverPhone);

            if (existingDriver) {
                driverId = existingDriver.id;
            } else {
                const newDriver = await addDriver({
                    name: formData.driverName.trim(),
                    phone: formData.driverPhone.trim(),
                    vehicleName: formData.vehicleName.trim(),
                    vehicleLicensePlate: formData.vehicleLicensePlate.trim().toUpperCase(),
                });
                driverId = newDriver.id;
            }
            
            const customerPhone = formData.customerNumber.trim();
            if (formData.clientId && customerPhone && formData.customerName.trim()) {
                const isExistingCustomer = customers.some(
                    c => c.clientId === formData.clientId && c.phone === customerPhone
                );
                if (!isExistingCustomer) {
                    await addCustomer({
                        name: formData.customerName.trim(),
                        phone: customerPhone,
                        clientId: formData.clientId,
                    });
                }
            }

            const checkInDateTime = new Date(`${formData.checkInDate}T${formData.checkInTime}`);
            const checkOutDateTime = new Date(`${formData.checkOutDate}T${formData.checkOutTime}`);
            
            const tripDataForSave = {
                clientId: formData.clientId,
                eventId: formData.eventId || undefined,
                bookingClientName: formData.bookingClientName,
                dutySlipNumber: formData.dutySlipNumber,
                driverId: driverId,
                fareId: formData.fareId,
                description: formData.description,
                customerName: formData.customerName,
                customerNumber: formData.customerNumber,
                plannedCheckInTime: checkInDateTime.toISOString(),
                plannedCheckOutTime: checkOutDateTime.toISOString(),
                plannedStartOdometer: Number(formData.startOdometer),
                plannedEndOdometer: Number(formData.endOdometer),
                destinationUrl: formData.destinationUrl,
                status: tripToEdit?.status || 'ASSIGNED',
            };

            if (tripToEdit) {
                await updateTrip({ ...tripToEdit, ...tripDataForSave });
            } else {
                const tripNumber = generateTripNumber(formData.clientId, clients, trips);
                await addTrip({ ...tripDataForSave, tripNumber, status: 'ASSIGNED' });
            }
            
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={tripToEdit ? 'Edit Trip' : 'Add Trip'}>
            <form onSubmit={handleSave} noValidate>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                    <div className="sm:col-span-2">
                        <Select id="clientId" name="clientId" label="Client" value={formData.clientId} onChange={handleClientChange} required error={errors.clientId}>
                            <option value="">Select a client</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </div>
                     <Select id="eventId" name="eventId" label="Event (Optional)" value={formData.eventId || ''} onChange={handleChange} disabled={!formData.clientId} error={errors.eventId}>
                        <option value="">Select an event</option>
                        {filteredEvents.map(e => <option key={e.id} value={e.id}>{e.name} ({e.eventId})</option>)}
                    </Select>
                    <Input id="bookingClientName" name="bookingClientName" label="Booking Client / Dept / Other" value={formData.bookingClientName} onChange={handleChange} required error={errors.bookingClientName} placeholder="e.g. Lupin R&D or Guest Name" />
                    
                    <div className="sm:col-span-2">
                        <Input id="dutySlipNumber" name="dutySlipNumber" label="Duty Slip Number" value={formData.dutySlipNumber} onChange={handleChange} required error={errors.dutySlipNumber} placeholder="Enter duty slip number" />
                    </div>
                    
                    <div className="sm:col-span-2 p-4 border rounded-md border-neutral-300 space-y-4">
                         <h3 className="font-semibold text-neutral-700">Driver & Vehicle Details</h3>
                         <Input 
                            id="driverPhone" 
                            name="driverPhone" 
                            label="Driver Phone" 
                            value={formData.driverPhone} 
                            onChange={handleChange} 
                            onBlur={handlePhoneBlur} 
                            required 
                            error={errors.driverPhone} 
                            pattern="\d{10}"
                            title="Enter 10-digit phone number to look up driver"
                            placeholder="Enter 10-digit phone to find/add"
                        />
                         <Input id="driverName" name="driverName" label="Driver Name" value={formData.driverName} onChange={handleChange} required error={errors.driverName} disabled={isExistingDriver} />
                         <div className="grid grid-cols-2 gap-4">
                             <Input id="vehicleName" name="vehicleName" label="Vehicle Name/Type" value={formData.vehicleName} onChange={handleChange} required error={errors.vehicleName} disabled={isExistingDriver} />
                             <Input id="vehicleLicensePlate" name="vehicleLicensePlate" label="Plate Number" value={formData.vehicleLicensePlate} onChange={handleChange} required error={errors.vehicleLicensePlate} disabled={isExistingDriver} />
                         </div>
                    </div>

                    <div className="sm:col-span-2">
                        <Select id="fareId" name="fareId" label="Fare" value={formData.fareId || ''} onChange={handleChange} required error={errors.fareId}>
                            <option value="">Select a fare</option>
                            {fares.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </Select>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">Description (Optional)</label>
                        <textarea id="description" name="description" rows={2} value={formData.description || ''} onChange={handleChange} className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm bg-neutral-50" />
                    </div>

                    <div className="sm:col-span-2 p-4 border rounded-md border-neutral-300 space-y-4">
                        <h3 className="font-semibold text-neutral-700">Reporting Details</h3>
                         <Select id="customerSelect" name="customerSelect" label="Select Contact (Optional)" onChange={handleCustomerChange} disabled={!formData.clientId}>
                            <option value="">-- Enter manually or select contact --</option>
                            {filteredCustomers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                        </Select>
                        <div className="grid grid-cols-2 gap-4">
                            <Input id="customerName" name="customerName" label="Customer Name" value={formData.customerName || ''} onChange={handleChange} required error={errors.customerName} />
                            <Input id="customerNumber" name="customerNumber" label="Customer Number" type="tel" value={formData.customerNumber || ''} onChange={handleChange} required error={errors.customerNumber} />
                        </div>
                    </div>

                    <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                        <Input id="checkInDate" name="checkInDate" label="Check In Date" type="date" value={formData.checkInDate || ''} onChange={handleChange} required error={errors.checkInDate} />
                        <Input id="checkInTime" name="checkInTime" label="Check In Time" type="time" value={formData.checkInTime || ''} onChange={handleChange} required error={errors.checkInTime} />
                    </div>
                    <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                        <Input id="checkOutDate" name="checkOutDate" label="Check Out Date" type="date" value={formData.checkOutDate || ''} onChange={handleChange} required error={errors.checkOutDate} />
                        <Input id="checkOutTime" name="checkOutTime" label="Check Out Time" type="time" value={formData.checkOutTime || ''} onChange={handleChange} required error={errors.checkOutTime} />
                    </div>
                    <Input id="startOdometer" name="startOdometer" label="Start Odometer (km)" type="number" value={formData.startOdometer || ''} onChange={handleChange} required error={errors.startOdometer} />
                    <Input id="endOdometer" name="endOdometer" label="End Odometer (km)" type="number" value={formData.endOdometer || ''} onChange={handleChange} required error={errors.endOdometer} />
                    <div className="sm:col-span-2">
                        <Input id="destinationUrl" name="destinationUrl" label="Destination URL (Optional)" value={formData.destinationUrl || ''} onChange={handleChange} />
                    </div>
                </div>
                <div className="bg-neutral-100 px-6 py-3 flex justify-end space-x-2 border-t">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Trip'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default TripFormModal;