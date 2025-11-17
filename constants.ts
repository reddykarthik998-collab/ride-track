import { Driver, Client, Fare, Event, Trip, FareType, Customer } from './types';

export const GENERAL_CLIENT_ID = 'c-general';

export const MOCK_DRIVERS: Driver[] = [
    { id: 'd1', name: 'John Doe', phone: '9876543210', vehicleName: 'Toyota Cresta', vehicleLicensePlate: 'TS09AB1234' },
    { id: 'd2', name: 'Jane Smith', phone: '9123456789', vehicleName: 'Maruti Dzire', vehicleLicensePlate: 'KA01EF9012' },
    { id: 'd3', name: 'Peter Jones', phone: '9988776655', vehicleName: 'Toyota Innova', vehicleLicensePlate: 'AP07CD5678' },
];

// REMOVED: MOCK_VEHICLES is no longer needed as vehicle info is part of MOCK_DRIVERS.

// UPDATED: Renamed from MOCK_COMPANIES to MOCK_CLIENTS
export const MOCK_CLIENTS: Client[] = [
    { id: 'c1', name: 'Lupin', prefix: 'LUP' },
    { id: 'c2', name: 'CCMB', prefix: 'CCMB' },
    { id: 'c3', name: 'Aurobindo Pharma', prefix: 'AUR' },
    { id: GENERAL_CLIENT_ID, name: 'General', prefix: 'GEN' },
];

export const MOCK_CUSTOMERS: Customer[] = [
    { id: 'cust1', name: 'Mr. Sharma', phone: '9876543210', email: 'sharma@lupin.com', clientId: 'c1' },
    { id: 'cust2', name: 'Dr. Rao', phone: '9123456780', email: 'rao@ccmb.res.in', clientId: 'c2' },
    { id: 'cust3', name: 'Ms. Priya', phone: '9988776655', email: 'priya@lupin.com', clientId: 'c1' },
    { id: 'cust4', name: 'Logistics Head', phone: '9555512345', clientId: 'c3' },
];


// REMOVED: MOCK_CLIENTS (old entity) is no longer needed.

export const MOCK_FARES: Fare[] = [
    { id: 'f1', name: 'Standard Local', type: FareType.LOCAL, baseFare: 100, perKmCharge: 12, perHourCharge: 50 },
    { id: 'f2', name: 'Standard Outstation', type: FareType.OUTSTATION, baseFare: 2500, perKmCharge: 15, perHourCharge: 0 },
    { id: 'f3', name: 'Premium Local', type: FareType.LOCAL, baseFare: 150, perKmCharge: 18, perHourCharge: 75 },
];

// REVISED: Events have prefixes and date ranges now
export const MOCK_EVENTS: Event[] = [
    { id: 'e1', eventId: 'LUP_CONF-001', clientId: 'c1', name: 'Annual Conference 2024', prefix: 'CONF', startDate: '2024-07-28', endDate: '2024-07-29' },
    { id: 'e2', eventId: 'CCMB_SYM-001', clientId: 'c2', name: 'Research Symposium', prefix: 'SYM', startDate: '2024-07-29', endDate: '2024-07-29' },
    { id: 'e3', eventId: 'AUR_LOG-001', clientId: 'c3', name: 'Logistics Meetup', prefix: 'LOG', startDate: '2024-07-27', endDate: '2024-07-27' },
];

// REVISED: Trips are updated to the new structure without vehicleId
export const MOCK_TRIPS: Trip[] = [
    { 
        id: 't1', 
        tripNumber: 'LUP00001', 
        eventId: 'e1',
        bookingClientName: 'Lupin R&D',
        clientId: 'c1', 
        driverId: 'd1', 
        fareId: 'f1', 
        status: 'ASSIGNED', 
        destinationUrl: 'https://maps.app.goo.gl/9q5xZ6f2Y7z3E7r1A',
        customerName: 'Mr. Sharma',
        customerNumber: '9876543210',
        plannedCheckInTime: '2024-07-28T08:00:00Z',
        plannedStartOdometer: 15000,
    },
    { 
        id: 't2', 
        tripNumber: 'CCMB00001', 
        eventId: 'e2',
        bookingClientName: 'CCMB Main Office',
        clientId: 'c2', 
        driverId: 'd3', 
        fareId: 'f2', 
        status: 'ASSIGNED',
        customerName: 'Dr. Rao',
        customerNumber: '9123456780',
        plannedCheckInTime: '2024-07-29T10:00:00Z',
        plannedStartOdometer: 85000,
    },
    { 
        id: 't3', 
        tripNumber: 'LUP00002',
        eventId: 'e1',
        bookingClientName: 'Lupin Marketing',
        clientId: 'c1', 
        driverId: 'd2', 
        fareId: 'f1', 
        status: 'IN_PROGRESS', 
        destinationUrl: 'https://maps.app.goo.gl/1tH8gY5Z9sW6f4uTA',
        customerName: 'Ms. Priya',
        customerNumber: '9988776655',
        plannedCheckInTime: '2024-07-28T09:00:00Z',
        plannedStartOdometer: 55120,
        actualCheckInTime: '2024-07-28T09:05:00Z',
        actualStartOdometer: 55123,
        startOdometerPhotoUrl: 'https://via.placeholder.com/400x200.png?text=Start+Odometer',
    },
    { 
        id: 't4', 
        tripNumber: 'AUR00001', 
        eventId: 'e3',
        bookingClientName: 'Others',
        clientId: 'c3', 
        driverId: 'd1', 
        fareId: 'f1', 
        status: 'COMPLETED',
        customerName: 'Logistics Head',
        customerNumber: '9555512345',
        plannedCheckInTime: '2024-07-27T10:00:00Z',
        plannedStartOdometer: 12340,
        actualCheckInTime: '2024-07-27T10:00:00Z',
        actualStartOdometer: 12345,
        startOdometerPhotoUrl: 'https://via.placeholder.com/400x200.png?text=Start+Odometer',
        actualCheckOutTime: '2024-07-27T18:30:00Z',
        actualEndOdometer: 12450,
        endOdometerPhotoUrl: 'https://via.placeholder.com/400x200.png?text=End+Odometer',
        remarks: 'Client meeting ran late.',
    },
    { 
        id: 't5', 
        tripNumber: 'CCMB00002', 
        eventId: 'e2',
        bookingClientName: 'Future Event Guest',
        clientId: 'c2', 
        driverId: 'd2', 
        fareId: 'f2', 
        status: 'ASSIGNED',
        customerName: 'Mr. Tomorrow',
        customerNumber: '9876543211',
        plannedCheckInTime: '2025-10-18T11:59:00Z',
        plannedStartOdometer: 90000,
    },
];