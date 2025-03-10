const { Sequelize } = require("sequelize");

// Initialize the Sequelize connection
const sequelize = new Sequelize("TechlandBS", "techland", "WWK&5=N{;us6", {
  host: "sxb1plzcpnl508434.prod.sxb1.secureserver.net", // MySQL host
  dialect: "mysql", // Database dialect
  logging: console.log, // Disable SQL query logging (optional)
  dialectModule: require("mysql2"),
});

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to MySQL successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);
  });

// Export the sequelize instance to use in models
module.exports = sequelize;
