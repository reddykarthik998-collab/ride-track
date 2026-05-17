import React, { createContext, useContext, useState, useEffect } from 'react';
import { Driver, Client, Fare, Event, Trip, Customer } from '../types';
import { apiService } from '../utils/apiService';

export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface AppContextType {
    drivers: Driver[];
    addDriver: (driver: Omit<Driver, 'id'>) => Promise<Driver>;
    updateDriver: (driver: Driver) => Promise<void>;
    deleteDriver: (id: string) => Promise<void>;
    
    customers: Customer[];
    addCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer>;
    updateCustomer: (customer: Customer) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;

    clients: Client[];
    addClient: (client: Omit<Client, 'id'>) => Promise<Client>;
    updateClient: (client: Client) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;

    fares: Fare[];
    addFare: (fare: Omit<Fare, 'id'>) => Promise<Fare>;
    updateFare: (fare: Fare) => Promise<void>;
    deleteFare: (id: string) => Promise<void>;

    events: Event[];
    addEvent: (event: Omit<Event, 'id'>) => Promise<Event>;
    updateEvent: (event: Event) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;

    trips: Trip[];
    addTrip: (trip: Omit<Trip, 'id'>) => Promise<Trip>;
    updateTrip: (trip: Trip) => Promise<void>;
    deleteTrip: (id: string) => Promise<void>;

    toasts: ToastMessage[];
    addToast: (message: string, type: ToastMessage['type']) => void;
    removeToast: (id: number) => void;

    adminPassword: string;
    updateAdminPassword: (newPassword: string) => void;
    
    loading: boolean;
    error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [fares, setFares] = useState<Fare[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [adminPassword, setAdminPassword] = useState<string>('admin123');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const [driversData, clientsData, customersData, faresData, eventsData, tripsData] = await Promise.all([
                    apiService.getDrivers(),
                    apiService.getClients(),
                    apiService.getCustomers(),
                    apiService.getFares(),
                    apiService.getEvents(),
                    apiService.getTrips()
                ]);
                
                setDrivers(driversData);
                setClients(clientsData);
                setCustomers(customersData);
                setFares(faresData);
                setEvents(eventsData);
                setTrips(tripsData);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load data from server');
                addToast('Failed to connect to server. Please check if the backend is running.', 'error');
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);

    const updateAdminPassword = (newPassword: string) => {
        setAdminPassword(newPassword);
    };

    const addToast = (message: string, type: ToastMessage['type']) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Driver functions
    const addDriver = async (driver: Omit<Driver, 'id'>): Promise<Driver> => {
        try {
            const newDriver = await apiService.createDriver(driver);
            setDrivers(prev => [...prev, newDriver]);
            addToast('Driver added successfully!', 'success');
            return newDriver;
        } catch (err: any) {
            addToast(err.message || 'Failed to add driver', 'error');
            throw err;
        }
    };

    const updateDriver = async (driver: Driver): Promise<void> => {
        try {
            await apiService.updateDriver(driver.id, driver);
            setDrivers(prev => prev.map(d => d.id === driver.id ? driver : d));
            addToast('Driver updated successfully!', 'success');
        } catch (err: any) {
            addToast(err.message || 'Failed to update driver', 'error');
            throw err;
        }
    };

    const deleteDriver = async (id: string): Promise<void> => {
        try {
            await apiService.deleteDriver(id);
            setDrivers(prev => prev.filter(d => d.id !== id));
            addToast('Driver deleted successfully.', 'info');
        } catch (err: any) {
            addToast(err.message || 'Failed to delete driver', 'error');
            throw err;
        }
    };

    // Client functions
    const addClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
        try {
            const newClient = await apiService.createClient(client);
            setClients(prev => [...prev, newClient]);
            addToast('Client added successfully!', 'success');
            return newClient;
        } catch (err: any) {
            addToast(err.message || 'Failed to add client', 'error');
            throw err;
        }
    };

    const updateClient = async (client: Client): Promise<void> => {
        try {
            await apiService.updateClient(client.id, client);
            setClients(prev => prev.map(c => c.id === client.id ? client : c));
            addToast('Client updated successfully!', 'success');
        } catch (err: any) {
            addToast(err.message || 'Failed to update client', 'error');
            throw err;
        }
    };

    const deleteClient = async (id: string): Promise<void> => {
        try {
            await apiService.deleteClient(id);
            setClients(prev => prev.filter(c => c.id !== id));
            setTrips(prev => prev.filter(trip => trip.clientId !== id));
            setEvents(prev => prev.filter(event => event.clientId !== id));
            addToast('Client and all associated data deleted.', 'info');
        } catch (err: any) {
            addToast(err.message || 'Failed to delete client', 'error');
            throw err;
        }
    };

    // Customer functions
    const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
        try {
            const newCustomer = await apiService.createCustomer(customer);
            setCustomers(prev => [...prev, newCustomer]);
            addToast('Customer added successfully!', 'success');
            return newCustomer;
        } catch (err: any) {
            addToast(err.message || 'Failed to add customer', 'error');
            throw err;
        }
    };

    const updateCustomer = async (customer: Customer): Promise<void> => {
        try {
            await apiService.updateCustomer(customer.id, customer);
            setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
            addToast('Customer updated successfully!', 'success');
        } catch (err: any) {
            addToast(err.message || 'Failed to update customer', 'error');
            throw err;
        }
    };

    const deleteCustomer = async (id: string): Promise<void> => {
        try {
            await apiService.deleteCustomer(id);
            setCustomers(prev => prev.filter(c => c.id !== id));
            addToast('Customer deleted successfully.', 'info');
        } catch (err: any) {
            addToast(err.message || 'Failed to delete customer', 'error');
            throw err;
        }
    };

    // Fare functions
    const addFare = async (fare: Omit<Fare, 'id'>): Promise<Fare> => {
        try {
            const newFare = await apiService.createFare(fare);
            setFares(prev => [...prev, newFare]);
            addToast('Fare added successfully!', 'success');
            return newFare;
        } catch (err: any) {
            addToast(err.message || 'Failed to add fare', 'error');
            throw err;
        }
    };

    const updateFare = async (fare: Fare): Promise<void> => {
        try {
            await apiService.updateFare(fare.id, fare);
            setFares(prev => prev.map(f => f.id === fare.id ? fare : f));
            addToast('Fare updated successfully!', 'success');
        } catch (err: any) {
            addToast(err.message || 'Failed to update fare', 'error');
            throw err;
        }
    };

    const deleteFare = async (id: string): Promise<void> => {
        try {
            await apiService.deleteFare(id);
            setFares(prev => prev.filter(f => f.id !== id));
            addToast('Fare deleted successfully.', 'info');
        } catch (err: any) {
            addToast(err.message || 'Failed to delete fare', 'error');
            throw err;
        }
    };

    // Event functions
    const addEvent = async (event: Omit<Event, 'id'>): Promise<Event> => {
        try {
            const newEvent = await apiService.createEvent(event);
            setEvents(prev => [...prev, newEvent]);
            addToast('Event added successfully!', 'success');
            return newEvent;
        } catch (err: any) {
            addToast(err.message || 'Failed to add event', 'error');
            throw err;
        }
    };

    const updateEvent = async (event: Event): Promise<void> => {
        try {
            await apiService.updateEvent(event.id, event);
            setEvents(prev => prev.map(e => e.id === event.id ? event : e));
            addToast('Event updated successfully!', 'success');
        } catch (err: any) {
            addToast(err.message || 'Failed to update event', 'error');
            throw err;
        }
    };

    const deleteEvent = async (id: string): Promise<void> => {
        try {
            await apiService.deleteEvent(id);
            setEvents(prev => prev.filter(e => e.id !== id));
            addToast('Event deleted successfully.', 'info');
        } catch (err: any) {
            addToast(err.message || 'Failed to delete event', 'error');
            throw err;
        }
    };

    // Trip functions
    const addTrip = async (trip: Omit<Trip, 'id'>): Promise<Trip> => {
        try {
            const newTrip = await apiService.createTrip(trip);
            setTrips(prev => [...prev, newTrip]);
            addToast('Trip added successfully!', 'success');
            return newTrip;
        } catch (err: any) {
            addToast(err.message || 'Failed to add trip', 'error');
            throw err;
        }
    };

    const updateTrip = async (trip: Trip): Promise<void> => {
        try {
            await apiService.updateTrip(trip.id, trip);
            setTrips(prev => prev.map(t => t.id === trip.id ? trip : t));
            // Refresh trips list to ensure sync with server
            const updatedTrips = await apiService.getTrips();
            setTrips(updatedTrips);
        } catch (err: any) {
            addToast(err.message || 'Failed to update trip', 'error');
            throw err;
        }
    };

    const deleteTrip = async (id: string): Promise<void> => {
        try {
            await apiService.deleteTrip(id);
            setTrips(prev => prev.filter(t => t.id !== id));
            addToast('Trip deleted successfully.', 'info');
        } catch (err: any) {
            addToast(err.message || 'Failed to delete trip', 'error');
            throw err;
        }
    };

    const value: AppContextType = {
        drivers, addDriver, updateDriver, deleteDriver,
        customers, addCustomer, updateCustomer, deleteCustomer,
        clients, addClient, updateClient, deleteClient,
        fares, addFare, updateFare, deleteFare,
        events, addEvent, updateEvent, deleteEvent,
        trips, addTrip, updateTrip, deleteTrip,
        toasts, addToast, removeToast,
        adminPassword, updateAdminPassword,
        loading, error
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};