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

// Middleware
app.use(cors());
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

// Middleware to inject db into req
app.use(async (req, res, next) => {
  req.db = await connectDb();
  next();
});

// Routes
app.use("/api/photos", photoRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/lifestyle", lifestyleRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;*/}




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

// ✅ CORS setup: allow your frontend URLs
const allowedOrigins = [
  "https://labidkhan.netlify.app", // Netlify frontend
  "http://localhost:5173",          // local dev
];

app.use(
  cors({
    origin: function (origin, callback) {
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

// Serve uploads folder
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

// Inject db into req
app.use(async (req, res, next) => {
  req.db = await connectDb();
  next();
});

// Routes
app.use("/api/photos", photoRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/lifestyle", lifestyleRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Vercel expects export default
export default app;

// Optional: for local testing
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
