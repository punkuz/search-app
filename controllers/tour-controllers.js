import { StatusCodes } from "../constants/status-codes.js";
import NodeError from "../extra/node-error.js";
import Tour from "../models/tour-model.js";
import SearchFilter from "../utils/search-filter.js";

export const createTour = async (req, res, next) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(StatusCodes.CREATED).json({
      state: "successful",
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(500).json({
      state: "fail",
      message: error,
    });
  }
};

export const getAllTours = async (req, res, next) => {
  try {
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
  } catch (error) {
    console.log("err", error);

    res.status(error.code || 500).json({
      state: "fail",
      message: error.message || error,
    });
  }
};

export const getTour = async (req, res, next) => {
  try {
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
  } catch (error) {
    res.status(error.code).json({
      state: "fail",
      message: error.message,
    });
  }
};

export const updateTour = async (req, res, next) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(StatusCodes.OK).json({
      state: "successful",
      data: {
        updatedTour,
      },
    });
  } catch (error) {
    res.status(error.code).json({
      state: "fail",
      message: error,
    });
  }
};

export const deleteTour = async (req, res, next) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(StatusCodes.OK).json({
      state: "successful",
    });
  } catch (error) {
    res.status(error.code).json({
      state: "fail",
      message: error,
    });
  }
};
