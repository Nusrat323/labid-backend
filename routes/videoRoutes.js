{/*import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getVideoCollection } from "../models/Video.js";
import { ObjectId } from "mongodb";

const router = express.Router();



// Storage for videos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/videos";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-video" + path.extname(file.originalname));
  },
});

// Storage for thumbnails
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/thumbnails";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-thumb" + path.extname(file.originalname));
  },
});

// Custom storage selector for videos and thumbnails
const upload = multer({
  storage: (req, file, cb) => {
    if (file.fieldname === "file") {
      videoStorage.getDestination(req, file, (err, dest) => {
        if (err) return cb(err);
        videoStorage.getFilename(req, file, (err2, filename) => {
          if (err2) return cb(err2);
          cb(null, path.join(dest, filename));
        });
      });
    } else if (file.fieldname === "thumbnail") {
      thumbnailStorage.getDestination(req, file, (err, dest) => {
        if (err) return cb(err);
        thumbnailStorage.getFilename(req, file, (err2, filename) => {
          if (err2) return cb(err2);
          cb(null, path.join(dest, filename));
        });
      });
    }
  },
});



// ✅ Upload video + optional thumbnail
router.post(
  "/upload",
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        let dir;
        if (file.fieldname === "file") dir = "uploads/videos";
        else if (file.fieldname === "thumbnail") dir = "uploads/thumbnails";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const suffix = file.fieldname === "file" ? "-video" : "-thumb";
        cb(null, Date.now() + suffix + path.extname(file.originalname));
      },
    }),
  }).fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const videos = getVideoCollection();
      const { category } = req.body;

      // Validate required fields
      if (!req.files?.file)
        return res.status(400).json({ message: "Video file is required" });

      const videoFile = req.files.file[0];
      const thumbnailFile = req.files.thumbnail?.[0];

      const newVideo = {
        url: `/uploads/videos/${videoFile.filename}`,
        thumbnailUrl: thumbnailFile
          ? `/uploads/thumbnails/${thumbnailFile.filename}`
          : null,
        category: category || "Uncategorized",
        createdAt: new Date(),
      };

      const result = await videos.insertOne(newVideo);
      res.json({ ...newVideo, _id: result.insertedId });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ✅ Get all videos
router.get("/", async (req, res) => {
  try {
    const videos = getVideoCollection();
    const all = await videos.find().sort({ createdAt: -1 }).toArray();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete video
router.delete("/:id", async (req, res) => {
  try {
    const videos = getVideoCollection();
    const id = new ObjectId(req.params.id);
    const video = await videos.findOne({ _id: id });
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Remove files from server
    const videoPath = `.${video.url}`;
    const thumbPath = video.thumbnailUrl ? `.${video.thumbnailUrl}` : null;

    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (thumbPath && fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

    await videos.deleteOne({ _id: id });
    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;*/}




import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { getVideoCollection } from "../models/Video.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Multer storage for videos & thumbnails
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === "file" ? "uploads/videos" : "uploads/thumbnails";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const suffix = file.fieldname === "file" ? "-video" : "-thumb";
    cb(null, Date.now() + suffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Upload video + optional thumbnail
router.post("/upload", upload.fields([
  { name: "file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 }
]), async (req, res) => {
  try {
    const db = req.db;
    const videos = getVideoCollection(db);
    const { category } = req.body;

    if (!req.files?.file) return res.status(400).json({ message: "Video file required" });

    const videoFile = req.files.file[0];
    const thumbnailFile = req.files.thumbnail?.[0];

    const newVideo = {
      url: `/uploads/videos/${videoFile.filename}`,
      thumbnailUrl: thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : null,
      category: category || "Uncategorized",
      createdAt: new Date(),
    };

    const result = await videos.insertOne(newVideo);
    res.status(201).json({ ...newVideo, _id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get all videos
router.get("/", async (req, res) => {
  try {
    const db = req.db;
    const videos = getVideoCollection(db);
    const all = await videos.find().sort({ createdAt: -1 }).toArray();
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Delete video
router.delete("/:id", async (req, res) => {
  try {
    const db = req.db;
    const videos = getVideoCollection(db);
    const id = new ObjectId(req.params.id);
    const video = await videos.findOne({ _id: id });
    if (!video) return res.status(404).json({ message: "Video not found" });

    const videoPath = `.${video.url}`;
    const thumbPath = video.thumbnailUrl ? `.${video.thumbnailUrl}` : null;
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (thumbPath && fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

    await videos.deleteOne({ _id: id });
    res.json({ message: "Video deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;





