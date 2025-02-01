import express from "express";
import morgan from "morgan"
// import tourRouter from "./routes/tour-routes";
import tourRouter from "./routes/tour-routes.js"

//create express app
const app = express();

//middleware
app.use(morgan("dev"))
app.use(express.json());


app.use("/api/v1/tours", tourRouter)

export default app