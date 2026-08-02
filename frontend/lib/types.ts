// ============================================================================
// TIPOS BASE
// ============================================================================

export type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  avatar?: string | null;
  twoFactorEnabled?: boolean;
  createdAt?: string;
};

export type Raffle = {
  id: number;
  title: string;
  description?: string;
  prizeImageUrl?: string;
  totalTickets: number;
  ticketPrice: number;
  currency: string;
  status: string;
  drawAt?: string;
  packageId: number;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
};

export type Ticket = {
  id: number;
  raffleId: number;
  userId: number;
  quantity: number;
  unitPrice: number;
  currency: string;
  status: string;
  createdAt: string;
  raffle?: Raffle;
};

export type CartItem = {
  id: number;
  raffleId: number;
  quantity: number;
  raffle?: Raffle;
};

// ============================================================================
// TIPOS PROVEEDOR (FASE 8)
// ============================================================================

export type Provider = {
  id: number;
  userId: number;
  businessName: string;
  description?: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: number;
  providerId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  price: number;
  currency: string;
  claimAddress?: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: number;
    businessName: string;
    city?: string;
    country?: string;
  };
};

export type RafflePrize = {
  id: number;
  raffleId: number;
  productId: number;
  position: number;
  createdAt: string;
  product: Product;
};

export type ActiveRaffle = {
  id: number;
  title: string;
  status: string;
  drawAt?: string;
  createdAt: string;
  prizes: RafflePrize[];
};

// ============================================================================
// TIPOS LEGACY (mantener compatibilidad)
// ============================================================================

export type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
};

export type ExpenseFormData = Omit<Expense, 'id' | 'date'> & {
  date: string;
};

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other'
] as const;

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};