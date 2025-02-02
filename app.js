import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet"
import tourRouter from "./routes/tour-routes.js"
import NodeError, { ErrorHandler } from "./extra/node-error.js";
import { StatusCodes } from "./constants/status-codes.js";

//create express app
const app = express();

app.set('trust proxy', true);

// 1) MIDDLEWARES
let corsOptions = {
  origin: [
    'http://localhost:3000',
  ],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
//Set Cors
app.use(cors(corsOptions));

//Set security HTTP headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//middleware
app.use(express.json());

app.use("/api/v1/tours", tourRouter)

app.all('*', (req, res, next) => {
  next(new NodeError(StatusCodes.NOT_FOUND, "The page you are looking, doesn't exist"));
});

app.use(ErrorHandler)

export default app