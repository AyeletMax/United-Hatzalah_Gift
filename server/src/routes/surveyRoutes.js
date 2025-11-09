import express from "express";
import surveyController from "../controllers/surveyController.js";

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`Survey route: ${req.method} ${req.originalUrl}`);
  next();
});

router.get("/", surveyController.getAllSurveyResponses);
router.get("/check/:productId/:userName/:userEmail", (req, res, next) => {
  console.log('Check route hit with params:', req.params);
  surveyController.checkUserResponse(req, res, next);
});
router.get("/product/:productId", surveyController.getSurveyResponsesByProduct);
router.get("/:id", surveyController.getSurveyResponseById);
router.post("/", surveyController.createSurveyResponse);
router.put("/:id", surveyController.updateSurveyResponse);
router.delete("/reset/:productId", (req, res, next) => {
  console.log(`Reset survey called for product: ${req.params.productId}`);
  surveyController.resetProductSurvey(req, res, next);
});
router.delete("/:id", surveyController.deleteSurveyResponse);

export default router;