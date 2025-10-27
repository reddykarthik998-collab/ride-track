import { Router, Request, Response } from 'express';
import getDatabase from '../database';
import { Customer } from '../types';

const router = Router();
const { ObjectId } = require('mongodb');

// GET /api/customers - Get all customers
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const customers = await db.collection('customers').find({ isDeleted: { $ne: true } }).sort({ name: 1 }).toArray();
    
    const result: Customer[] = customers.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      phone: doc.phone,
      email: doc.email,
      clientId: doc.clientId
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/customers - Create new customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone, email, clientId } = req.body;
    const db = getDatabase();
    
    const result = await db.collection('customers').insertOne({
      name,
      phone,
      email,
      clientId,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const customer: Customer = {
      id: result.insertedId.toString(),
      name,
      phone,
      email,
      clientId
    };
    
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, clientId } = req.body;
    const db = getDatabase();
    
    const result = await db.collection('customers').findOneAndUpdate(
      { _id: new ObjectId(id), isDeleted: { $ne: true } },
      { $set: { name, phone, email, clientId, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result || !result.value) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customer: Customer = {
      id: result.value._id.toString(),
      name: result.value.name,
      phone: result.value.phone,
      email: result.value.email,
      clientId: result.value.clientId
    };
    
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const result = await db.collection('customers').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
