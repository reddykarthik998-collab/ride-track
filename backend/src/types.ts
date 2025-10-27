// Types matching the frontend types.ts
export enum UserType {
    ADMIN = 'admin',
    DRIVER = 'driver',
}

export interface Driver {
    id: string;
    name: string;
    phone: string;
    vehicleName: string;
    vehicleLicensePlate: string;
}

export interface Client {
    id: string;
    name: string;
    prefix: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    clientId: string;
}

export enum FareType {
    LOCAL = 'LOCAL',
    OUTSTATION = 'OUTSTATION',
}

export interface Fare {
    id: string;
    name: string;
    type: FareType;
    baseFare: number;
    perKmCharge: number;
    perHourCharge: number;
}

export interface Event {
    id: string;
    eventId: string;
    clientId: string;
    name: string;
    prefix: string;
    startDate: string;
    endDate: string;
}

export type TripStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Trip {
    id: string;
    tripNumber: string;
    eventId?: string;
    clientId: string;
    bookingClientName: string;
    driverId: string;
    fareId: string;
    
    description?: string;
    reportingPoint: string;
    reportingTo: string;
    reportingToPhone: string;
    plannedCheckInTime: string;
    plannedStartOdometer: number;
    destinationUrl?: string;

    actualCheckInTime?: string;
    actualStartOdometer?: number;
    startOdometerPhotoUrl?: string;
    actualCheckOutTime?: string;
    actualEndOdometer?: number;
    endOdometerPhotoUrl?: string;
    remarks?: string;

    status: TripStatus;
}

export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}
