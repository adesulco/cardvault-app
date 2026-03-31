// User types
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  countryCode: string;
  preferredCurrency: 'IDR' | 'USD';
  kycStatus: 'unverified' | 'pending' | 'verified';
  payoutMethod: string | null;
  trustScore: number;
  totalTransactions: number;
  role: 'user' | 'admin';
  isSuspended: boolean;
  createdAt: string;
}

// Card types
export interface Card {
  id: string;
  ownerId: string;
  cardName: string;
  playerOrCharacter: string | null;
  year: string | null;
  setName: string | null;
  brand: string | null;
  sportOrCategory: string | null;
  condition: 'raw' | 'graded';
  grade: string | null;
  gradingCompany: string | null;
  certNumber: string | null;
  frontImageUrl: string | null;
  backImageUrl: string | null;
  estimatedValueIdr: number | null;
  estimatedValueUsd: number | null;
  status: 'in_collection' | 'listed_sale' | 'listed_trade' | 'in_transaction' | 'sold' | 'traded';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Listing types
export interface Listing {
  id: string;
  sellerId: string;
  cardId: string;
  listingType: 'sale' | 'trade' | 'both';
  priceIdr: number | null;
  priceUsd: number | null;
  tradeDescription: string | null;
  isBestOfferEnabled: boolean;
  status: 'active' | 'paused' | 'sold' | 'traded' | 'expired';
  viewsCount: number;
  favoritesCount: number;
  createdAt: string;
  card?: Card;
  seller?: User;
}

// Transaction / Escrow types
export type EscrowStatus =
  | 'pending_payment'
  | 'payment_held'
  | 'awaiting_shipment'
  | 'shipped'
  | 'delivered'
  | 'under_inspection'
  | 'completed'
  | 'disputed'
  | 'refunded'
  | 'auto_completed';

export type PaymentGateway = 'midtrans' | 'xendit' | 'stripe' | 'paypal';

export interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string | null;
  transactionType: 'sale' | 'trade' | 'trade_with_cash';
  agreedPriceIdr: number | null;
  agreedPriceUsd: number | null;
  exchangeRateAtTransaction: number | null;
  buyerCurrency: string;
  paymentGateway: PaymentGateway | null;
  paymentMethodType: string | null;
  escrowStatus: EscrowStatus;
  trackingNumberSeller: string | null;
  shippingCarrier: string | null;
  completedAt: string | null;
  createdAt: string;
  buyer?: User;
  seller?: User;
  listing?: Listing;
}

// Offer types
export interface Offer {
  id: string;
  listingId: string;
  fromUserId: string;
  toUserId: string;
  offerType: 'cash' | 'trade' | 'cash_and_trade';
  offeredAmountIdr: number | null;
  offeredAmountUsd: number | null;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  createdAt: string;
  fromUser?: User;
}

// Review
export interface Review {
  id: string;
  transactionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer?: User;
}

// Message
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: User;
}

// Notification
export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

// Currency
export interface ExchangeRate {
  rate: number;
  source: string;
  fetchedAt: string;
  expiresAt: string;
}

// Categories for the marketplace
export const CARD_CATEGORIES = [
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
  { id: 'baseball', label: 'Baseball', icon: '⚾' },
  { id: 'football', label: 'Football', icon: '🏈' },
  { id: 'soccer', label: 'Soccer', icon: '⚽' },
  { id: 'hockey', label: 'Hockey', icon: '🏒' },
  { id: 'pokemon', label: 'Pokémon/TCG', icon: '⚡' },
  { id: 'yugioh', label: 'Yu-Gi-Oh!', icon: '🎴' },
  { id: 'mtg', label: 'Magic: The Gathering', icon: '🧙' },
  { id: 'other', label: 'Other Collectibles', icon: '🃏' },
] as const;

export const GRADING_COMPANIES = ['PSA', 'BGS', 'SGC', 'CGC', 'CSG'] as const;

export const ESCROW_STATUS_LABELS: Record<EscrowStatus, string> = {
  pending_payment: 'Pending Payment',
  payment_held: 'Payment Held',
  awaiting_shipment: 'Awaiting Shipment',
  shipped: 'Shipped',
  delivered: 'Delivered',
  under_inspection: 'Under Inspection',
  completed: 'Completed',
  disputed: 'Disputed',
  refunded: 'Refunded',
  auto_completed: 'Auto-Completed',
};
