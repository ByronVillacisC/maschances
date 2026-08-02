import { ProtectedRoute } from "@/components/protected-route";
import { ProviderDashboardPage } from "./_components/provider-dashboard-page";

export const metadata = {
  title: "Dashboard Proveedor | +CHANCES",
  description: "Panel de control del proveedor",
};

export default function ProviderDashboardRoute() {
  return (
    <ProtectedRoute roles={["provider"]}>
      <ProviderDashboardPage />
    </ProtectedRoute>
  );
}