import { Router, Request, Response } from 'express';
import getDatabase, { getBucket } from '../database';
import { Trip } from '../types';
const { ObjectId } = require('mongodb');
import multer from 'multer';

const router = Router();
const upload = multer({
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

const toIsoString = (value: unknown): string | undefined => {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return undefined;
};

// Helper function to map MongoDB document to Trip object
const mapTrip = (doc: any): Trip => ({
  id: doc._id.toString(),
  tripNumber: doc.tripNumber,
  eventId: doc.eventId,
  clientId: doc.clientId,
  bookingClientName: doc.bookingClientName,
  driverId: doc.driverId,
  fareId: doc.fareId,
  dutySlipNumber: doc.dutySlipNumber,
  description: doc.description,
  customerName: doc.customerName,
  customerNumber: doc.customerNumber,
  plannedCheckInTime: toIsoString(doc.plannedCheckInTime) ?? doc.plannedCheckInTime,
  plannedCheckOutTime: toIsoString(doc.plannedCheckOutTime) ?? doc.plannedCheckOutTime,
  plannedStartOdometer: doc.plannedStartOdometer,
  plannedEndOdometer: doc.plannedEndOdometer,
  destinationUrl: doc.destinationUrl,
  actualCheckInTime: toIsoString(doc.actualCheckInTime),
  actualStartOdometer: doc.actualStartOdometer,
  startOdometerPhotoUrl: doc.startOdometerPhotoUrl,
  startOdometerPhotoId: doc.startOdometerPhotoId?.toString?.() || undefined,
  actualCheckOutTime: toIsoString(doc.actualCheckOutTime),
  actualEndOdometer: doc.actualEndOdometer,
  endOdometerPhotoUrl: doc.endOdometerPhotoUrl,
  endOdometerPhotoId: doc.endOdometerPhotoId?.toString?.() || undefined,
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
      dutySlipNumber,
      description,
      customerName,
      customerNumber,
      plannedCheckInTime,
      plannedCheckOutTime,
      plannedStartOdometer,
      plannedEndOdometer,
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
      dutySlipNumber,
      description,
      customerName,
      customerNumber,
      plannedCheckInTime,
      plannedCheckOutTime,
      plannedStartOdometer,
      plannedEndOdometer,
      destinationUrl,
      actualCheckInTime: null,
      actualStartOdometer: null,
      startOdometerPhotoUrl: null,
      startOdometerPhotoId: null,
      actualCheckOutTime: null,
      actualEndOdometer: null,
      endOdometerPhotoUrl: null,
      endOdometerPhotoId: null,
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
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid trip ID' });
    }
    
    const {
      tripNumber,
      eventId,
      clientId,
      bookingClientName,
      driverId,
      fareId,
      dutySlipNumber,
      description,
      customerName,
      customerNumber,
      plannedCheckInTime,
      plannedCheckOutTime,
      plannedStartOdometer,
      plannedEndOdometer,
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
    
    // Get current trip to check status
    const currentTrip = await db.collection('trips').findOne({ _id: new ObjectId(id), isDeleted: { $ne: true } });
    if (!currentTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Prevent status downgrades: COMPLETED cannot be modified
    if (currentTrip.status === 'COMPLETED' && status && status !== 'COMPLETED') {
      return res.status(409).json({ error: 'Completed trip cannot be modified' });
    }
    
    const updatePayload: Record<string, unknown> = { updatedAt: new Date() };
    const assign = (key: string, value: unknown) => {
      if (value !== undefined) updatePayload[key] = value;
    };

    assign('tripNumber', tripNumber);
    assign('eventId', eventId);
    assign('clientId', clientId);
    assign('bookingClientName', bookingClientName);
    assign('driverId', driverId);
    assign('fareId', fareId);
    assign('dutySlipNumber', dutySlipNumber);
    assign('description', description);
    assign('customerName', customerName);
    assign('customerNumber', customerNumber);
    assign('plannedCheckInTime', plannedCheckInTime);
    assign('plannedCheckOutTime', plannedCheckOutTime);
    assign('plannedStartOdometer', plannedStartOdometer);
    assign('plannedEndOdometer', plannedEndOdometer);
    assign('destinationUrl', destinationUrl);
    assign('actualCheckInTime', actualCheckInTime);
    assign('actualStartOdometer', actualStartOdometer);
    assign('startOdometerPhotoUrl', startOdometerPhotoUrl);
    assign('actualCheckOutTime', actualCheckOutTime);
    assign('actualEndOdometer', actualEndOdometer);
    assign('endOdometerPhotoUrl', endOdometerPhotoUrl);
    assign('remarks', remarks);
    assign('status', status);

    const updatedDoc = await db.collection('trips').findOneAndUpdate(
      { _id: new ObjectId(id), isDeleted: { $ne: true } },
      { $set: updatePayload },
      { returnDocument: 'after' }
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const trip = mapTrip(updatedDoc);
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
 
// --- Photo upload & retrieval ---

// helper to validate which photo type
const getFieldFromWhich = (which: 'start'|'end') => which === 'start' ? 'startOdometerPhotoId' : 'endOdometerPhotoId';

// Upload start photo
router.post('/:id/start-photo', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: 'Missing file' });
    const db = getDatabase();
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(`start-${id}-${Date.now()}`, { contentType: req.file.mimetype });
    uploadStream.end(req.file.buffer);
    uploadStream.on('error', (e) => res.status(500).json({ error: 'Upload failed' }));
    uploadStream.on('finish', async () => {
      await db.collection('trips').updateOne({ _id: new ObjectId(id) }, { $set: { startOdometerPhotoId: uploadStream.id, updatedAt: new Date() } });
      res.status(201).json({ id: uploadStream.id });
    });
  } catch (e) {
    console.error('Error uploading start photo:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload end photo
router.post('/:id/end-photo', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: 'Missing file' });
    const db = getDatabase();
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(`end-${id}-${Date.now()}`, { contentType: req.file.mimetype });
    uploadStream.end(req.file.buffer);
    uploadStream.on('error', (e) => res.status(500).json({ error: 'Upload failed' }));
    uploadStream.on('finish', async () => {
      await db.collection('trips').updateOne({ _id: new ObjectId(id) }, { $set: { endOdometerPhotoId: uploadStream.id, updatedAt: new Date() } });
      res.status(201).json({ id: uploadStream.id });
    });
  } catch (e) {
    console.error('Error uploading end photo:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stream photo
router.get('/:id/:whichPhoto(start|end)', async (req: Request, res: Response) => {
  try {
    const { id, whichPhoto } = req.params as { id: string; whichPhoto: 'start'|'end' };
    const db = getDatabase();
    const doc = await db.collection('trips').findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: 'Trip not found' });
    const field = getFieldFromWhich(whichPhoto);
    const fileId = doc[field];
    if (!fileId) return res.status(404).json({ error: 'Photo not found' });
    const bucket = getBucket();
    res.setHeader('Content-Type', 'image/jpeg');
    const stream = bucket.openDownloadStream(new ObjectId(fileId));
    stream.on('error', () => res.status(404).end());
    stream.pipe(res);
  } catch (e) {
    console.error('Error streaming photo:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});
