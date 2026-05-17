import { Router, Request, Response } from 'express';
import getDatabase from '../database';
import { Event } from '../types';

const router = Router();
const { ObjectId } = require('mongodb');

// GET /api/events - Get all events
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const events = await db.collection('events').find({ isDeleted: { $ne: true } }).sort({ startDate: -1 }).toArray();
    
    const result: Event[] = events.map(doc => ({
      id: doc._id.toString(),
      eventId: doc.eventId,
      clientId: doc.clientId,
      name: doc.name,
      prefix: doc.prefix,
      startDate: doc.startDate,
      endDate: doc.endDate
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/events - Create new event
router.post('/', async (req: Request, res: Response) => {
  try {
    const { eventId, clientId, name, prefix, startDate, endDate } = req.body;
    const db = getDatabase();
    
    // Check if eventId already exists
    const existing = await db.collection('events').findOne({ eventId });
    if (existing) {
      return res.status(409).json({ error: 'Event with this ID already exists' });
    }
    
    const result = await db.collection('events').insertOne({
      eventId,
      clientId,
      name,
      prefix,
      startDate,
      endDate,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const event: Event = {
      id: result.insertedId.toString(),
      eventId,
      clientId,
      name,
      prefix,
      startDate,
      endDate
    };
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { eventId, clientId, name, prefix, startDate, endDate } = req.body;
    const db = getDatabase();
    
    const result = await db.collection('events').findOneAndUpdate(
      { _id: new ObjectId(id), isDeleted: { $ne: true } },
      { $set: { eventId, clientId, name, prefix, startDate, endDate, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result || !result.value) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event: Event = {
      id: result.value._id.toString(),
      eventId: result.value.eventId,
      clientId: result.value.clientId,
      name: result.value.name,
      prefix: result.value.prefix,
      startDate: result.value.startDate,
      endDate: result.value.endDate
    };
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/events/:id - Delete event (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const result = await db.collection('events').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
