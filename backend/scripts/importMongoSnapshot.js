const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const { EJSON } = require('bson');

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

  const inputDirArg = process.argv[2];
  if (!inputDirArg) {
    throw new Error('Usage: node scripts/importMongoSnapshot.js <snapshot-folder-path>');
  }

  const snapshotDir = path.resolve(inputDirArg);
  if (!fs.existsSync(snapshotDir)) {
    throw new Error(`Snapshot folder not found: ${snapshotDir}`);
  }

  const files = fs
    .readdirSync(snapshotDir)
    .filter((f) => f.endsWith('.json') && f !== 'summary.json');

  if (files.length === 0) {
    throw new Error(`No collection JSON files found in: ${snapshotDir}`);
  }

  const dbName = getDbNameFromUri(uri);
  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(dbName);
    console.log(`Importing into database: ${dbName}`);

    for (const file of files) {
      const collectionName = path.basename(file, '.json');
      const fullPath = path.join(snapshotDir, file);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const docs = EJSON.parse(raw);

      if (!Array.isArray(docs)) {
        throw new Error(`Expected array in ${file}`);
      }

      await db.collection(collectionName).deleteMany({});
      if (docs.length > 0) {
        await db.collection(collectionName).insertMany(docs, { ordered: false });
      }

      console.log(`Imported ${collectionName}: ${docs.length} documents`);
    }

    console.log('Mongo snapshot import completed successfully.');
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('Import failed:', error.message || error);
  process.exit(1);
});
