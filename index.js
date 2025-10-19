
{/*import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient } from "mongodb";
import videoRoutes from "./routes/videoRoutes.js";
import photoRoutes from "./routes/photoRoutes.js";
import lifestyleRoutes from "./routes/lifestyleRoutes.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config({ path: "./.env" });

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db(process.env.DB_NAME || "mediaDB");
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
};
await connectDB();

// Make db accessible in routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Helper to upload buffer to Cloudinary
import { Readable } from "stream";
export const uploadToCloudinary = (buffer, folder = "media") => {
  return new Promise((resolve, reject) => {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    readable.pipe(stream);
  });
};

// Routes
app.use("/api/videos", videoRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/lifestyle", lifestyleRoutes);

// Root
app.get("/", (req, res) => {
  res.send("Backend running on Vercel with MongoDB & Cloudinary Perfectly!");
});

export default app;*/}



import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient } from "mongodb";
import videoRoutes from "./routes/videoRoutes.js";
import photoRoutes from "./routes/photoRoutes.js";
import lifestyleRoutes from "./routes/lifestyleRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

dotenv.config({ path: "./.env" });

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
let db;
const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db(process.env.DB_NAME || "mediaDB");
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
};
await connectDB();

// ✅ Middleware to attach db to every request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ Helper: upload buffer to Cloudinary
export const uploadToCloudinary = (buffer, folder = "media") => {
  return new Promise((resolve, reject) => {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    readable.pipe(stream);
  });
};

export { cloudinary };

// ✅ Routes
app.use("/api/videos", videoRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/lifestyle", lifestyleRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Backend running on Vercel with MongoDB & Cloudinary Perfectly!");
});

// ✅ Export app for Vercel
export default app;









