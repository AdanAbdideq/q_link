import { useState } from 'react';
import { ArrowLeft, Search, User, Briefcase, Shield, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAllUsers } from '@/hooks/useSupabase';

interface UserManagementProps {
  onBack: () => void;
}

const roleConfig = {
  customer: { label: 'Customer', color: 'bg-cyan-500/20 text-cyan-400', icon: User },
  provider: { label: 'Provider', color: 'bg-emerald-500/20 text-emerald-400', icon: Briefcase },
  admin:    { label: 'Admin',    color: 'bg-pink-500/20 text-pink-400',   icon: Shield },
};

export default function UserManagement({ onBack }: UserManagementProps) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'provider' | 'admin'>('all');
  const { data: users, loading } = useAllUsers();

  const filtered = (users ?? []).filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(query.toLowerCase()) ||
     u.phone?.toLowerCase().includes(query.toLowerCase()) ||
     u.county?.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">User Management</h1>
              <p className="text-sm text-slate-400">{filtered.length} users</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 text-sm focus:outline-none">
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="provider">Providers</option>
              <option value="admin">Admins</option>
            </select>
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-9 h-9 bg-slate-800/50 border-slate-700 text-white text-sm" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400">No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((user) => {
              const role = roleConfig[user.role as keyof typeof roleConfig] ?? roleConfig.customer;
              const RoleIcon = role.icon;
              return (
                <div key={user.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-slate-300">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{user.name}</h3>
                      <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-400">
                        <span>{user.phone}</span>
                        {user.county && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.county}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${role.color}`}>
                      <RoleIcon className="w-3 h-3" />{role.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
