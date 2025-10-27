import React, { useState, useEffect } from 'react';
import { UserType, Driver, Trip } from './types';
import LoginScreen from './screens/LoginScreen';
import AdminDashboard from './screens/AdminDashboard';
import DriverDashboard from './screens/DriverDashboard';
import { Header } from './components/Header';
import { CarIcon, UserCircleIcon } from './components/icons/Icons';
import { AppProvider, useAppContext } from './contexts/AppContext';

// Authentication state interface
interface AuthState {
    userType: UserType;
    userId?: string;
    token?: string;
    driver?: Driver;
    initialTrip?: Trip;
}

// The main application logic is moved into a child component
// so it can access the state from AppProvider's context.
const AppContent: React.FC = () => {
    const [authState, setAuthState] = useState<AuthState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Get LIVE data from the context, not from a stale initial state.
    const { drivers, trips } = useAppContext();
    
    // Load authentication state from localStorage on app startup
    useEffect(() => {
        const loadAuthState = async () => {
            const savedAuth = localStorage.getItem('ridetrack_auth');
            if (savedAuth) {
                try {
                    const parsedAuth = JSON.parse(savedAuth);
                    
                    // Validate token with backend if it exists
                    if (parsedAuth.token) {
                        try {
                            const response = await fetch('http://localhost:3001/api/auth/me', {
                                headers: {
                                    'Authorization': `Bearer ${parsedAuth.token}`
                                }
                            });
                            
                            if (response.ok) {
                                setAuthState(parsedAuth);
                            } else {
                                // Token is invalid, clear it
                                localStorage.removeItem('ridetrack_auth');
                            }
                        } catch (error) {
                            console.error('Token validation failed:', error);
                            localStorage.removeItem('ridetrack_auth');
                        }
                    } else {
                        // No token, but valid auth state (for driver login without token)
                        setAuthState(parsedAuth);
                    }
                } catch (error) {
                    console.error('Failed to parse saved auth state:', error);
                    localStorage.removeItem('ridetrack_auth');
                }
            }
            setIsLoading(false);
        };
        
        loadAuthState();
    }, []);
    
    const handleLogin = (type: UserType, userId?: string, trip?: Trip, token?: string) => {
        const newAuthState: AuthState = {
            userType: type,
            userId,
            token,
            driver: type === UserType.DRIVER && userId ? drivers.find(d => d.id === userId) || undefined : undefined,
            initialTrip: trip
        };
        
        setAuthState(newAuthState);
        localStorage.setItem('ridetrack_auth', JSON.stringify(newAuthState));
    };
    
    const handleLogout = () => {
        setAuthState(null);
        localStorage.removeItem('ridetrack_auth');
    };

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="bg-neutral-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-neutral-50 min-h-screen font-sans">
            {!authState ? (
                // LoginScreen now receives the live 'trips' list from the context.
                <LoginScreen onLogin={handleLogin} trips={trips} />
            ) : (
                <>
                    {authState.userType === UserType.ADMIN && (
                         <Header title="Admin Dashboard" icon={<UserCircleIcon className="w-8 h-8 text-white"/>} onLogout={handleLogout} />
                    )}
                    {authState.userType === UserType.DRIVER && authState.driver && (
                        <Header title="Driver Dashboard" icon={<CarIcon className="w-8 h-8 text-white"/>} onLogout={handleLogout} />
                    )}

                    <main>
                        {authState.userType === UserType.ADMIN && <AdminDashboard />}
                        {authState.userType === UserType.DRIVER && authState.driver && (
                            <DriverDashboard 
                                driver={authState.driver}
                                initialTrip={authState.initialTrip || null}
                            />
                        )}
                    </main>
                </>
            )}
        </div>
    );
};


// The App component is now a simple wrapper to provide the context to its children.
const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}

export default App;
