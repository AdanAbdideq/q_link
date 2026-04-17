import { ArrowRight, MapPin, User, Briefcase, Shield } from 'lucide-react';
import type { UserRole } from '@/App';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

const roles = [
  {
    id: 'customer' as UserRole,
    title: 'Customer',
    description: 'Book trusted service providers across Kenya',
    icon: User,
    color: 'from-cyan-500 to-teal-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    features: ['Book services instantly', 'Track bookings in real-time', 'Pay securely via M-Pesa', 'Rate and review providers'],
  },
  {
    id: 'provider' as UserRole,
    title: 'Service Provider',
    description: 'List your services and grow your business',
    icon: Briefcase,
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    features: ['List unlimited services', 'Manage bookings easily', 'Get verified badge', 'Receive payments securely'],
  },
  {
    id: 'admin' as UserRole,
    title: 'Administrator',
    description: 'Manage the platform and oversee operations',
    icon: Shield,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    features: ['Approve providers', 'Manage users', 'View analytics', 'Send announcements'],
  },
];

export default function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Q-LINK</span>
            <p className="text-xs text-slate-400">Kenya's Service Marketplace</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Connect. Book.{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Get it Done.
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Kenya's trusted platform for booking home and business services across all 47 counties.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className={`p-6 rounded-2xl ${role.bgColor} border ${role.borderColor} 
                hover:border-opacity-60 transition-all text-left group
                hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} 
                flex items-center justify-center mb-5`}>
                <role.icon className="w-7 h-7 text-white" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">{role.title}</h2>
              <p className="text-slate-400 text-sm mb-5">{role.description}</p>

              <ul className="space-y-2 mb-6">
                {role.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${role.color}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className={`flex items-center gap-2 text-sm font-medium
                bg-gradient-to-r ${role.color} bg-clip-text text-transparent`}>
                Get Started
                <ArrowRight className="w-4 h-4 text-current group-hover:translate-x-1 transition-transform" style={{ color: 'rgb(6 182 212)' }} />
              </div>
            </button>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-sm mt-12">
          Serving all 47 counties · Secure payments via M-Pesa · 24/7 support
        </p>
      </main>
    </div>
  );
}