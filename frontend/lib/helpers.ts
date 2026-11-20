export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "Sin fecha";
  try {
    return new Intl.DateTimeFormat("es-EC", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return "Fecha inválida";
  }
}

// CAMBIO: función formatDateTime añadida (usada en owner-raffles-page.tsx)
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "Sin fecha";
  try {
    return new Intl.DateTimeFormat("es-EC", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return "Fecha inválida";
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Borrador",
    active: "Activo",
    closed: "Cerrado",
    completed: "Completado",
    cancelled: "Cancelado",
    // CAMBIO: añadido estado 'inactive' para cuando Admin desactiva un sorteo
    inactive: "Inactivo",
  };
  return labels[status] ?? status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-500 text-white",
    active: "bg-green-500 text-white",
    closed: "bg-blue-500 text-white",
    completed: "bg-purple-500 text-white",
    cancelled: "bg-red-500 text-white",
    // CAMBIO: color para estado 'inactive'
    inactive: "bg-yellow-500 text-white",
  };
  return colors[status] ?? "bg-gray-500 text-white";
}

export function getRoleLabel(role?: string | null): string {
  const labels: Record<string, string> = {
    user: "Usuario",
    owner: "Propietario",
    provider: "Proveedor",
    admin: "Administrador",
    superadmin: "Super Admin",
  };
  return labels[role ?? ""] ?? "Usuario";
}

export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return "Nunca";
  try {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 30) return `Hace ${diffDays}d`;
    return formatDate(date);
  } catch {
    return "Fecha inválida";
  }
}

// CAMBIO: helper para generar link compartible de un sorteo
export function generateShareLink(raffleId: string | number): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return `${baseUrl}/catalog/${raffleId}`;
}


export function getRoleBadgeColor(role?: string): string {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'USER':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
