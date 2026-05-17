import { Router, Request, Response } from 'express';
import getDatabase from '../database';
import { Fare } from '../types';

const router = Router();
const { ObjectId } = require('mongodb');

// GET /api/fares - Get all fares
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const fares = await db.collection('fares').find({ isActive: true }).sort({ name: 1 }).toArray();
    
    const result: Fare[] = fares.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      type: doc.type,
      baseFare: doc.baseFare,
      perKmCharge: doc.perKmCharge,
      perHourCharge: doc.perHourCharge
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching fares:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/fares - Create new fare
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, baseFare, perKmCharge, perHourCharge } = req.body;
    const db = getDatabase();
    
    const result = await db.collection('fares').insertOne({
      name,
      type,
      baseFare,
      perKmCharge,
      perHourCharge,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const fare: Fare = {
      id: result.insertedId.toString(),
      name,
      type,
      baseFare,
      perKmCharge,
      perHourCharge
    };
    
    res.status(201).json(fare);
  } catch (error) {
    console.error('Error creating fare:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/fares/:id - Update fare
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, baseFare, perKmCharge, perHourCharge } = req.body;
    const db = getDatabase();
    
    const result = await db.collection('fares').findOneAndUpdate(
      { _id: new ObjectId(id), isActive: true },
      { $set: { name, type, baseFare, perKmCharge, perHourCharge, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result || !result.value) {
      return res.status(404).json({ error: 'Fare not found' });
    }
    
    const fare: Fare = {
      id: result.value._id.toString(),
      name: result.value.name,
      type: result.value.type,
      baseFare: result.value.baseFare,
      perKmCharge: result.value.perKmCharge,
      perHourCharge: result.value.perHourCharge
    };
    
    res.json(fare);
  } catch (error) {
    console.error('Error updating fare:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/fares/:id - Delete fare (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const result = await db.collection('fares').updateOne(
      { _id: new ObjectId(id), isActive: true },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Fare not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting fare:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
