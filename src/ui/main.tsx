import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { initServices, ServicesProvider } from "@ui/context/ServicesContext";

import "@ui/styles/tailwind.css";
import App from "@ui/App";

const services = initServices();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <ServicesProvider value={services}>
        <App />
      </ServicesProvider>
    </HashRouter>
  </StrictMode>,
);
