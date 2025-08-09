import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ClerkAuthProvider } from "@/lib/clerk";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ClerkAuthProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ClerkAuthProvider>
);
