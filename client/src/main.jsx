<<<<<<< HEAD
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
=======
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Nav from './components/Nav.jsx'
>>>>>>> 7c882dbde7a63e5bc87bd806a0d5e11f08602b24

import App from "./App.jsx";
import Nav from "./components/Nav.jsx";
import { ProductsProvider } from "./components/ProductsContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
<<<<<<< HEAD
    <BrowserRouter>
      <ProductsProvider>
        <Nav />
        <App />
      </ProductsProvider>
    </BrowserRouter>
  </StrictMode>
);
=======
    <App />
    <Nav />
  </StrictMode>,
)
>>>>>>> 7c882dbde7a63e5bc87bd806a0d5e11f08602b24
