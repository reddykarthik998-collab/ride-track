import getDatabase from './database';
const { ObjectId } = require('mongodb');

const seedDatabase = async () => {
  try {
    const db = getDatabase();
    
    // Check if data already exists (check for non-user collections)
    const existingClients = await db.collection('clients').countDocuments({ isDeleted: { $ne: true } });
    if (existingClients > 0) {
      console.log('Database already has data - skipping seed');
      return;
    }
    
    console.log('Starting database seeding...');
    
    // Seed Clients
    const clientsData = [
      { name: 'Lupin', prefix: 'LUP' },
      { name: 'CCMB', prefix: 'CCMB' },
      { name: 'Aurobindo Pharma', prefix: 'AUR' },
      { name: 'General', prefix: 'GEN' }
    ];
    
    const clientResult = await db.collection('clients').insertMany(
      clientsData.map(client => ({
        ...client,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    
    const clients = Object.values(clientResult.insertedIds).map((id, index) => ({
      id: id.toString(),
      ...clientsData[index]
    }));
    
    console.log('✅ Seeded clients:', clients.length);
    
    // Seed Drivers
    const driversData = [
      { name: 'John Doe', phone: '9876543210', vehicleName: 'Toyota Cresta', vehicleLicensePlate: 'TS09AB1234' },
      { name: 'Jane Smith', phone: '9123456789', vehicleName: 'Maruti Dzire', vehicleLicensePlate: 'KA01EF9012' },
      { name: 'Peter Jones', phone: '9988776655', vehicleName: 'Toyota Innova', vehicleLicensePlate: 'AP07CD5678' }
    ];
    
    const driverResult = await db.collection('drivers').insertMany(
      driversData.map(driver => ({
        ...driver,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    
    const drivers = Object.values(driverResult.insertedIds);
    console.log('✅ Seeded drivers:', driversData.length);
    
    // Seed Customers
    await db.collection('customers').insertMany([
      { name: 'Mr. Sharma', phone: '9876543210', email: 'sharma@lupin.com', clientId: clients[0].id, isDeleted: false, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Dr. Rao', phone: '9123456780', email: 'rao@ccmb.res.in', clientId: clients[1].id, isDeleted: false, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Ms. Priya', phone: '9988776655', email: 'priya@lupin.com', clientId: clients[0].id, isDeleted: false, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Logistics Head', phone: '9555512345', email: null, clientId: clients[2].id, isDeleted: false, createdAt: new Date(), updatedAt: new Date() }
    ]);
    console.log('✅ Seeded customers');
    
    // Seed Fares
    const faresData = [
      { name: 'Standard Local', type: 'LOCAL', baseFare: 100.00, perKmCharge: 12.00, perHourCharge: 50.00 },
      { name: 'Standard Outstation', type: 'OUTSTATION', baseFare: 2500.00, perKmCharge: 15.00, perHourCharge: 0.00 },
      { name: 'Premium Local', type: 'LOCAL', baseFare: 150.00, perKmCharge: 18.00, perHourCharge: 75.00 }
    ];
    
    const fareResult = await db.collection('fares').insertMany(
      faresData.map(fare => ({
        ...fare,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    
    const fares = Object.values(fareResult.insertedIds);
    console.log('✅ Seeded fares:', faresData.length);
    
    // Seed Events
    const eventsData = [
      { eventId: 'LUP_CONF-001', clientId: clients[0].id, name: 'Annual Conference 2024', prefix: 'CONF', startDate: new Date('2024-07-28'), endDate: new Date('2024-07-29') },
      { eventId: 'CCMB_SYM-001', clientId: clients[1].id, name: 'Research Symposium', prefix: 'SYM', startDate: new Date('2024-07-29'), endDate: new Date('2024-07-29') },
      { eventId: 'AUR_LOG-001', clientId: clients[2].id, name: 'Logistics Meetup', prefix: 'LOG', startDate: new Date('2024-07-27'), endDate: new Date('2024-07-27') }
    ];
    
    const eventResult = await db.collection('events').insertMany(
      eventsData.map(event => ({
        ...event,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
    
    const events = Object.values(eventResult.insertedIds);
    console.log('✅ Seeded events:', eventsData.length);
    
    // Seed Trips
    await db.collection('trips').insertMany([
      {
        tripNumber: 'LUP00001',
        eventId: events[0].toString(),
        clientId: clients[0].id,
        bookingClientName: 'Lupin R&D',
        driverId: drivers[0].toString(),
        fareId: fares[0].toString(),
        description: null,
        customerName: 'Mr. Sharma',
        customerNumber: '9876543210',
        plannedCheckInTime: new Date('2024-07-28T08:00:00'),
        plannedStartOdometer: 15000,
        destinationUrl: 'https://maps.app.goo.gl/9q5xZ6f2Y7z3E7r1A',
        actualCheckInTime: null,
        actualStartOdometer: null,
        startOdometerPhotoUrl: null,
        actualCheckOutTime: null,
        actualEndOdometer: null,
        endOdometerPhotoUrl: null,
        remarks: null,
        status: 'ASSIGNED',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tripNumber: 'CCMB00001',
        eventId: events[1].toString(),
        clientId: clients[1].id,
        bookingClientName: 'CCMB Main Office',
        driverId: drivers[2].toString(),
        fareId: fares[1].toString(),
        description: null,
        customerName: 'Dr. Rao',
        customerNumber: '9123456780',
        plannedCheckInTime: new Date('2024-07-29T10:00:00'),
        plannedStartOdometer: 85000,
        destinationUrl: null,
        actualCheckInTime: null,
        actualStartOdometer: null,
        startOdometerPhotoUrl: null,
        actualCheckOutTime: null,
        actualEndOdometer: null,
        endOdometerPhotoUrl: null,
        remarks: null,
        status: 'ASSIGNED',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tripNumber: 'LUP00002',
        eventId: events[0].toString(),
        clientId: clients[0].id,
        bookingClientName: 'Lupin Marketing',
        driverId: drivers[1].toString(),
        fareId: fares[0].toString(),
        description: null,
        customerName: 'Ms. Priya',
        customerNumber: '9988776655',
        plannedCheckInTime: new Date('2024-07-28T09:00:00'),
        plannedStartOdometer: 55120,
        destinationUrl: 'https://maps.app.goo.gl/1tH8gY5Z9sW6f4uTA',
        actualCheckInTime: new Date('2024-07-28T09:05:00'),
        actualStartOdometer: 55123,
        startOdometerPhotoUrl: 'https://via.placeholder.com/400x200.png?text=Start+Odometer',
        actualCheckOutTime: null,
        actualEndOdometer: null,
        endOdometerPhotoUrl: null,
        remarks: null,
        status: 'IN_PROGRESS',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tripNumber: 'AUR00001',
        eventId: events[2].toString(),
        clientId: clients[2].id,
        bookingClientName: 'Others',
        driverId: drivers[0].toString(),
        fareId: fares[0].toString(),
        description: null,
        customerName: 'Logistics Head',
        customerNumber: '9555512345',
        plannedCheckInTime: new Date('2024-07-27T10:00:00'),
        plannedStartOdometer: 12340,
        destinationUrl: null,
        actualCheckInTime: new Date('2024-07-27T10:00:00'),
        actualStartOdometer: 12345,
        startOdometerPhotoUrl: 'https://via.placeholder.com/400x200.png?text=Start+Odometer',
        actualCheckOutTime: new Date('2024-07-27T18:30:00'),
        actualEndOdometer: 12450,
        endOdometerPhotoUrl: 'https://via.placeholder.com/400x200.png?text=End+Odometer',
        remarks: 'Client meeting ran late.',
        status: 'COMPLETED',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tripNumber: 'CCMB00002',
        eventId: events[1].toString(),
        clientId: clients[1].id,
        bookingClientName: 'Future Event Guest',
        driverId: drivers[1].toString(),
        fareId: fares[1].toString(),
        description: null,
        customerName: 'Mr. Tomorrow',
        customerNumber: '9876543211',
        plannedCheckInTime: new Date('2025-10-18T11:59:00'),
        plannedStartOdometer: 90000,
        destinationUrl: null,
        actualCheckInTime: null,
        actualStartOdometer: null,
        startOdometerPhotoUrl: null,
        actualCheckOutTime: null,
        actualEndOdometer: null,
        endOdometerPhotoUrl: null,
        remarks: null,
        status: 'ASSIGNED',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log('✅ Seeded trips');
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Clients: ${clientsData.length}`);
    console.log(`   - Drivers: ${driversData.length}`);
    console.log(`   - Customers: 4`);
    console.log(`   - Fares: ${faresData.length}`);
    console.log(`   - Events: ${eventsData.length}`);
    console.log('   - Trips: 5');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

export default seedDatabase;

