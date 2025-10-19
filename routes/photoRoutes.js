



{/*import express from "express";
import multer from "multer";
import { ObjectId } from "mongodb";
import { getPhotoCollection } from "../models/Photo.js";
import { uploadToCloudinary } from "../index.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload photo
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const db = req.db;
    const photos = getPhotoCollection(db);
    const { category } = req.body;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const photoUrl = (await uploadToCloudinary(req.file.buffer, "photos")).secure_url;

    const newPhoto = {
      url: photoUrl,
      category: category || "Uncategorized",
      createdAt: new Date(),
    };

    const result = await photos.insertOne(newPhoto);
    res.status(201).json({ ...newPhoto, _id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get all photos
router.get("/", async (req, res) => {
  try {
    const db = req.db;
    const photos = getPhotoCollection(db);
    const all = await photos.find().sort({ createdAt: -1 }).toArray();
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Delete photo
router.delete("/:id", async (req, res) => {
  try {
    const db = req.db;
    const photos = getPhotoCollection(db);
    const id = new ObjectId(req.params.id);
    const photo = await photos.findOne({ _id: id });
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    if (photo.url) await cloudinary.uploader.destroy(photo.url.split("/").pop().split(".")[0]);

    await photos.deleteOne({ _id: id });
    res.json({ message: "Photo deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;*/}




import express from "express";
import multer from "multer";
import { ObjectId } from "mongodb";
import { getPhotoCollection } from "../models/Photo.js";
import { uploadToCloudinary, cloudinary } from "../index.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Upload photo
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const db = req.db;
    const photos = getPhotoCollection(db);
    const { category } = req.body;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await uploadToCloudinary(req.file.buffer, "photos");

    const newPhoto = {
      url: result.secure_url,
      public_id: result.public_id,
      category: category || "Uncategorized",
      createdAt: new Date(),
    };

    const dbResult = await photos.insertOne(newPhoto);
    res.status(201).json({ ...newPhoto, _id: dbResult.insertedId });
  } catch (err) {
    console.error("Photo upload failed:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get all photos
router.get("/", async (req, res) => {
  try {
    const db = req.db;
    const photos = getPhotoCollection(db);
    const all = await photos.find().sort({ createdAt: -1 }).toArray();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete photo
router.delete("/:id", async (req, res) => {
  try {
    const db = req.db;
    const photos = getPhotoCollection(db);
    const id = new ObjectId(req.params.id);
    const photo = await photos.findOne({ _id: id });

    if (!photo) return res.status(404).json({ message: "Photo not found" });

    if (photo.public_id) await cloudinary.uploader.destroy(photo.public_id);

    await photos.deleteOne({ _id: id });
    res.json({ message: "Photo deleted" });
  } catch (err) {
    console.error("Photo delete failed:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
