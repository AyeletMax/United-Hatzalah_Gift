import giftService from "../services/giftService.js";

const getAllGifts = async (req, res) => {
  try {
    const gifts = await giftService.getAllGifts();
    res.json(gifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGiftById = async (req, res) => {
  try {
    const gift = await giftService.getGiftById(req.params.id);
    if (!gift) return res.status(404).json({ error: "Gift not found" });
    res.json(gift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createGift = async (req, res) => {
  try {
    const newGift = await giftService.createGift(req.body);
    res.status(201).json(newGift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateGift = async (req, res) => {
  try {
    const updatedGift = await giftService.updateGift(req.params.id, req.body);
    if (!updatedGift) return res.status(404).json({ error: "Gift not found" });
    res.json(updatedGift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteGift = async (req, res) => {
  try {
    const deleted = await giftService.deleteGift(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Gift not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getAllGifts,
  getGiftById,
  createGift,
  updateGift,
  deleteGift,
};
