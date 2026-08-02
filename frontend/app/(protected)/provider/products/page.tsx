import { ProtectedRoute } from "@/components/protected-route";
import { ProviderProductsPage } from "./_components/provider-products-page";

export const metadata = {
  title: "Mis Productos | +CHANCES",
  description: "Gestión de productos del proveedor",
};

export default function ProviderProductsRoute() {
  return (
    <ProtectedRoute roles={["provider"]}>
      <ProviderProductsPage />
    </ProtectedRoute>
  );
}