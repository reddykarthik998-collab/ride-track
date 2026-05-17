import { Router, Request, Response } from 'express';
import getDatabase from '../database';
import { Driver } from '../types';

const router = Router();
const { ObjectId } = require('mongodb');

// GET /api/drivers - Get all drivers
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const drivers = await db.collection('drivers').find({ isActive: true }).sort({ name: 1 }).toArray();
    
    const result: Driver[] = drivers.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      phone: doc.phone,
      vehicleName: doc.vehicleName,
      vehicleLicensePlate: doc.vehicleLicensePlate
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/drivers/phone/:phone - Get driver by phone
router.get('/phone/:phone', async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    const db = getDatabase();
    
    const doc = await db.collection('drivers').findOne({ phone, isActive: true });
    
    if (!doc) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    const driver: Driver = {
      id: doc._id.toString(),
      name: doc.name,
      phone: doc.phone,
      vehicleName: doc.vehicleName,
      vehicleLicensePlate: doc.vehicleLicensePlate
    };
    
    res.json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/drivers - Create new driver
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone, vehicleName, vehicleLicensePlate } = req.body;
    const db = getDatabase();
    
    // Check if phone or license plate already exists
    const existing = await db.collection('drivers').findOne({ 
      $or: [{ phone }, { vehicleLicensePlate }] 
    });
    
    if (existing) {
      return res.status(409).json({ error: 'Driver with this phone or license plate already exists' });
    }
    
    const result = await db.collection('drivers').insertOne({
      name,
      phone,
      vehicleName,
      vehicleLicensePlate,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const driver: Driver = {
      id: result.insertedId.toString(),
      name,
      phone,
      vehicleName,
      vehicleLicensePlate
    };
    
    res.status(201).json(driver);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/drivers/:id - Update driver
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, vehicleName, vehicleLicensePlate } = req.body;
    const db = getDatabase();
    
    const result = await db.collection('drivers').findOneAndUpdate(
      { _id: new ObjectId(id), isActive: true },
      { $set: { name, phone, vehicleName, vehicleLicensePlate, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result || !result.value) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    const driver: Driver = {
      id: result.value._id.toString(),
      name: result.value.name,
      phone: result.value.phone,
      vehicleName: result.value.vehicleName,
      vehicleLicensePlate: result.value.vehicleLicensePlate
    };
    
    res.json(driver);
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/drivers/:id - Delete driver (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    // Check if driver has active trips
    const activeTrips = await db.collection('trips').countDocuments({
      driverId: id,
      status: { $in: ['ASSIGNED', 'IN_PROGRESS'] }
    });
    
    if (activeTrips > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete driver. They are assigned to active or upcoming trips.' 
      });
    }
    
    const result = await db.collection('drivers').updateOne(
      { _id: new ObjectId(id), isActive: true },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
