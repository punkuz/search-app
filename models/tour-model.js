import { Schema, model } from "mongoose";

const tourSchema = Schema(
  {
    name: {
      type: String,
      trim: true,
      requuired: [true, "Pls enter name"],
      unique: true,
    },
    image: String,
    rating: {
      type: Number,
      requuired: [true, "pls enter rating"],
    },
    price: {
      type: Number,
      required: [true, "Pls enter price"],
    },
    duration: Number,
    maxGroupSize: Number,
    difficulty: String,
    ratingsAverage: Number,
    ratingsQuantity: Number,
    summary: { type: String, trim: true },
    description: { type: String, trim: true },
    imageCover: { type: String, required: [true, "pls add a image cover"] },
    images: [String],
    startDates: [],
  },
  { timestamps: true }
);

const Tour = model("Tour", tourSchema);

export default Tour;
