{/*import express from "express";
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

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});


// ----- Export for Vercel Serverless -----
export default app;*/}



// index.js
import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { MongoClient } from "mongodb";

// Import routes
import photoRoutes from "./routes/photoRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import lifestyleRoutes from "./routes/lifestyleRoutes.js";

dotenv.config();

const app = express();

// ----- CORS -----
app.use(
  cors({
    origin: "https://labidkhan.netlify.app", // your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.options("*", cors());

// ----- Middleware -----
app.use(express.json());

// ----- Static uploads (for local testing only) -----
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ----- MongoDB Setup -----
let cachedDb = null;

const connectDb = async () => {
  if (cachedDb) return cachedDb;

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    cachedDb = client.db("mediaDB"); // your database name
    console.log("✅ MongoDB connected");
    return cachedDb;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
};

// Inject DB into request
app.use(async (req, res, next) => {
  try {
    req.db = await connectDb();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection error" });
  }
});

// ----- Routes -----
app.use("/api/photos", photoRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/lifestyle", lifestyleRoutes);

// ----- Test route -----
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// ----- 404 handler -----
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ----- Export serverless function for Vercel -----
export default serverless(app);
