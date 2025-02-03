export default class NodeError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.isAppError = true
  }
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new NodeError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new NodeError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new NodeError(400, message);
};

const handleJWTError = () =>
  new NodeError(401, 'Invalid session. Please log in again!');

const handleJWTExpiredError = () =>
  new NodeError(401, 'Your session has expired! Please log in again.');

const sendErrorDev = (err, res) => {
  res.status(err.code || 500).json({
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  console.log("err", err);
  
  if (err.isAppError) {
    res.status(err.code).json({
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    //console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      state: 'Fail',
      message: 'Something went very wrong!',
    });
  }
};

export const ErrorHandler = (err, req, res, next) => {
  if(process.env.NODE_ENV === 'development'){
    sendErrorDev(err, res)
  } else {
    let error = { ...err, message: err.message };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res)
  }
};
