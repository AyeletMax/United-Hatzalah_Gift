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

const checkUserResponse = async (req, res) => {
  try {
    const { productId, userName, userEmail } = req.params;
    
    // וידוא פרמטרים
    if (!productId || !userName || !userEmail) {
      return res.status(400).json({ 
        error: 'חסרים פרמטרים נדרשים',
        hasResponded: false 
      });
    }
    
    console.log(`בדיקת תגובת משתמש - מוצר: ${productId}, משתמש: ${userName}`);
    
    const hasResponded = await surveyService.checkUserResponse(productId, userName, userEmail);
    
    console.log(`תוצאת בדיקה - מוצר ${productId}: ${hasResponded ? 'כבר דירג' : 'לא דירג'}`);
    
    res.json({ hasResponded });
  } catch (err) {
    console.error(`שגיאה בבדיקת תגובת משתמש - מוצר ${req.params.productId}:`, err.message);
    res.status(500).json({ 
      error: 'שגיאה פנימית בשרת',
      hasResponded: false 
    });
  }
};

const createSurveyResponse = async (req, res) => {
  try {
    const { product_id, user_name, user_email, rating } = req.body;
    
    // וידוא נתונים
    if (!product_id || !user_name || !user_email || !rating) {
      return res.status(400).json({ 
        error: 'חסרים נתונים נדרשים לסקר' 
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'דירוג חייב להיות בין 1 ל-5' 
      });
    }
    
    console.log(`יצירת תגובת סקר - מוצר: ${product_id}, משתמש: ${user_name}, דירוג: ${rating}`);
    
    const newResponse = await surveyService.createSurveyResponse(req.body);
    
    console.log(`תגובת סקר נוצרה בהצלחה - ID: ${newResponse.id}`);
    
    res.status(201).json(newResponse);
  } catch (err) {
    console.error(`שגיאה ביצירת תגובת סקר:`, err.message);
    
    if (err.message.includes('כבר דירג')) {
      res.status(409).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'שגיאה פנימית בשרת' });
    }
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

const resetProductSurvey = async (req, res) => {
  console.log('resetProductSurvey controller called');
  console.log('req.params:', req.params);
  try {
    const { productId } = req.params;
    console.log('productId extracted:', productId);
    
    // Validate productId
    if (!productId || isNaN(parseInt(productId))) {
      console.log('Invalid productId');
      return res.status(400).json({ error: 'מזהה מוצר לא תקין' });
    }
    
    console.log('Calling surveyService.resetProductSurvey with:', parseInt(productId));
    const deletedCount = await surveyService.resetProductSurvey(parseInt(productId));
    console.log('Service returned deletedCount:', deletedCount);
    
    if (deletedCount === 0) {
      console.log('No surveys found, returning success with 0 count');
      return res.json({ 
        success: true, 
        deletedCount: 0,
        message: 'אין סקרים למוצר זה לאיפוס'
      });
    }
    
    console.log('Surveys deleted successfully, count:', deletedCount);
    res.json({ 
      success: true, 
      deletedCount,
      message: `נמחקו ${deletedCount} סקרים בהצלחה`
    });
  } catch (err) {
    console.error('שגיאה באיפוס סקר מוצר:', err);
    res.status(500).json({ error: 'שגיאה פנימית בשרת' });
  }
};

export default {
  getAllSurveyResponses,
  getSurveyResponseById,
  getSurveyResponsesByProduct,
  checkUserResponse,
  createSurveyResponse,
  updateSurveyResponse,
  deleteSurveyResponse,
  resetProductSurvey,
};