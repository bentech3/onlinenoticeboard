import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { InactivityHandler } from "@/components/InactivityHandler";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Notices from "./pages/Notices";
import NoticeDetail from "./pages/NoticeDetail";
import CreateNotice from "./pages/CreateNotice";
import ApprovalQueue from "./pages/ApprovalQueue";
import Signage from "./pages/Signage";
import Settings from "./pages/Settings";
import AdminUsers from "./pages/AdminUsers";
import AdminDepartments from "./pages/AdminDepartments";
import NotFound from "./pages/NotFound";
import { Analytics } from "@vercel/analytics/react";



const queryClient = new QueryClient();

const NotFoundRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (isAuthenticated && location.pathname !== '/404') {
    return <NotFound />;
  }

  return <NotFound />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/notices/create" element={<CreateNotice />} />
            <Route path="/notices/:id" element={<NoticeDetail />} />
            <Route path="/approval-queue" element={<ApprovalQueue />} />
            <Route path="/signage" element={<Signage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Settings />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/departments" element={<AdminDepartments />} />
            <Route path="*" element={<NotFoundRedirect />} />
          </Routes>
        </BrowserRouter>
        <InactivityHandler />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
