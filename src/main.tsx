// main.tsx или App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import App from "./components/App/App";

const queryClient = new QueryClient();

<React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
</React.StrictMode>;
