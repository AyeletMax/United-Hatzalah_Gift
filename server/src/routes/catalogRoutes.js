import express from "express";
import catalogController from "../controllers/catalogController.js";

const router = express.Router();

router.get("/", catalogController.getAllCatalogs);
router.get("/:id", catalogController.getCatalogById);
router.post("/", catalogController.createCatalog);
router.put("/:id", catalogController.updateCatalog);
router.delete("/:id", catalogController.deleteCatalog);

export default router;