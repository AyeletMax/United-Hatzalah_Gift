import catalogService from "../services/catalogService.js";

const getAllCatalogs = async (req, res) => {
  try {
    const filters = {
      name: req.query.name
    };
    const catalogs = await catalogService.getAllCatalogs(filters);
    res.json(catalogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCatalogById = async (req, res) => {
  try {
    const catalog = await catalogService.getCatalogById(req.params.id);
    if (!catalog) return res.status(404).json({ error: "Catalog not found" });
    res.json(catalog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createCatalog = async (req, res) => {
  try {
    const newCatalog = await catalogService.createCatalog(req.body);
    res.status(201).json(newCatalog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateCatalog = async (req, res) => {
  try {
    const updatedCatalog = await catalogService.updateCatalog(req.params.id, req.body);
    if (!updatedCatalog) return res.status(404).json({ error: "Catalog not found" });
    res.json(updatedCatalog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteCatalog = async (req, res) => {
  try {
    const deleted = await catalogService.deleteCatalog(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Catalog not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getAllCatalogs,
  getCatalogById,
  createCatalog,
  updateCatalog,
  deleteCatalog,
};