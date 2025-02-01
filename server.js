import mongoose from "mongoose";
import dotenv from 'dotenv';
import app from "./app.js";

//config .env
dotenv.config();

const db = process.env.DB_STRING.replace("<db_password>", process.env.DB_PASSWORD);
mongoose.connect(db).then((connection) => {
  console.log("Database connected successfully");
  app.listen(3000, () => {
    console.log("Connected");
  });
});
