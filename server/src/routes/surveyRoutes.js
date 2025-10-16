import express from "express";
import surveyController from "../controllers/surveyController.js";

const router = express.Router();

router.get("/", surveyController.getAllSurveyResponses);
router.get("/:id", surveyController.getSurveyResponseById);
router.get("/product/:productId", surveyController.getSurveyResponsesByProduct);
router.post("/", surveyController.createSurveyResponse);
router.put("/:id", surveyController.updateSurveyResponse);
router.delete("/:id", surveyController.deleteSurveyResponse);

export default router;