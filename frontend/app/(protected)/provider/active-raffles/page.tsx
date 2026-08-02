import { ProtectedRoute } from "@/components/protected-route";
import { ProviderActiveRafflesPage } from "./_components/provider-active-raffles-page";

export const metadata = {
  title: "Rifas Activas | +CHANCES",
  description: "Sorteos con tus productos como premios",
};

export default function ProviderActiveRafflesRoute() {
  return (
    <ProtectedRoute roles={["provider"]}>
      <ProviderActiveRafflesPage />
    </ProtectedRoute>
  );
}