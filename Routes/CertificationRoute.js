const express = require("express");
const {
  resizeImage,
  uploadProductImages,
  CreateCertification,
  GetAllCertifications,
  GetOneCertification,
  UpdateOneCertification,
  deleteOneCertification
} = require("../Services/CertificationLogic");

const {
createCertificationValidator,
deleteCertificationValidator,
getCertificationValidator,
updateCertificationValidator
} = require("../Validators/CertificationValidator");

const router = express.Router();
router.get("/Certifications", GetAllCertifications);
router.get("/Certifications/:id",getCertificationValidator, GetOneCertification);
router.post(
  "/addCertification",
  uploadProductImages,
  createCertificationValidator,
  resizeImage,
  CreateCertification
);
router.delete("/deleteCertification/:id",deleteCertificationValidator, deleteOneCertification);
router.put(
  "/updateCertification/:id",
  uploadProductImages,
  updateCertificationValidator,
  resizeImage,
  UpdateOneCertification
);
module.exports = router;
