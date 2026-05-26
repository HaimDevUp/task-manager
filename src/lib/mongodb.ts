import { MongoClient, Db } from "mongodb";

const DEFAULT_DB_NAME = "task-manager";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  return uri;
}

/** חיבור אחד משותף — חובה ב-Vercel (serverless) ובפיתוח */
function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(getMongoUri());
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  const dbName = (process.env.MONGODB_DB_NAME || DEFAULT_DB_NAME).trim();
  return client.db(dbName);
}
