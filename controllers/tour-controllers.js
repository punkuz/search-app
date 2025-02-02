import { StatusCodes } from "../constants/status-codes.js";
import NodeError from "../extra/node-error.js";
import Tour from "../models/tour-model.js";
import { asyncHandler } from "../utils/async-handler.js";
import SearchFilter from "../utils/search-filter.js";

export const createTour = asyncHandler(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(StatusCodes.CREATED).json({
    state: "successful",
    data: {
      tour,
    },
  });
});

export const getAllTours = asyncHandler(async (req, res, next) => {
  //execute query
  const searchQuery = new SearchFilter(Tour.find(), req.query)
    .filter()
    .sort()
    .fields()
    .paginate();

  const tours = await searchQuery.mongooseQuery;

  //send response
  res.status(StatusCodes.OK).json({
    state: "successful",
    data: {
      total: tours.length,
      tours,
    },
  });
});

export const getTour = asyncHandler(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  //Tour.findOne({_id: req.params.id})
  if (!tour) {
    throw new NodeError(404, "Tour not found");
  }
  res.status(StatusCodes.OK).json({
    state: "successful",
    data: {
      tour,
    },
  });
});

export const updateTour = asyncHandler(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    throw new NodeError(404, "Tour not found");
  }
  res.status(StatusCodes.OK).json({
    state: "successful",
    data: {
      updatedTour,
    },
  });
});

export const deleteTour = asyncHandler(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    throw new NodeError(404, "Tour not found");
  }
  res.status(StatusCodes.OK).json({
    state: "successful",
  });
});

export const getStat = asyncHandler(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
      },
    },
    {
      $sort: { avgRating: 1 },
    },
  ]);
  res.status(StatusCodes.OK).json({
    state: "successful",
    data: {
      stats,
    },
  });
});
