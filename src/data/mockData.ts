import type { ServiceCategory, ServiceProvider, Booking, Announcement, PlatformAnalytics, User } from '@/types';

export const mockServiceCategories: ServiceCategory[] = [
  { id: 'cat1', name: 'Plumbing',     icon: 'droplets',   description: 'Professional plumbing services for your home and business', color: '#3b82f6' },
  { id: 'cat2', name: 'Electrical',   icon: 'zap',        description: 'Certified electricians for all your electrical needs',       color: '#f59e0b' },
  { id: 'cat3', name: 'Cleaning',     icon: 'sparkles',   description: 'Home and office cleaning services',                          color: '#10b981' },
  { id: 'cat4', name: 'Carpentry',    icon: 'hammer',     description: 'Skilled carpenters for furniture and woodwork',              color: '#8b5cf6' },
  { id: 'cat5', name: 'Painting',     icon: 'paintbrush', description: 'Interior and exterior painting services',                    color: '#ec4899' },
  { id: 'cat6', name: 'HVAC',         icon: 'wind',       description: 'Air conditioning and heating services',                      color: '#06b6d4' },
  { id: 'cat7', name: 'Landscaping',  icon: 'flower-2',   description: 'Garden and landscape design services',                       color: '#22c55e' },
  { id: 'cat8', name: 'Moving',       icon: 'truck',      description: 'Professional moving and relocation services',                color: '#f97316' },
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'John Kamau',   phone: '+254712345678', role: 'customer', city: 'Nairobi', county: 'Nairobi', createdAt: '2024-01-15' },
  { id: 'u2', name: 'Sarah Wanjiku',phone: '+254723456789', role: 'customer', city: 'Mombasa', county: 'Mombasa', createdAt: '2024-02-01' },
  { id: 'u3', name: 'Peter Ochieng',phone: '+254734567890', role: 'provider', city: 'Kisumu',  county: 'Kisumu',  createdAt: '2024-01-20' },
  { id: 'u4', name: 'Mary Akinyi',  phone: '+254745678901', role: 'customer', city: 'Nakuru',  county: 'Nakuru',  createdAt: '2024-03-01' },
  { id: 'u5', name: 'James Mwangi', phone: '+254756789012', role: 'provider', city: 'Nairobi', county: 'Nairobi', createdAt: '2024-02-15' },
  { id: 'admin1', name: 'Admin User',phone: '+254700000000', role: 'admin',   city: 'Nairobi', county: 'Nairobi', createdAt: '2024-01-01' },
];

export const mockProviders: ServiceProvider[] = [
  {
    id: 'p1', userId: 'u3', businessName: 'Quick Fix Plumbing',
    description: 'Professional plumbing services with 10+ years experience.',
    category: 'Plumbing', subServices: ['Pipe Repair','Drain Cleaning','Water Heater Installation','Leak Detection'],
    counties: ['Nairobi','Kiambu'], city: 'Nairobi', basePrice: 1500, priceUnit: 'per hour',
    rating: 4.8, reviewCount: 127, isVerified: true, isApproved: true, documents: {}, createdAt: '2024-01-20',
  },
  {
    id: 'p2', userId: 'u5', businessName: 'Mwangi Electricals',
    description: 'Licensed electricians providing residential and commercial electrical services.',
    category: 'Electrical', subServices: ['Wiring Installation','Circuit Repair','Lighting Installation','Generator Setup'],
    counties: ['Nairobi','Kajiado'], city: 'Nairobi', basePrice: 2000, priceUnit: 'per hour',
    rating: 4.6, reviewCount: 89, isVerified: true, isApproved: true, documents: {}, createdAt: '2024-02-15',
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'b1', customerId: 'u1', providerId: 'p1', serviceCategory: 'Plumbing',
    subServices: ['Pipe Repair','Leak Detection'], status: 'completed',
    scheduledDate: '2024-03-10', scheduledTime: '10:00',
    address: '123 Kimathi Street, Nairobi', county: 'Nairobi', city: 'Nairobi',
    notes: 'Kitchen sink leaking', price: 3000, qrCode: 'QLINK-B1-20240310',
    createdAt: '2024-03-08', completedAt: '2024-03-10',
  },
  {
    id: 'b2', customerId: 'u2', providerId: 'p2', serviceCategory: 'Electrical',
    subServices: ['Lighting Installation'], status: 'confirmed',
    scheduledDate: '2024-03-25', scheduledTime: '14:00',
    address: '456 Moi Avenue, Mombasa', county: 'Mombasa', city: 'Mombasa',
    notes: 'Install new ceiling lights', price: 2500, qrCode: 'QLINK-B2-20240325',
    createdAt: '2024-03-20',
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'a1', title: 'Welcome to Q-LINK Kenya!',
    content: 'We are excited to launch our national service booking platform.',
    targetAudience: 'all', priority: 'high', createdAt: '2024-03-01',
  },
];

export const mockAnalytics: PlatformAnalytics = {
  totalUsers: 15420, totalProviders: 3240, totalBookings: 45680,
  totalRevenue: 128500000, bookingsToday: 127, activeBookings: 843, pendingApprovals: 23,
};

export const kenyanCounties = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 
  'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 
  'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 
  'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 
  'Comoros', 'Congo (Congo-Brazzaville)', 'Costa Rica', 'Croatia', 'Cuba', 
  'Cyprus', 'Czechia (Czech Republic)', 'Democratic Republic of the Congo', 
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 
  'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 
  'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 
  'Guyana', 'Haiti', 'Holy See', 'Honduras', 'Hungary', 'Iceland', 'India', 
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast', 
  'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 
  'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 
  'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 
  'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 
  'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 
  'Morocco', 'Mozambique', 'Myanmar (formerly Burma)', 'Namibia', 'Nauru', 
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 
  'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 
  'Palestine State', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 
  'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 
  'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 
  'United States of America', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 
  'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];
