/* eslint-disable import/no-extraneous-dependencies */
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const path = require("path");

const sequelize = require("./Database/database"); // Import the sequelize instance
const APIError = require("./Utils/apiError");
const globalError = require("./middleWares/errorMiddleWare");
const mainRoute = require("./Routes/Index");

// ====================================
// Load environment variables
dotenv.config({ path: "config.env" });

// Establish database connection (automatically handled by sequelize instance)
sequelize
  .sync()
  .then(() => {
    console.log("All models were synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error syncing models:", error);
  });

// Create Express app
const app = express();

// Middlewares setup
app.use(
  cors({
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Define allowed HTTP methods
    credentials: true, // Allow cookies to be sent with requests (if needed)
  })
);
app.options("*", cors()); // Enable preflight for all routes
app.use(compression()); // Compress responses
app.use(express.json({limit : "30kb"})); // Parse incoming JSON requests and limit request for sequrity
app.use(express.static(path.join(__dirname, "uploads"))); // Serve static files from "uploads" directory

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode : ${process.env.NODE_ENV}`);
}

// Root route for health check
app.get("/", (req, res) => {
  res.send("It is running");
});

// Main application routes
mainRoute(app);

// Catch-all for undefined routes
app.all("*", (req, res, next) => {
  next(new APIError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware
app.use(globalError);

// ===============================================
// Start the server
const Port = process.env.PORT || 8000;
const server = app.listen(Port, () => {
  console.log(`App is running on port: ${Port}`);
  console.log(`Server running at http://localhost:${Port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error(`Unhandled Rejection: ${error.name} | ${error.message}`);
  server.close(() => {
    console.log("Shutting down...");
    // process.exit(1);
  });
});
