import { Collection, Document, MongoClient } from 'mongodb';

// Database Name

export let users: Collection<Document>;

export async function connectToDatabase() {
  const databaseName = 'knobel';

  const client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();

  console.log('✔️', 'Connected to database');
  const db = client.db(databaseName);
  users = db.collection('users');
}
