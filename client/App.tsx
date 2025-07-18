import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Schema from "./pages/Schema";
import Objects from "./pages/Objects";
import References from "./pages/References";
import Search from "./pages/Search";
import Backup from "./pages/Backup";
import Monitoring from "./pages/Monitoring";
import Settings from "./pages/Settings";
import DevTools from "./pages/DevTools";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/schema" element={<Schema />} />
          <Route path="/objects" element={<Objects />} />
          <Route path="/references" element={<References />} />
          <Route path="/search" element={<Search />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/backup" element={<Backup />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/devtools" element={<DevTools />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
