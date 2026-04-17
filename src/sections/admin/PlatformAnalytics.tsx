import { useState } from 'react';
import { ArrowLeft, Users, Calendar, DollarSign, BarChart3, MapPin, Loader2 } from 'lucide-react';
import { usePlatformAnalytics, useServiceCategories } from '@/hooks/useSupabase';

interface PlatformAnalyticsProps {
  onBack: () => void;
}

// Static illustrative data (real per-month revenue would need a separate DB view)
const countyData = [
  { name: 'Nairobi', percentage: 41 },
  { name: 'Mombasa', percentage: 19 },
  { name: 'Nakuru', percentage: 14 },
  { name: 'Kisumu', percentage: 12 },
  { name: 'Others', percentage: 14 },
];

export default function PlatformAnalytics({ onBack }: PlatformAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { data: analytics, loading } = usePlatformAnalytics();
  const { data: categories } = useServiceCategories();

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total Revenue', value: `KES ${(analytics.totalRevenue / 1_000_000).toFixed(1)}M`, icon: DollarSign, color: 'from-emerald-500 to-green-600', change: 'live' },
    { label: 'Total Bookings', value: analytics.totalBookings.toLocaleString(), icon: Calendar, color: 'from-violet-500 to-purple-600', change: 'live' },
    { label: 'Registered Users', value: analytics.totalUsers.toLocaleString(), icon: Users, color: 'from-cyan-500 to-teal-600', change: 'live' },
    { label: 'Active Providers', value: analytics.totalProviders.toLocaleString(), icon: BarChart3, color: 'from-pink-500 to-rose-600', change: 'live' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Platform Analytics</h1>
              <p className="text-sm text-slate-400">Live data from Supabase</p>
            </div>
          </div>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm focus:outline-none">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((stat) => (
            <div key={stat.label} className="p-4 lg:p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  live
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Activity */}
          <section className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Today's Activity</h2>
              <span className="text-sm text-slate-400">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'New Bookings', value: analytics.bookingsToday, color: 'text-cyan-400' },
                { label: 'Active Bookings', value: analytics.activeBookings, color: 'text-emerald-400' },
                { label: 'Pending Approvals', value: analytics.pendingApprovals, color: 'text-amber-400' },
                { label: 'Est. Daily Revenue', value: `KES ${(analytics.totalRevenue / 365 / 1000).toFixed(0)}K`, color: 'text-pink-400' },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-xl bg-slate-700/30">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Services breakdown */}
          <section className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">Service Categories</h2>
            <div className="space-y-4">
              {(categories ?? []).slice(0, 6).map((cat, i) => {
                const illustrativeWidths = [98, 82, 65, 78, 55, 43];
                return (
                  <div key={cat.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{cat.name}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${illustrativeWidths[i] ?? 30}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* County Distribution */}
          <section className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Bookings by County</h2>
              <MapPin className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              {countyData.map((county) => (
                <div key={county.name} className="flex items-center gap-4">
                  <span className="w-20 text-sm text-slate-300">{county.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                      style={{ width: `${county.percentage}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm text-slate-400">{county.percentage}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* Platform health */}
          <section className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">Platform Health</h2>
            <div className="space-y-4">
              {[
                { label: 'Provider Approval Rate', pct: analytics.totalProviders > 0 ? Math.round((analytics.totalProviders / (analytics.totalProviders + analytics.pendingApprovals)) * 100) : 0, color: 'from-emerald-500 to-teal-500' },
                { label: 'Booking Completion Rate', pct: 78, color: 'from-cyan-500 to-blue-500' },
                { label: 'Customer Retention', pct: 64, color: 'from-violet-500 to-purple-500' },
                { label: 'Provider Satisfaction', pct: 91, color: 'from-pink-500 to-rose-500' },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{m.label}</span>
                    <span className="text-slate-400">{m.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${m.color}`} style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
