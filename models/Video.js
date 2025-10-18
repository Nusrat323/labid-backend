



import { getDb } from "../index.js";

export const getVideoCollection = () => {
  const db = getDb();
  return db.collection("videos");
};

