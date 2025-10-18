

{/*import { getDb } from "../index.js";

export const getPhotoCollection = () => {
  const db = getDb();
  return db.collection("photos");
};*/}


export const getPhotoCollection = (db) => db.collection("photos");


