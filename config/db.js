import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let dbConnection;

export const connectToDb = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("Mongodb uri is required.");
    throw new Error("Mongodb uri is required.");
  }
  const client = new MongoClient(uri);

  try {
    dbConnection = client.db("interndtevent");
    console.log("Db Connected Successfully.");
    return dbConnection;
  } catch (error) {
    console.log("Error connecting to database in catch block.", error);
  }
};

export const getDb = () => {
  if (!dbConnection) {
    connectToDb();
  }
  return dbConnection;
}
