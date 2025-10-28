import React, { useState } from 'react';
import { UserType, Driver, Trip } from '../types';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { CarIcon, UserCircleIcon } from '../components/icons/Icons';
import { formatDateTime } from '../utils/formatters';
import { useAppContext } from '../contexts/AppContext';

interface LoginScreenProps {
    onLogin: (type: UserType, userId?: string, trip?: Trip, token?: string) => void;
    trips: Trip[];
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, trips }) => {
    const { adminPassword: centralAdminPassword } = useAppContext(); // Get password from context
    const [tripNumber, setTripNumber] = useState('');
    const [isAdminModalOpen, setAdminModalOpen] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const openAdminLogin = () => {
        setAdminPassword('');
        setLoginError('');
        setAdminModalOpen(true);
    };

    const handleAdminLogin = async () => {
        setLoginError('');
        
        try {
            // Use backend authentication using configured API base URL
            const API_BASE = (import.meta as any).env?.VITE_API_URL || 'https://ride-track-pro.onrender.com/api';
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'admin',
                    password: adminPassword
                })
            });

            if (response.ok) {
                const data = await response.json();
                onLogin(UserType.ADMIN, undefined, undefined, data.token);
                setAdminModalOpen(false);
            } else {
                const error = await response.json();
                setLoginError(error.error || 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            setLoginError('Network error. Please check your connection.');
        }
    };
    
    const handleDriverLogin = () => {
        setLoginError('');
        if (!tripNumber) {
            setLoginError('Please enter a Trip Number.');
            return;
        }
        const trip = trips.find(t => t.tripNumber.toLowerCase() === tripNumber.toLowerCase());
        
        if (trip) {
            const now = new Date();
            const plannedCheckIn = new Date(trip.plannedCheckInTime);

            // Calculate the earliest login time (20 minutes before planned check-in)
            const earliestLoginTime = new Date(plannedCheckIn.getTime() - 20 * 60 * 1000);

            if (now < earliestLoginTime) {
                const formattedDate = formatDateTime(trip.plannedCheckInTime);
                setLoginError(`This trip is scheduled for ${formattedDate}. Please try again closer to the scheduled time.`);
                return;
            }

            if (trip.status === 'COMPLETED') {
                setLoginError('This trip has already been completed.');
            } else {
                onLogin(UserType.DRIVER, trip.driverId, trip);
            }
        } else {
            setLoginError('Trip Number not found. Please check and try again.');
        }
    };

    return (
        <>
            <div className="max-w-md mx-auto mt-10">
                <Card>
                    <CardHeader className="text-center">
                        <h1 className="text-2xl font-bold text-neutral-800">Welcome to Sree Hari Travels</h1>
                        <p className="text-neutral-500">Please select your role to continue</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-700 mb-2">I am a Driver</h2>
                            <div className="flex flex-col gap-4">
                               <Input 
                                   id="trip-number-login"
                                   label="Enter your Trip Number"
                                   value={tripNumber}
                                   onChange={e => setTripNumber(e.target.value)}
                                   onKeyDown={e => { if (e.key === 'Enter') handleDriverLogin() }}
                                   placeholder="e.g., LUP00001"
                                   autoFocus
                               />
                                {loginError && !isAdminModalOpen && <p className="text-sm text-brand-red">{loginError}</p>}
                                <Button
                                    onClick={handleDriverLogin}
                                    disabled={!tripNumber}
                                    className="w-full"
                                    icon={<CarIcon />}
                                >
                                    Start My Trip
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">OR</span>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-neutral-700 mb-2">I am an Admin</h2>
                            <Button
                                onClick={openAdminLogin}
                                variant="secondary"
                                className="w-full"
                                icon={<UserCircleIcon />}
                            >
                                Login
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Modal isOpen={isAdminModalOpen} onClose={() => setAdminModalOpen(false)} title="Admin Login">
                <div className="p-6 space-y-4">
                    <p className="text-sm text-neutral-600">Please enter the admin password to proceed.</p>
                    <Input
                        id="admin-password"
                        label="Password"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => { setAdminPassword(e.target.value); setLoginError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAdminLogin() }}
                        autoFocus
                    />
                    {loginError && isAdminModalOpen && <p className="text-sm text-brand-red">{loginError}</p>}
                </div>
                <div className="bg-neutral-100 px-6 py-3 flex justify-end items-center space-x-2">
                    <Button variant="secondary" onClick={() => { setAdminModalOpen(false); setLoginError(''); }}>Cancel</Button>
                    <Button onClick={handleAdminLogin}>Login</Button>
                </div>
            </Modal>
        </>
    );
};

export default LoginScreen;