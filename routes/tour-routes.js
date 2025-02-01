import { Router } from "express";
import {
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
} from "../controllers/tour-controllers.js";

const router = Router();

router.route("/").post(createTour).get(getAllTours);

router.route("/:id").get(getTour).put(updateTour).delete(deleteTour);

export default router;
