import { Users, Briefcase, Calendar, BarChart3, Megaphone, CheckCircle, LogOut, Bell, Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePlatformAnalytics } from '@/hooks/useSupabase';
import type { AnyView } from '@/store/appStore';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate: (view: AnyView) => void;
}

export default function AdminDashboard({ onLogout, onNavigate }: AdminDashboardProps) {
  const { data: analytics, loading } = usePlatformAnalytics();

  const stats = analytics ? [
    { id: 'users',    label: 'Total Users',       value: analytics.totalUsers.toLocaleString(),                      icon: Users,    color: 'from-violet-500 to-purple-600' },
    { id: 'providers',label: 'Active Providers',  value: analytics.totalProviders.toLocaleString(),                  icon: Briefcase,color: 'from-cyan-500 to-teal-600' },
    { id: 'bookings', label: 'Total Bookings',    value: analytics.totalBookings.toLocaleString(),                   icon: Calendar, color: 'from-emerald-500 to-green-600' },
    { id: 'revenue',  label: 'Platform Revenue',  value: `KES ${(analytics.totalRevenue / 1_000_000).toFixed(1)}M`, icon: BarChart3,color: 'from-amber-500 to-orange-600' },
  ] : [];

  const quickActions = [
    { id: 'approvals',     label: 'Provider Approvals', icon: CheckCircle, count: analytics?.pendingApprovals, color: 'bg-emerald-500' },
    { id: 'users',         label: 'User Management',    icon: Users,       count: null,                        color: 'bg-violet-500' },
    { id: 'announcements', label: 'Announcements',      icon: Megaphone,   count: null,                        color: 'bg-amber-500' },
    { id: 'analytics',     label: 'Analytics',          icon: BarChart3,   count: null,                        color: 'bg-cyan-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Q-LINK Admin</span>
              <p className="text-xs text-slate-400">Platform Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search..." className="pl-9 h-9 bg-slate-800/50 border-slate-700 text-white text-sm" />
            </div>
            <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors relative">
              <Bell className="w-5 h-5 text-slate-400" />
              {(analytics?.pendingApprovals ?? 0) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full" />
              )}
            </button>
            <button onClick={onLogout} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <LogOut className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Platform Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-slate-800/50 animate-pulse" />
              ))
            ) : stats.map((stat) => (
              <div key={stat.id} className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
                  <TrendingUp className="w-3 h-3" /> Live data
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Today Snapshot */}
        {analytics && (
          <section className="mb-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                <p className="text-3xl font-bold text-cyan-400">{analytics.bookingsToday}</p>
                <p className="text-sm text-slate-400 mt-1">Bookings Today</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                <p className="text-3xl font-bold text-violet-400">{analytics.activeBookings}</p>
                <p className="text-sm text-slate-400 mt-1">Active Bookings</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                <p className="text-3xl font-bold text-amber-400">{analytics.pendingApprovals}</p>
                <p className="text-sm text-slate-400 mt-1">Pending Approvals</p>
              </div>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Management</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button key={action.id} onClick={() => onNavigate(action.id as AnyView)}
                className="relative p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all text-left group hover:bg-slate-800">
                {action.count !== null && action.count !== undefined && action.count > 0 && (
                  <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-pink-500 text-white text-xs font-bold">
                    {action.count}
                  </span>
                )}
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white">{action.label}</h3>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
