import express from "express";
import cors from "cors";

const app = express();

// CORS - allow everything
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Server running' });
});

app.get('/api/products', (req, res) => {
  res.json([
    { id: 1, name: 'Test Product', price: 100 },
    { id: 2, name: 'Another Product', price: 200 }
  ]);
});

app.get('/api/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Test Category' }
  ]);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});