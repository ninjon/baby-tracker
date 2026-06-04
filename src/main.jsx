import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { BabyProvider } from "./context/BabyContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <BabyProvider>
        <App />
      </BabyProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
