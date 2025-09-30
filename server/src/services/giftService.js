import { pool } from "../db.js";

const getAllGifts = async () => {
  const [rows] = await pool.query("SELECT * FROM gifts");
  return rows;
};

const getGiftById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM gifts WHERE id = ?", [id]);
  return rows[0];
};

const createGift = async (gift) => {
  const { name, description, value } = gift;
  const [result] = await pool.query(
    "INSERT INTO gifts (name, description, value) VALUES (?, ?, ?)",
    [name, description, value]
  );
  return { id: result.insertId, name, description, value };
};

const updateGift = async (id, gift) => {
  const { name, description, value } = gift;
  const [result] = await pool.query(
    "UPDATE gifts SET name = ?, description = ?, value = ? WHERE id = ?",
    [name, description, value, id]
  );
  if (result.affectedRows === 0) return null;
  return { id, name, description, value };
};

const deleteGift = async (id) => {
  const [result] = await pool.query("DELETE FROM gifts WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

export default {
  getAllGifts,
  getGiftById,
  createGift,
  updateGift,
  deleteGift,
};
