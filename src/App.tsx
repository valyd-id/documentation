import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import TryApis from "./pages/TryApis";
import VerifyDocs from "./pages/VerifyDocs";
import IdApiRef from "./pages/IdApiRef";
import VerifyApiRef from "./pages/VerifyApiRef";
import Agents from "./pages/Agents";
import HostedKycPage from "./pages/HostedKycPage";
import VerifyLicensePage from "./pages/VerifyLicensePage";
import EvvPage from "./pages/EvvPage";
import AntiSpoofPage from "./pages/AntiSpoofPage";
import McpDocs from "./pages/McpDocs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/sandbox" element={<TryApis />} />
          <Route path="/docs" element={<Index />} />
          <Route path="/docs/api-reference" element={<IdApiRef />} />
          <Route path="/docs/:section" element={<Index />} />

          {/* Verification APIs (renamed from "Verify"). The /verify/* paths still
              resolve so existing links and search results keep working. */}
          <Route path="/verifications" element={<VerifyDocs />} />
          <Route path="/verifications/api" element={<VerifyApiRef />} />
          <Route path="/verifications/:section" element={<VerifyDocs />} />
          <Route path="/verify" element={<Navigate to="/verifications" replace />} />
          <Route path="/verify/api" element={<VerifyApiRef />} />
          <Route path="/verify/ship-hosted-kyc" element={<HostedKycPage />} />
          <Route path="/verify/verify-license" element={<VerifyLicensePage />} />
          <Route path="/evv" element={<EvvPage />} />
          <Route path="/antispoof" element={<AntiSpoofPage />} />
          <Route path="/mcp" element={<McpDocs />} />
          <Route path="/agents" element={<Agents />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
