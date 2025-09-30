import express from "express";
import questionController from "../controllers/questionController.js";

const router = express.Router();

router.get("/", questionController.getAllQuestions);
router.get("/:id", questionController.getQuestionById);
router.post("/", questionController.createQuestion);
router.put("/:id", questionController.updateQuestion);
router.delete("/:id", questionController.deleteQuestion);

export default router;