import brandService from "../services/brandService.js";

const getAllBrands = async (req, res) => {
  try {
    const filters = {
      name: req.query.name
    };
    const brands = await brandService.getAllBrands(filters);
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBrandById = async (req, res) => {
  try {
    const brand = await brandService.getBrandById(req.params.id);
    if (!brand) return res.status(404).json({ error: "Brand not found" });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createBrand = async (req, res) => {
  try {
    const newBrand = await brandService.createBrand(req.body);
    res.status(201).json(newBrand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const updatedBrand = await brandService.updateBrand(req.params.id, req.body);
    if (!updatedBrand) return res.status(404).json({ error: "Brand not found" });
    res.json(updatedBrand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const deleted = await brandService.deleteBrand(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Brand not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};