export default class NodeError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.isAppError = true
  }
}

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
    sendErrorProd(err, res)
  }
};
