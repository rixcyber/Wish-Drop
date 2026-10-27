import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell, ScrollToTop } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { HomePage } from "@/pages/HomePage";
import { ExplorePage } from "@/pages/ExplorePage";
import { HowItWorksPage } from "@/pages/HowItWorksPage";
import { WishDetailPage } from "@/pages/WishDetailPage";
import { PostWishPage } from "@/pages/PostWishPage";
import { AuthPage } from "@/pages/AuthPage";
import { AccountPage } from "@/pages/AccountPage";
import { AdminPage } from "@/pages/AdminPage";
import { PaymentsPage, PrivacyPage, RulesPage } from "@/pages/LegalPages";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="wishes/:id" element={<WishDetailPage />} />
          <Route
            path="post"
            element={
              <ProtectedRoute>
                <PostWishPage />
              </ProtectedRoute>
            }
          />
          <Route path="signin" element={<AuthPage mode="signin" />} />
          <Route path="signup" element={<AuthPage mode="signup" />} />
          <Route
            path="account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="rules" element={<RulesPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster
        theme="light"
        position="bottom-right"
        closeButton
        toastOptions={{
          style: {
            background: "hsl(42 38% 99%)",
            border: "2px solid hsl(0 0% 13%)",
            color: "hsl(0 0% 10%)",
            fontSize: "13px",
          },
        }}
      />
    </AuthProvider>
  );
}
