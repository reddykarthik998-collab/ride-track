import { Client, Event, Trip } from "../types";

// REMOVED: No longer needed as the old Client entity is gone.

export const generateEventId = (clientId: string, eventPrefix: string, clients: Client[], events: Event[]): string => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return `EVT-${Date.now()}`;
    
    const clientEventsWithPrefix = events.filter(e => e.clientId === clientId && e.prefix === eventPrefix);
    const nextId = (clientEventsWithPrefix.length + 1).toString().padStart(3, '0');
    
    return `${client.prefix}_${eventPrefix}-${nextId}`;
};

export const generateTripNumber = (clientId: string, clients: Client[], trips: Trip[]): string => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return `TRIP-${Date.now()}`;

    const clientTrips = trips.filter(t => t.clientId === clientId && t.tripNumber.startsWith(client.prefix));
    
    let maxNum = 0;
    const prefix = client.prefix;
    
    clientTrips.forEach(trip => {
        const baseId = trip.tripNumber.split('-')[0];
        if (baseId.startsWith(prefix)) {
            const numPartStr = baseId.substring(prefix.length);
            const numPart = parseInt(numPartStr, 10);
            if (!isNaN(numPart) && numPart > maxNum) {
                maxNum = numPart;
            }
        }
    });

    const nextNum = maxNum + 1;
    return `${prefix}${nextNum.toString().padStart(5, '0')}`;
};