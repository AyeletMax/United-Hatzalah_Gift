import express from "express";
import surveyController from "../controllers/surveyController.js";

const router = express.Router();

router.get("/", surveyController.getAllSurveyResponses);
router.get("/check/:productId/:userName/:userEmail", surveyController.checkUserResponse);
router.get("/product/:productId", surveyController.getSurveyResponsesByProduct);
router.get("/:id", surveyController.getSurveyResponseById);
router.post("/", surveyController.createSurveyResponse);
router.put("/:id", surveyController.updateSurveyResponse);
router.delete("/:id", surveyController.deleteSurveyResponse);

export default router;