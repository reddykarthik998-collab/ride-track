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

// REMOVED: Vehicle interface is now merged into Driver.

// RENAMED: Company is now Client. This is the top-level entity.
export interface Client {
    id: string;
    name: string;
    prefix: string;
}

// NEW: A Customer represents an individual contact, usually associated with a Client.
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

// REVISED: Event has new fields for prefix and date ranges.
export interface Event {
    id:string;
    eventId: string; // e.g., LUP_DRM-001
    clientId: string;
    name: string;
    prefix: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
}


export type TripStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';

// REVISED: Trip entity is simplified and aligned with the new data model.
export interface Trip {
    id: string;
    tripNumber: string; // The shareable ID for the driver.
    eventId?: string; // All trips belong to an event now
    clientId: string; // Formerly companyId
    bookingClientName: string; // Stores the manually entered client name, replacing the old Client entity.
    driverId: string;
    fareId: string;
    dutySlipNumber: string;
    
    // Planning fields from company
    description?: string;
    customerName: string;
    customerNumber: string;
    plannedCheckInTime: string; // ISO String
    plannedCheckOutTime: string; // ISO String
    plannedStartOdometer: number;
    plannedEndOdometer: number;
    destinationUrl?: string;

    // Execution fields from driver
    actualCheckInTime?: string; // ISO string
    actualStartOdometer?: number;
    startOdometerPhotoUrl?: string;
    actualCheckOutTime?: string; // ISO string
    actualEndOdometer?: number;
    endOdometerPhotoUrl?: string;
    remarks?: string;

    status: TripStatus;
}