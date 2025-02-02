import { Router } from "express";
import {
  createTour,
  deleteTour,
  getAllTours,
  getStat,
  getTour,
  updateTour,
} from "../controllers/tour-controllers.js";

const router = Router();

router.route("/tour-stats").get(getStat)

router.route("/").post(createTour).get(getAllTours);

router.route("/:id").get(getTour).put(updateTour).delete(deleteTour);

export default router;
