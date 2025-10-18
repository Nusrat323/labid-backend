import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import photoRoutes from "./routes/photoRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import lifestyleRoutes from "./routes/lifestyleRoutes.js";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();

// ----- CORS Setup -----
const corsOptions = {
  origin: "https://labidkhan.netlify.app", // your frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true, // if you need cookies or auth headers
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight requests

// ----- Middleware -----
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ----- MongoDB Setup -----
const MONGODB_URI = process.env.MONGODB_URI;

let cachedDb = null;
const connectDb = async () => {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedDb = client.db("mediaDB");
  console.log("✅ MongoDB connected");
  return cachedDb;
};

// Middleware to inject db into req
app.use(async (req, res, next) => {
  req.db = await connectDb();
  next();
});

// ----- Routes -----
app.use("/api/photos", photoRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/lifestyle", lifestyleRoutes);

// ----- 404 Handler -----
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ----- Export for Vercel Serverless -----
export default app;

