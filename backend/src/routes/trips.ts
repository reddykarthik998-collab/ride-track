import { Router, Request, Response } from 'express';
import getDatabase from '../database';
import { Trip } from '../types';
const { ObjectId } = require('mongodb');

const router = Router();

// Helper function to map MongoDB document to Trip object
const mapTrip = (doc: any): Trip => ({
  id: doc._id.toString(),
  tripNumber: doc.tripNumber,
  eventId: doc.eventId,
  clientId: doc.clientId,
  bookingClientName: doc.bookingClientName,
  driverId: doc.driverId,
  fareId: doc.fareId,
  description: doc.description,
  reportingPoint: doc.reportingPoint,
  reportingTo: doc.reportingTo,
  reportingToPhone: doc.reportingToPhone,
  plannedCheckInTime: doc.plannedCheckInTime,
  plannedStartOdometer: doc.plannedStartOdometer,
  destinationUrl: doc.destinationUrl,
  actualCheckInTime: doc.actualCheckInTime,
  actualStartOdometer: doc.actualStartOdometer,
  startOdometerPhotoUrl: doc.startOdometerPhotoUrl,
  actualCheckOutTime: doc.actualCheckOutTime,
  actualEndOdometer: doc.actualEndOdometer,
  endOdometerPhotoUrl: doc.endOdometerPhotoUrl,
  remarks: doc.remarks,
  status: doc.status
});

// GET /api/trips - Get all trips
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const trips = await db.collection('trips').find({ isDeleted: { $ne: true } })
      .sort({ plannedCheckInTime: -1 })
      .toArray();
    
    const result: Trip[] = trips.map(mapTrip);
    res.json(result);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/trips/trip-number/:tripNumber - Get trip by trip number
router.get('/trip-number/:tripNumber', async (req: Request, res: Response) => {
  try {
    const { tripNumber } = req.params;
    const db = getDatabase();
    
    const doc = await db.collection('trips').findOne({ 
      tripNumber,
      isDeleted: { $ne: true }
    });
    
    if (!doc) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    const trip = mapTrip(doc);
    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/trips - Create new trip
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      tripNumber,
      eventId,
      clientId,
      bookingClientName,
      driverId,
      fareId,
      description,
      reportingPoint,
      reportingTo,
      reportingToPhone,
      plannedCheckInTime,
      plannedStartOdometer,
      destinationUrl,
      status = 'ASSIGNED'
    } = req.body;
    
    const db = getDatabase();
    
    const result = await db.collection('trips').insertOne({
      tripNumber,
      eventId,
      clientId,
      bookingClientName,
      driverId,
      fareId,
      description,
      reportingPoint,
      reportingTo,
      reportingToPhone,
      plannedCheckInTime,
      plannedStartOdometer,
      destinationUrl,
      actualCheckInTime: null,
      actualStartOdometer: null,
      startOdometerPhotoUrl: null,
      actualCheckOutTime: null,
      actualEndOdometer: null,
      endOdometerPhotoUrl: null,
      remarks: null,
      status,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const trip = await db.collection('trips').findOne({ _id: result.insertedId });
    
    if (!trip) {
      return res.status(500).json({ error: 'Failed to retrieve created trip' });
    }
    
    res.status(201).json(mapTrip(trip));
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/trips/:id - Update trip
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      tripNumber,
      eventId,
      clientId,
      bookingClientName,
      driverId,
      fareId,
      description,
      reportingPoint,
      reportingTo,
      reportingToPhone,
      plannedCheckInTime,
      plannedStartOdometer,
      destinationUrl,
      actualCheckInTime,
      actualStartOdometer,
      startOdometerPhotoUrl,
      actualCheckOutTime,
      actualEndOdometer,
      endOdometerPhotoUrl,
      remarks,
      status
    } = req.body;
    
    const db = getDatabase();
    
    const result = await db.collection('trips').findOneAndUpdate(
      { _id: new ObjectId(id), isDeleted: { $ne: true } },
      {
        $set: {
          tripNumber,
          eventId,
          clientId,
          bookingClientName,
          driverId,
          fareId,
          description,
          reportingPoint,
          reportingTo,
          reportingToPhone,
          plannedCheckInTime,
          plannedStartOdometer,
          destinationUrl,
          actualCheckInTime,
          actualStartOdometer,
          startOdometerPhotoUrl,
          actualCheckOutTime,
          actualEndOdometer,
          endOdometerPhotoUrl,
          remarks,
          status,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result || !result.value) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    const trip = mapTrip(result.value);
    res.json(trip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/trips/:id - Delete trip (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const result = await db.collection('trips').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
