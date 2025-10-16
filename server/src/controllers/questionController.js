import questionService from "../services/questionService.js";

const getAllQuestions = async (req, res) => {
  try {
    const filters = {
      question_text: req.query.question_text
    };
    const questions = await questionService.getAllQuestions(filters);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const question = await questionService.getQuestionById(req.params.id);
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createQuestion = async (req, res) => {
  try {
    const newQuestion = await questionService.createQuestion(req.body);
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const updatedQuestion = await questionService.updateQuestion(req.params.id, req.body);
    if (!updatedQuestion) return res.status(404).json({ error: "Question not found" });
    res.json(updatedQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const deleted = await questionService.deleteQuestion(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Question not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};