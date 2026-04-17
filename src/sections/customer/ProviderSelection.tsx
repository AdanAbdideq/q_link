import { useState } from 'react';
import { ArrowLeft, MapPin, Star, Filter, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServiceCategories, useProvidersByCategory } from '@/hooks/useSupabase';

interface ProviderSelectionProps {
  serviceId: string;
  onBack: () => void;
  onSelectProvider: (providerId: string) => void;
}

export default function ProviderSelection({ serviceId, onBack, onSelectProvider }: ProviderSelectionProps) {
  const [sortBy, setSortBy] = useState<'rating' | 'price'>('rating');

  const { data: categories } = useServiceCategories();
  const category = (categories ?? []).find(c => c.id === serviceId);
  const { data: providers, loading } = useProvidersByCategory(category?.name ?? null);

  const sorted = [...(providers ?? [])].sort((a, b) =>
    sortBy === 'rating' ? b.rating - a.rating : a.base_price - b.base_price
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
              <h1 className="text-xl font-bold text-white">{category?.name ?? 'Service'} Providers</h1>
              <p className="text-sm text-slate-400">{sorted.length} providers available</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'rating' | 'price')}
              className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm focus:outline-none focus:border-cyan-500">
              <option value="rating">Sort by Rating</option>
              <option value="price">Sort by Price</option>
            </select>
            <Button variant="outline" className="border-slate-700 text-white">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Filter className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No providers yet</h3>
            <p className="text-slate-400">No approved providers for this category in your area yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((provider) => (
              <div key={provider.id}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-cyan-400">
                      {provider.business_name.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{provider.business_name}</h3>
                          {provider.is_verified && (
                            <CheckCircle className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-medium text-white">{provider.rating.toFixed(1)}</span>
                          <span className="text-sm text-slate-500">({provider.review_count} reviews)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">KES {provider.base_price.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{provider.price_unit}</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{provider.description}</p>

                    {/* Sub-services */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(provider.sub_services ?? []).slice(0, 4).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 text-xs">{s}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {provider.city} · {(provider.counties ?? []).join(', ')}
                      </div>
                      <Button onClick={() => onSelectProvider(provider.id)}
                        className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white border-0 h-9 px-5">
                        Book Now
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
