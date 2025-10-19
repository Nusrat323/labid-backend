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
{/*import express from "express";
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
export default serverless(app);*/}



// index.js cloudinary 
{/*import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

dotenv.config();

const app = express();

// ----- CORS -----
app.use(
  cors({
    origin: "https://labidkhan.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.options("*", cors());

// ----- Middleware -----
app.use(express.json());

// ----- MongoDB Setup -----
let cachedDb = null;
const connectDb = async () => {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedDb = client.db("mediaDB");
  console.log("✅ MongoDB connected");
  return cachedDb;
};

// Inject DB into requests
app.use(async (req, res, next) => {
  try {
    req.db = await connectDb();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection error" });
  }
});

// ----- Cloudinary Setup -----
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ----- Multer Setup -----
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ----- Helper: Upload to Cloudinary -----
const uploadToCloudinary = async (buffer, folder, resource_type = "auto") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

// ----- Collections -----
const getPhotoCollection = (db) => db.collection("photos");
const getVideoCollection = (db) => db.collection("videos");
const getLifestyleCollection = (db) => db.collection("lifestyle");

// ----- Test route -----
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});


// ----- PHOTO ROUTES -----
app.get("/api/photos", async (req, res) => {
  try {
    const photos = await getPhotoCollection(req.db).find({}).sort({ createdAt: -1 }).toArray();
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/photos/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await uploadToCloudinary(req.file.buffer, "photos", "image");
    const doc = {
      url: result.secure_url,
      category: req.body.category || "All",
      createdAt: new Date(),
    };
    const inserted = await getPhotoCollection(req.db).insertOne(doc);
    res.json({ _id: inserted.insertedId, ...doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Photo upload failed" });
  }
});

app.delete("/api/photos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await getPhotoCollection(req.db).deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Photo deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ----- VIDEO ROUTES -----
app.get("/api/videos", async (req, res) => {
  try {
    const videos = await getVideoCollection(req.db).find({}).sort({ createdAt: -1 }).toArray();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post(
  "/api/videos/upload",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files.file) return res.status(400).json({ message: "No video uploaded" });

      const videoResult = await uploadToCloudinary(req.files.file[0].buffer, "videos", "video");

      let thumbnailUrl = null;
      if (req.files.thumbnail) {
        const thumbResult = await uploadToCloudinary(req.files.thumbnail[0].buffer, "videos", "image");
        thumbnailUrl = thumbResult.secure_url;
      }

      const doc = {
        url: videoResult.secure_url,
        thumbnailUrl,
        category: req.body.category || "All",
        createdAt: new Date(),
      };

      const inserted = await getVideoCollection(req.db).insertOne(doc);
      res.json({ _id: inserted.insertedId, ...doc });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Video upload failed" });
    }
  }
);

app.delete("/api/videos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await getVideoCollection(req.db).deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Video deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ----- LIFESTYLE ROUTES -----
app.get("/api/lifestyle", async (req, res) => {
  try {
    const items = await getLifestyleCollection(req.db).find({}).sort({ createdAt: -1 }).toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/lifestyle/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await uploadToCloudinary(req.file.buffer, "lifestyle", "image");
    const doc = {
      url: result.secure_url,
      category: req.body.category || "All",
      createdAt: new Date(),
    };
    const inserted = await getLifestyleCollection(req.db).insertOne(doc);
    res.json({ _id: inserted.insertedId, ...doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lifestyle upload failed" });
  }
});

app.delete("/api/lifestyle/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await getLifestyleCollection(req.db).deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Lifestyle item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----- 404 handler -----
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ----- Export serverless function -----
export default serverless(app);*/}


//works without adding routes
{/*import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient } from "mongodb";

dotenv.config({ path: "./.env" }); // make sure it reads your local .env

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
let db;

const connectDB = async () => {
  try {
    // Use your variable name from .env (MONGODB_URI)
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db(process.env.DB_NAME || "mediaDB");
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
};

connectDB();

// ✅ Example route
app.get("/", (req, res) => {
  res.send("Backend running on Vercel using native MongoDB!");
});

// ✅ Export app for Vercel (no app.listen)
export default app;*/}





import express from "express";
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

export default app;








