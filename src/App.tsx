import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminResults from "./pages/AdminResults";
import AdminQuizDetail from "./pages/AdminQuizDetail";
import QuizStart from "./pages/QuizStart";
import QuizTake from "./pages/QuizTake";
import BookReview from "./pages/projects/BookReview";
import TravelRecommendation from "./pages/projects/TravelRecommendation";
import JavidevSite from "./pages/projects/JavidevSite";
import WhatToBuy from "./pages/projects/WhatToBuy";
import JVLuxe from "./pages/projects/JVLuxe";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/LantestAI" element={<Index />} />
            <Route path="/LantestAI/admin/login" element={<AdminLogin />} />
            <Route path="/LantestAI/admin" element={<AdminDashboard />} />
            <Route path="/LantestAI/admin/results" element={<AdminResults />} />
            <Route path="/LantestAI/admin/quiz/:quizId" element={<AdminQuizDetail />} />
            <Route path="/LantestAI/quiz/:quizId" element={<QuizStart />} />
            <Route path="/LantestAI/quiz/:quizId/take/:attemptId" element={<QuizTake />} />
            <Route path="/projects/book-review" element={<BookReview />} />
            <Route path="/projects/travel-recommendation" element={<TravelRecommendation />} />
            <Route path="/projects/javidev-site" element={<JavidevSite />} />
            <Route path="/projects/whattobuy" element={<WhatToBuy />} />
            <Route path="/projects/jv-luxe" element={<JVLuxe />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
