import { Router, Request, Response } from 'express';
import getDatabase from '../database';
import { Client } from '../types';

const router = Router();

// GET /api/clients - Get all clients
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const clients = await db.collection('clients').find().sort({ name: 1 }).toArray();
    
    const result: Client[] = clients.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      prefix: doc.prefix
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/clients - Create new client
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, prefix } = req.body;
    const db = getDatabase();
    
    // Check if prefix already exists
    const existing = await db.collection('clients').findOne({ prefix });
    if (existing) {
      return res.status(409).json({ error: 'Client with this prefix already exists' });
    }
    
    const result = await db.collection('clients').insertOne({
      name,
      prefix,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const client: Client = {
      id: result.insertedId.toString(),
      name,
      prefix
    };
    
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, prefix } = req.body;
    const db = getDatabase();
    
    const { ObjectId } = require('mongodb');
    const result = await db.collection('clients').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name, prefix, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result || !result.value) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    const client: Client = {
      id: result.value._id.toString(),
      name: result.value.name,
      prefix: result.value.prefix
    };
    
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/clients/:id - Delete client (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const { ObjectId } = require('mongodb');
    
    const result = await db.collection('clients').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
