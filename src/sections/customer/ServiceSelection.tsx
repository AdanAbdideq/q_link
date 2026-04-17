import { useState } from 'react';
import { ArrowLeft, Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useServiceCategories } from '@/hooks/useSupabase';

interface ServiceSelectionProps {
  onBack: () => void;
  onSelectService: (serviceId: string) => void;
}

export default function ServiceSelection({ onBack, onSelectService }: ServiceSelectionProps) {
  const [query, setQuery] = useState('');
  const { data: categories, loading } = useServiceCategories();

  const filtered = (categories ?? []).filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    (c.description ?? '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Select a Service</h1>
            <p className="text-sm text-slate-400">Choose from our service categories</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative max-w-xl mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services..."
            className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-white" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cat) => (
              <button key={cat.id} onClick={() => onSelectService(cat.id)}
                className="group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 transition-all text-left">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${cat.color}20` }}>
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: cat.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{cat.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">{cat.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span>Available nationwide</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400">No services match "{query}"</p>
          </div>
        )}
      </main>
    </div>
  );
}
