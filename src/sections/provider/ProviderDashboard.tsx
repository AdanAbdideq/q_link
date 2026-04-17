import { Briefcase, Calendar, DollarSign, LogOut, Bell, Settings, QrCode, TrendingUp, CheckCircle } from 'lucide-react';
import { useMyProviderProfile, useProviderBookings } from '@/hooks/useSupabase';
import { useAuth } from '@/context/AuthContext';
import type { AnyView } from '@/store/appStore';

interface ProviderDashboardProps {
  onLogout: () => void;
  onNavigate: (view: AnyView) => void;
}

export default function ProviderDashboard({ onLogout, onNavigate }: ProviderDashboardProps) {
  const { profile } = useAuth();
  const { data: provider, loading: provLoading } = useMyProviderProfile();
  const { data: bookings, loading: bookingsLoading } = useProviderBookings(provider?.id ?? null);

  const pendingBookings = (bookings ?? []).filter(b => b.status === 'pending');
  const confirmedBookings = (bookings ?? []).filter(b => b.status === 'confirmed');
  const completedBookings = (bookings ?? []).filter(b => b.status === 'completed');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0);

  const loading = provLoading || bookingsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Q-LINK</span>
              <p className="text-xs text-slate-400">Provider Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors relative">
              <Bell className="w-5 h-5 text-slate-400" />
              {pendingBookings.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full" />}
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
            <button onClick={onLogout} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <LogOut className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : !provider ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Profile Pending Approval</h3>
            <p className="text-slate-400">Your provider profile is being reviewed. You'll be notified once approved.</p>
          </div>
        ) : (
          <>
            {/* Provider Profile Card */}
            <section className="mb-8">
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-bold text-emerald-400">{provider.business_name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-white">{provider.business_name}</h2>
                      {provider.is_verified && <CheckCircle className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />}
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{profile?.name}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{provider.category}</span>
                      {!provider.is_approved && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">Pending Approval</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">KES {provider.base_price.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{provider.price_unit}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Pending', value: pendingBookings.length, icon: Calendar, color: 'from-amber-500 to-orange-500' },
                { label: 'Confirmed', value: confirmedBookings.length, icon: CheckCircle, color: 'from-cyan-500 to-teal-500' },
                { label: 'Completed', value: completedBookings.length, icon: TrendingUp, color: 'from-emerald-500 to-green-500' },
                { label: 'Earnings', value: `KES ${(totalEarnings / 1000).toFixed(1)}K`, icon: DollarSign, color: 'from-pink-500 to-rose-500' },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </section>

            {/* Quick Nav */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'My Services', view: 'services', icon: Briefcase, color: 'from-emerald-500 to-green-500' },
                { label: 'Bookings', view: 'bookings', icon: Calendar, color: 'from-cyan-500 to-teal-500' },
                { label: 'Scan QR', view: 'scanner', icon: QrCode, color: 'from-violet-500 to-purple-500' },
                { label: 'Earnings', view: 'bookings', icon: DollarSign, color: 'from-amber-500 to-orange-500' },
              ].map((item) => (
                <button key={item.label} onClick={() => onNavigate(item.view as AnyView)}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all text-left">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </button>
              ))}
            </section>

            {/* Recent Bookings */}
            {pendingBookings.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Pending Bookings ({pendingBookings.length})</h2>
                <div className="space-y-3">
                  {pendingBookings.slice(0, 3).map((b) => (
                    <div key={b.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{b.service_category}</p>
                        <p className="text-sm text-slate-400">{b.scheduled_date} · {b.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">KES {b.price.toLocaleString()}</p>
                        <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">Pending</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => onNavigate('bookings')}
                    className="w-full py-3 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    View all bookings →
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
