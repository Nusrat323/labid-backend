{/*import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getDb } from "../index.js";

const router = express.Router();

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/lifestyle";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

// Upload Lifestyle Media
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const db = getDb();
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const doc = {
      url: `/uploads/lifestyle/${file.filename}`,
      category: "Lifestyle",
      createdAt: new Date(),
    };

    const result = await db.collection("lifestyle").insertOne(doc);

    
    res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all Lifestyle media
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const media = await db
      .collection("lifestyle")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a Lifestyle media
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { ObjectId } = await import("mongodb");
    const media = await db
      .collection("lifestyle")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!media) return res.status(404).json({ message: "Not found" });

    fs.unlinkSync("." + media.url); 
    await db.collection("lifestyle").deleteOne({ _id: new ObjectId(req.params.id) });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;*/}



import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { getLifestyleCollection } from "../models/Lifestyle.js";
import { ObjectId } from "mongodb";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/lifestyle";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const db = req.db;
    const lifestyle = getLifestyleCollection(db);

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const newDoc = {
      url: `/uploads/lifestyle/${req.file.filename}`,
      category: "Lifestyle",
      createdAt: new Date(),
    };

    const result = await lifestyle.insertOne(newDoc);
    res.status(201).json({ _id: result.insertedId, ...newDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get all
router.get("/", async (req, res) => {
  try {
    const db = req.db;
    const lifestyle = getLifestyleCollection(db);
    const all = await lifestyle.find().sort({ createdAt: -1 }).toArray();
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const db = req.db;
    const lifestyle = getLifestyleCollection(db);
    const id = new ObjectId(req.params.id);
    const doc = await lifestyle.findOne({ _id: id });
    if (!doc) return res.status(404).json({ message: "Not found" });

    const filePath = `.${doc.url}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await lifestyle.deleteOne({ _id: id });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

