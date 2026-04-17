import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, MapPin, Briefcase, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAllProviders, approveProvider, rejectProvider } from '@/hooks/useSupabase';

interface ProviderApprovalsProps {
  onBack: () => void;
}

export default function ProviderApprovals({ onBack }: ProviderApprovalsProps) {
  const [query, setQuery] = useState('');
  const { data: providers, loading, refetch } = useAllProviders();

  const pending = (providers ?? []).filter(p =>
    !p.is_approved &&
    (p.business_name.toLowerCase().includes(query.toLowerCase()) ||
     p.city?.toLowerCase().includes(query.toLowerCase()) ||
     p.category.toLowerCase().includes(query.toLowerCase()))
  );

  const handleApprove = async (id: string, name: string) => {
    try {
      await approveProvider(id);
      toast.success(`${name} approved`);
      refetch();
    } catch {
      toast.error('Failed to approve provider');
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      await rejectProvider(id);
      toast.success(`${name} rejected`);
      refetch();
    } catch {
      toast.error('Failed to reject provider');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Provider Approvals</h1>
              <p className="text-sm text-slate-400">{pending.length} pending</p>
            </div>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search providers..."
              className="pl-9 h-9 bg-slate-800/50 border-slate-700 text-white text-sm" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
            <p className="text-slate-400">No pending provider approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((provider) => (
              <div key={provider.id} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-emerald-400">{provider.business_name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{provider.business_name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{provider.category}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{provider.city}</span>
                        </div>
                      </div>
                      <span className="text-sm text-slate-400">KES {provider.base_price.toLocaleString()} / {provider.price_unit}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{provider.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(provider.sub_services ?? []).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs">{s}</span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => handleReject(provider.id, provider.business_name)}
                        variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                      <Button onClick={() => handleApprove(provider.id, provider.business_name)}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0">
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
