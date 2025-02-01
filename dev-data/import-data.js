import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Tour from "./../models/tour-model.js";

//config .env
dotenv.config();

const db = process.env.DB_STRING.replace("<db_password>", process.env.DB_PASSWORD);
mongoose.connect(db).then((connection) => {
  console.log("Database connected successfully");
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//read jsopn
const tours = fs.readFileSync(path.resolve(__dirname, "tours-simple.json"), "utf8");
const importData = async () => {
  try {
    await Tour.create(JSON.parse(tours));
    console.log("Successfully data added");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const deleteAll = async () => {
  try {
    await Tour.deleteMany();
    console.log("deleted");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteAll()
}

