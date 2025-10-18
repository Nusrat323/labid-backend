// backend/index.js
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

// ✅ CORS setup
const allowedOrigins = [
  "https://labidkhan.netlify.app", // your Netlify frontend
  "http://localhost:5173"           // local development
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// MongoDB setup
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

// Inject db into requests
app.use(async (req, res, next) => {
  try {
    req.db = await connectDb();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// Routes
app.use("/api/photos", photoRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/lifestyle", lifestyleRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server if running locally
if (process.env.PORT) {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
}

export default app;
