import { MongoClient, Db } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  const client = new MongoClient(uri);
  return client.connect();
}

let clientPromise: Promise<MongoClient> | null = null;

function getOrCreateClient(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = getClientPromise();
  }
  return clientPromise;
}

const DEFAULT_DB_NAME = "task-manager";

export async function getDb(): Promise<Db> {
  const client = await getOrCreateClient();
  const dbName = process.env.MONGODB_DB_NAME || DEFAULT_DB_NAME;
  return client.db(dbName);
}
