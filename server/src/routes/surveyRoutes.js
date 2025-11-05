import express from "express";
import surveyController from "../controllers/surveyController.js";

const router = express.Router();

router.get("/", surveyController.getAllSurveyResponses);
router.get("/check/:productId/:userName/:userEmail", surveyController.checkUserResponse);
router.get("/product/:productId", surveyController.getSurveyResponsesByProduct);
router.get("/:id", surveyController.getSurveyResponseById);
router.post("/", surveyController.createSurveyResponse);
router.put("/:id", surveyController.updateSurveyResponse);
console.log('Survey route registered: DELETE /product/:productId/reset');
router.delete("/product/:productId/reset", surveyController.resetProductSurvey);
router.delete("/reset/:productId", surveyController.resetProductSurvey);
router.delete("/:id", surveyController.deleteSurveyResponse);

export default router;