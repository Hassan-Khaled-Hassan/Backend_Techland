const APIError = require("../Utils/apiError");

const SendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const SendErrorForProd = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

const handleJwtErrorSignature = () => new APIError("this token is invalid. please login again....",401);
const handleJwtErrorExpired = () =>
  new APIError("this token is expired. please login again....", 401);

const globalError = (err, req, res, next) => {
  // Log the error for debugging purposes
  console.log("error: ", err);

  // Set default status and status code if they aren't already set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Prevent further processing if the headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Send appropriate error response based on the environment
  if (process.env.NODE_ENV === "development") {
    return SendErrorForDev(err, res);
  }
    if(err.name === "JsonWebTokenError") 
      err = handleJwtErrorSignature();
    if (err.name === "TokenExpiredError") {
      err = handleJwtErrorExpired();
    }
    SendErrorForProd(err, res);
  
};

module.exports = globalError;
