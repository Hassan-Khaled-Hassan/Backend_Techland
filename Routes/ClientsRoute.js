const express = require("express");
const {
  resizeImage,
  uploadProductImages,
  CreateClients,
  GetAllClients,
  GetOneClients,
  UpdateOneClients,
  deleteOneClients
} = require("../Services/ClientsLogic");

const {
  createClientValidator,
  deleteClientValidator,
  getClientValidator,
  updateClientValidator
} = require("../Validators/ClientsValidator");

const router = express.Router();
router.get("/Clients", GetAllClients);
router.get("/Clients/:id", getClientValidator, GetOneClients);
router.post(
  "/addClient",
  uploadProductImages,
  createClientValidator,
  resizeImage,
  CreateClients
);
router.delete("/deleteClient/:id", deleteClientValidator, deleteOneClients);
router.put(
  "/updateClient/:id",
  uploadProductImages,
  updateClientValidator,
  resizeImage,
  UpdateOneClients
);
module.exports = router;
