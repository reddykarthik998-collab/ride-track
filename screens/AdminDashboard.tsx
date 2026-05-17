import React, { useState } from 'react';
import DashboardHome from './admin/DashboardHome';
import DriverManagement from './admin/DriverManagement';
import ClientManagement from './admin/ClientManagement';
import CustomerManagement from './admin/CustomerManagement';
import FareManagement from './admin/FareManagement';
import EventManagement from './admin/EventManagement';
import TripManagement from './admin/TripManagement';
import LiveMap from './admin/LiveMap';
import Reports from './admin/Reports';
import AccountSettings from './admin/AccountSettings'; // Import the new component
import { ToastContainer } from '../components/Toast';
import { useAppContext } from '../contexts/AppContext';

type AdminTab = 'dashboard' | 'trips' | 'events' | 'map' | 'reports' | 'drivers' | 'customers' | 'clients' | 'fares' | 'settings'; // Add 'settings'

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const { drivers, customers, clients, fares } = useAppContext();

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardHome />;
            case 'trips': return <TripManagement />;
            case 'events': return <EventManagement />;
            case 'map': return <LiveMap />;
            case 'reports': return <Reports />;
            case 'drivers': return <DriverManagement />;
            case 'customers': return <CustomerManagement />;
            case 'clients': return <ClientManagement />;
            case 'fares': return <FareManagement />;
            case 'settings': return <AccountSettings />; // Add case for settings
            default: return <DashboardHome />;
        }
    };
    
    const NavLink: React.FC<{ tabName: AdminTab; label: string }> = ({ tabName, label }) => {
        const isActive = activeTab === tabName;
        const classes = isActive 
            ? 'bg-brand-blue text-white' 
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900';
        return (
            <button onClick={() => setActiveTab(tabName)} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${classes}`}>
                {label}
            </button>
        );
    };

    return (
        <div className="flex">
             <ToastContainer />
            <aside className="w-64 bg-neutral-100 p-4 border-r border-neutral-200 min-h-[calc(100vh-4rem)]">
                <nav className="space-y-1">
                    <NavLink tabName="dashboard" label="Dashboard" />
                    <NavLink tabName="map" label="Live Map" />
                    <NavLink tabName="trips" label="Trip Management" />
                    <NavLink tabName="events" label="Event Management" />
                    <NavLink tabName="reports" label="Reports" />
                    
                    <div className="pt-4 mt-4 border-t border-neutral-300">
                        <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Data Management
                        </h3>
                         <div className="mt-2 space-y-1">
                            <NavLink tabName="drivers" label={`Drivers (${drivers.length})`} />
                            <NavLink tabName="customers" label={`Customers (${customers.length})`} />
                            <NavLink tabName="clients" label={`Clients (${clients.length})`} />
                            <NavLink tabName="fares" label={`Fares (${fares.length})`} />
                        </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-neutral-300">
                        <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Account
                        </h3>
                         <div className="mt-2 space-y-1">
                            <NavLink tabName="settings" label="Account Settings" />
                        </div>
                    </div>
                </nav>
            </aside>
            <main className="flex-1 p-6 bg-neutral-50">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;