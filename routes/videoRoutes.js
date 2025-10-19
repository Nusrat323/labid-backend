import express from "express";
import multer from "multer";
import { ObjectId } from "mongodb";
import { getVideoCollection } from "../models/Video.js";
import { uploadToCloudinary, cloudinary } from "../index.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Upload video + optional thumbnail
router.post(
  "/upload",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const db = req.db;
      const videos = getVideoCollection(db);
      const { category } = req.body;

      if (!req.files?.file) return res.status(400).json({ message: "Video file required" });

      const videoFile = req.files.file[0];
      const thumbnailFile = req.files.thumbnail?.[0];

      const videoResult = await uploadToCloudinary(videoFile.buffer, "videos");
      const thumbnailResult = thumbnailFile
        ? await uploadToCloudinary(thumbnailFile.buffer, "thumbnails")
        : null;

      const newVideo = {
        url: videoResult.secure_url,
        public_id: videoResult.public_id,
        thumbnailUrl: thumbnailResult ? thumbnailResult.secure_url : null,
        thumbnail_public_id: thumbnailResult ? thumbnailResult.public_id : null,
        category: category || "Uncategorized",
        createdAt: new Date(),
      };

      const dbResult = await videos.insertOne(newVideo);
      res.status(201).json({ ...newVideo, _id: dbResult.insertedId });
    } catch (err) {
      console.error("Video upload failed:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ✅ Get all videos
router.get("/", async (req, res) => {
  try {
    const db = req.db;
    const videos = getVideoCollection(db);
    const all = await videos.find().sort({ createdAt: -1 }).toArray();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete video
router.delete("/:id", async (req, res) => {
  try {
    const db = req.db;
    const videos = getVideoCollection(db);
    const id = new ObjectId(req.params.id);
    const video = await videos.findOne({ _id: id });
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.public_id) await cloudinary.uploader.destroy(video.public_id);
    if (video.thumbnail_public_id) await cloudinary.uploader.destroy(video.thumbnail_public_id);

    await videos.deleteOne({ _id: id });
    res.json({ message: "Video deleted" });
  } catch (err) {
    console.error("Video delete failed:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;




