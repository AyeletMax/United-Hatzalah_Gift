import express from "express";
import giftController from "../controllers/giftController.js";

const router = express.Router();

router.get("/", giftController.getAllGifts);
router.get("/:id", giftController.getGiftById);
router.post("/", giftController.createGift);
router.put("/:id", giftController.updateGift);
router.delete("/:id", giftController.deleteGift);

export default router;
