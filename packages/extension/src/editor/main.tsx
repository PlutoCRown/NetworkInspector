import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MessageHost } from "@/components/MessageHost";
import "@/styles/globals.css";
import { EditorApp } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MessageHost>
      <EditorApp />
    </MessageHost>
  </StrictMode>,
);
