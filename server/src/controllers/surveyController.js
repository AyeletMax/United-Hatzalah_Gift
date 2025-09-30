import surveyService from "../services/surveyService.js";

const getAllSurveyResponses = async (req, res) => {
  try {
    const filters = {
      product_id: req.query.product_id,
      min_rating: req.query.min_rating,
      max_rating: req.query.max_rating,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };
    const responses = await surveyService.getAllSurveyResponses(filters);
    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSurveyResponseById = async (req, res) => {
  try {
    const response = await surveyService.getSurveyResponseById(req.params.id);
    if (!response) return res.status(404).json({ error: "Survey response not found" });
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSurveyResponsesByProduct = async (req, res) => {
  try {
    const responses = await surveyService.getSurveyResponsesByProduct(req.params.productId);
    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createSurveyResponse = async (req, res) => {
  try {
    const newResponse = await surveyService.createSurveyResponse(req.body);
    res.status(201).json(newResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateSurveyResponse = async (req, res) => {
  try {
    const updatedResponse = await surveyService.updateSurveyResponse(req.params.id, req.body);
    if (!updatedResponse) return res.status(404).json({ error: "Survey response not found" });
    res.json(updatedResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteSurveyResponse = async (req, res) => {
  try {
    const deleted = await surveyService.deleteSurveyResponse(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Survey response not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getAllSurveyResponses,
  getSurveyResponseById,
  getSurveyResponsesByProduct,
  createSurveyResponse,
  updateSurveyResponse,
  deleteSurveyResponse,
};