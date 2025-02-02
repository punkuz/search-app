import { Schema, model } from "mongoose";
import validator from "validator"

const tourSchema = Schema(
  {
    name: {
      type: String,
      trim: true,
      requuired: [true, "Pls enter name"],
      unique: true,
      maxlength: [40, "A tour name must have less or equal than 40 characters"],
      minlength: [10, "A tour name must have more or equal than 10 characters"],
      // validate: [validator.isAlpha, "A tour name must contain only characters"]
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
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: Number,
    ratingsQuantity: Number,
    summary: { type: String, trim: true },
    description: { type: String, trim: true },
    imageCover: { type: String, required: [true, "pls add a image cover"] },
    images: [String],
    startDates: [],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});
const Tour = model("Tour", tourSchema);

export default Tour;
