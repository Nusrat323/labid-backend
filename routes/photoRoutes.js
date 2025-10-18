
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getPhotoCollection } from "../models/Photo.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/photos";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Upload photo
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const photos = getPhotoCollection();
    const { category } = req.body;

    const newPhoto = {
      url: `/uploads/photos/${req.file.filename}`,
      category: category || "Uncategorized",
      createdAt: new Date(),
    };

    const result = await photos.insertOne(newPhoto);
    res.json({ ...newPhoto, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all photos
router.get("/", async (req, res) => {
  try {
    const photos = getPhotoCollection();
    const all = await photos.find().sort({ createdAt: -1 }).toArray();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete photo
router.delete("/:id", async (req, res) => {
  try {
    const photos = getPhotoCollection();
    const id = new ObjectId(req.params.id);
    const photo = await photos.findOne({ _id: id });
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const filePath = `.${photo.url}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await photos.deleteOne({ _id: id });
    res.json({ message: "Photo deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;



