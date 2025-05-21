
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard"; 
import Vacancies from "./pages/Vacancies";
import Pipeline from "./pages/Pipeline";
import Candidates from "./pages/Candidates";
import Interviews from "./pages/Interviews";
import Tests from "./pages/Tests";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <AppLayout>
                <Index />
              </AppLayout>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            } 
          />
          <Route 
            path="/vagas" 
            element={
              <AppLayout>
                <Vacancies />
              </AppLayout>
            } 
          />
          <Route 
            path="/pipeline" 
            element={
              <AppLayout>
                <Pipeline />
              </AppLayout>
            } 
          />
          <Route 
            path="/candidatos" 
            element={
              <AppLayout>
                <Candidates />
              </AppLayout>
            } 
          />
          <Route 
            path="/entrevistas" 
            element={
              <AppLayout>
                <Interviews />
              </AppLayout>
            } 
          />
          <Route 
            path="/testes" 
            element={
              <AppLayout>
                <Tests />
              </AppLayout>
            } 
          />
          <Route 
            path="/configuracoes" 
            element={
              <AppLayout>
                <Settings />
              </AppLayout>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
