const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

function getDbNameFromUri(uri) {
  try {
    const parsed = new URL(uri);
    const dbName = (parsed.pathname || '').replace('/', '').trim();
    return dbName || 'ridetrack';
  } catch {
    return 'ridetrack';
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is missing in backend/.env');
  }

  const dbName = getDbNameFromUri(uri);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupRoot = path.resolve(__dirname, '..', 'db-backups', timestamp);

  fs.mkdirSync(backupRoot, { recursive: true });

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(dbName);
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();

    const summary = {
      exportedAt: new Date().toISOString(),
      dbName,
      collections: {},
    };

    for (const c of collections) {
      const collectionName = c.name;
      const docs = await db.collection(collectionName).find({}).toArray();
      const outPath = path.join(backupRoot, `${collectionName}.json`);
      fs.writeFileSync(outPath, JSON.stringify(docs, null, 2), 'utf8');
      summary.collections[collectionName] = docs.length;
      console.log(`Exported ${collectionName}: ${docs.length} documents`);
    }

    fs.writeFileSync(
      path.join(backupRoot, 'summary.json'),
      JSON.stringify(summary, null, 2),
      'utf8'
    );

    console.log(`Mongo snapshot completed at: ${backupRoot}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('Export failed:', error.message || error);
  process.exit(1);
});
