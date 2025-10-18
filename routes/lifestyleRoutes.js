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

