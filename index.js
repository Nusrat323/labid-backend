import express from "express";
import cors from "cors";

const app = express();

// CORS
app.use(cors({ origin: "https://labidkhan.netlify.app" }));

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

export default app;
