import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import { ProductsProvider } from "./components/ProductsContext.jsx";
import { AdminProvider } from "./components/AdminContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AdminProvider>
        <ProductsProvider>
          <App />
        </ProductsProvider>
      </AdminProvider>
    </BrowserRouter>
  </StrictMode>
);
