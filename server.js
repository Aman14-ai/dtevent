import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectToDb } from "./config/db.js";
import  eventRoutes from "./routes/events.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/v3/app", eventRoutes);

// connect to db
connectToDb();

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}/api/v3/app`);
});
