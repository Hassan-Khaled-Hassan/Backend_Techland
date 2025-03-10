
const CategoryRoute = require("./CategoryRoute");
const CertificationRoute = require("./CertificationRoute");
const ClientsRoute = require("./ClientsRoute");
const ProductRoute = require("./ProductRoute");
const BlogsRoute = require("./BlogsRoute");
const AuthRoute = require("./AuthRoute");
const UserRoute = require("./UserRoute");




// ================================================================
const mainRoute = (app) => {
  app.use("/api/v1/Category", CategoryRoute);
  app.use("/api/v1/Certification", CertificationRoute);
  app.use("/api/v1/Clients", ClientsRoute);
  app.use("/api/v1/Product", ProductRoute);
  app.use("/api/v1/Blog", BlogsRoute);
  app.use("/api/v1/Auth", AuthRoute);
  app.use("/api/v1/Users", UserRoute);

};

module.exports = mainRoute;
