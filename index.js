//works everything except video
{/*import express from "express";
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

// ✅ Middlewares
app.use(cors());
app.use(express.json({ limit: "500mb" })); // increase payload size for large videos
app.use(express.urlencoded({ limit: "500mb", extended: true }));

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

// ✅ Middleware to attach db to request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ✅ Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ Helper: Upload buffer to Cloudinary
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

// ✅ Root
app.get("/", (req, res) => {
  res.send("Backend running on Vercel with MongoDB & Cloudinary!");
});

// ✅ Export for Vercel
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

// ✅ CORS: Allow frontend origin
const allowedOrigins = ["https://labidkhan.netlify.app"]; // your frontend
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// ✅ JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ✅ Attach db to request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ✅ Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ Helper: Upload buffer to Cloudinary
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

// ✅ Root
app.get("/", (req, res) => {
  res.send("Backend running on Vercel with MongoDB & Cloudinary!");
});

// ✅ Export for Vercel
export default app;











