
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import PollVoting from "./pages/PollVoting";
import CandidateRegistration from "./pages/CandidateRegistration";
import PollManagement from "./pages/PollManagement";
import ResetData from "./pages/ResetData";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/polls/:pollId" element={<PollManagement />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/vote/:pollId" element={<PollVoting />} />
          <Route path="/results" element={<Results />} />
          <Route path="/candidate-registration" element={<CandidateRegistration />} />
          <Route path="/reset-data" element={<ResetData />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
