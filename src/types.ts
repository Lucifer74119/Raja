export interface MenuItem {
  id: string;
  name: string;
  swedishName: string;
  price: number; // in SEK
  description: string;
  category: string; // Dynamic categorie strings supported
  imageUrl: string;
  dietary: string[]; // e.g., ['Gluten-Free', 'Lactose-Free', 'Vegetarian']
  signature?: boolean;
  published?: boolean; // Pub/Unpub status support
}

export interface BookingDetails {
  id?: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  area: string;
  specialNotes?: string;
  dietaryNotes?: string;
  reference?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string;
  vouchersSent?: string[];
  tableId?: string;
}

export interface DiningTable {
  id: string;
  tableName: string;
  zoneId: string; // e.g., 'Hall', 'Kristallen', 'Outdoor'
  capacity: number;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface GiftVoucherConfig {
  defaultPercentage: number; // For bonus or discount
  isEnabled: boolean; // Enables/Disables vouchers globally
  firstTimePercentage?: number;
  regularPercentage?: number;
  firstTimeAutoSendEnabled?: boolean; // Auto send to first-time registering guests
  firstTimeAutoSendAmount?: number; // Welcome voucher amount
  claimTasks?: string[]; // Tasks/milestones for claiming vouchers
}

export interface AdminVoucher {
  id: string;
  code: string;
  amount: number;
  recipientEmail: string;
  recipientName: string;
  createdAt: string;
  isEnabled: boolean;
  value?: number; // Face value vs. payment
  isClaimed?: boolean;
  claimedAt?: string;
  claimOtp?: string;
  claimedByEmail?: string; // Track which customer account claimed it
}

export interface DiningAreaZone {
  id: string;
  name: string;
  desc: string;
  capacity: number;
  tableCount: number;
  isActive: boolean;
}

export interface GiftCardDetails {
  id?: string;
  amount: number;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  message?: string;
  theme: 'classic' | 'golden' | 'winter';
  deliveryDate: string;
  cardNumber?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  source: 'Google' | 'TripAdvisor' | 'Local Legend';
  visitReason: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'interior' | 'cuisine' | 'history';
  imageUrl: string;
  description: string;
}

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
}

export interface StripeTransaction {
  id: string;
  voucherCode: string;
  amount: number;
  currency: string;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  createdAt: string;
  status: 'succeeded' | 'failed' | 'pending';
}

export interface StaffProfile {
  id: string;
  username: string;
  displayName: string;
  password?: string;
  permissions: string[]; // List of tabs they can access, e.g., ['reservations', 'customers', 'tables']
  createdAt: string;
}

export interface StaffLog {
  id: string;
  staffName: string;
  action: string;
  timestamp: string;
  operatorName?: string; // Compatibility alias
  description?: string; // Compatibility alias
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalVisits: number;
  dietaryNotes?: string;
  specialNotes?: string;
  isBlocked?: boolean;
  password?: string;
  passwordResetCode?: string;
}

export interface VoucherBuyingOption {
  id: string;
  name: string;
  swedishName: string;
  cost: number;
  value: number;
  description?: string;
  isEnabled: boolean; // Started vs. Stopped
}


