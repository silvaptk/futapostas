import { Collection, Db, MongoClient } from 'mongodb';

const createProfileCollectionIndexes = async (collection: Collection) => {
  await collection.createIndex({
    name: 'text',
  });
};

export default async (dbName = 'CEIP'): Promise<Db | undefined> => {
  const url = process.env.MONGO_URL || 'mongodb://db:27017/';
  const profileCollectionName =
    process.env.MONGO_PROFILE_COLLECTION || 'profiles';
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log('Database connected');
    const db = client.db(dbName);
    await createProfileCollectionIndexes(db.collection(profileCollectionName));
    return db;
  } catch (e) {
    console.log((e as Error).message);
  }
};