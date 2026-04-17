import { Search, MapPin, Calendar, Star, LogOut, Bell, User, Briefcase, ChevronRight, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useServiceCategories, useCustomerBookings } from '@/hooks/useSupabase';

interface CustomerDashboardProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

export default function CustomerDashboard({ onLogout, onNavigate }: CustomerDashboardProps) {
  const { profile } = useAuth();
  const { data: categories, loading: catsLoading } = useServiceCategories();
  const { data: bookings, loading: bookingsLoading } = useCustomerBookings();

  const activeBookings = (bookings ?? []).filter(b => b.status === 'confirmed' || b.status === 'pending');
  const recentBookings = (bookings ?? []).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Q-LINK</span>
              <p className="text-xs text-slate-400">Customer Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors relative">
              <Bell className="w-5 h-5 text-slate-400" />
              {activeBookings.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full" />}
            </button>
            <button onClick={onLogout} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <LogOut className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <section className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome back, {profile?.name?.split(' ')[0] ?? 'there'}! 👋
          </h1>
          <p className="text-slate-400 mb-6">What service do you need today?</p>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input placeholder="Search for services..."
              className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-white text-lg" />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Briefcase, label: 'Book Service', action: () => onNavigate('services'), color: 'from-cyan-500 to-teal-500' },
              { icon: Calendar, label: 'My Bookings', action: () => onNavigate('bookings'), color: 'from-violet-500 to-purple-500' },
              { icon: User, label: 'Profile', action: () => {}, color: 'from-pink-500 to-rose-500' },
              { icon: Sparkles, label: 'Support', action: () => {}, color: 'from-emerald-500 to-green-500' },
            ].map((item) => (
              <button key={item.label} onClick={item.action}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all text-left">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-white">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Service Categories */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Service Categories</h2>
            <button onClick={() => onNavigate('services')} className="text-cyan-400 text-sm flex items-center gap-1 hover:text-cyan-300">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {catsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(categories ?? []).slice(0, 8).map((cat) => (
                <button key={cat.id} onClick={() => onNavigate('services')}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 transition-all text-left group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${cat.color}20` }}>
                    <div className="w-6 h-6 rounded-md" style={{ backgroundColor: cat.color }} />
                  </div>
                  <h3 className="font-medium text-white mb-1">{cat.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{cat.description}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Active Bookings */}
        {!bookingsLoading && activeBookings.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Active Bookings</h2>
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <div key={booking.id}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{booking.service_category}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{booking.scheduled_date}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{booking.city}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                    ${booking.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Bookings */}
        {!bookingsLoading && recentBookings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Recent Bookings</h2>
              <button onClick={() => onNavigate('bookings')} className="text-cyan-400 text-sm flex items-center gap-1 hover:text-cyan-300">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{booking.service_category}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-slate-500">{booking.scheduled_date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize block mb-2
                      ${booking.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {booking.status}
                    </span>
                    <span className="text-sm text-white font-medium">KES {booking.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!bookingsLoading && bookings?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No bookings yet</h3>
            <p className="text-slate-400 mb-6">Start by booking your first service</p>
            <button onClick={() => onNavigate('services')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-medium hover:opacity-90 transition-opacity">
              Browse Services
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
