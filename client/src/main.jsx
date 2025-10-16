import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import Nav from "./components/Nav.jsx";
import { ProductsProvider } from "./components/ProductsContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ProductsProvider>
        <Nav />
        <App />
      </ProductsProvider>
    </BrowserRouter>
  </StrictMode>
);
