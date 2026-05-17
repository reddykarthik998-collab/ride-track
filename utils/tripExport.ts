import { Trip } from '../types';
import { formatDateTime } from './formatters';

/** Same date/time extraction as TripFormModal so CSV matches the Edit Trip form. */
export const formDateFromIso = (iso?: string | Date | null): string => {
    if (iso == null || iso === '') return 'N/A';
    const date = iso instanceof Date ? iso : new Date(iso);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toISOString().split('T')[0];
};

export const formTimeFromIso = (iso?: string | Date | null): string => {
    if (iso == null || iso === '') return 'N/A';
    const date = iso instanceof Date ? iso : new Date(iso);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toTimeString().slice(0, 5);
};

export const csvDateTime = (value?: string | Date | null): string => {
    if (value == null || value === '') return 'N/A';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return formatDateTime(date.toISOString());
};

export const csvNumber = (value?: number | null): string | number => {
    if (value == null || Number.isNaN(value)) return 'N/A';
    return value;
};

/** Prefer driver-recorded value, then planned value from the admin form. */
export const resolveCheckOutTime = (trip: Trip): string | undefined =>
    trip.actualCheckOutTime ?? trip.plannedCheckOutTime;

export const resolveEndOdometer = (trip: Trip): number | undefined => {
    if (trip.actualEndOdometer != null && !Number.isNaN(trip.actualEndOdometer)) {
        return trip.actualEndOdometer;
    }
    if (trip.plannedEndOdometer != null && !Number.isNaN(trip.plannedEndOdometer)) {
        return trip.plannedEndOdometer;
    }
    return undefined;
};

export const resolveStartOdometer = (trip: Trip): number | undefined => {
    if (trip.actualStartOdometer != null && !Number.isNaN(trip.actualStartOdometer)) {
        return trip.actualStartOdometer;
    }
    if (trip.plannedStartOdometer != null && !Number.isNaN(trip.plannedStartOdometer)) {
        return trip.plannedStartOdometer;
    }
    return undefined;
};

export const resolveCheckInTime = (trip: Trip): string | undefined =>
    trip.actualCheckInTime ?? trip.plannedCheckInTime;
