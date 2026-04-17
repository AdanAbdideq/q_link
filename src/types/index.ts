export type UserRole = 'customer' | 'provider' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  city: string;
  county: string;
  createdAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface ServiceProvider {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  category: string;
  subServices: string[];
  counties: string[];
  city: string;
  basePrice: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isApproved: boolean;
  documents: {
    businessReg?: string;
    taxPin?: string;
    idDocument?: string;
  };
  createdAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceCategory: string;
  subServices: string[];
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  county: string;
  city: string;
  notes?: string;
  price: number;
  qrCode: string;
  createdAt: string;
  completedAt?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'customers' | 'providers';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  expiresAt?: string;
}

export interface PlatformAnalytics {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  totalRevenue: number;
  bookingsToday: number;
  activeBookings: number;
  pendingApprovals: number;
}