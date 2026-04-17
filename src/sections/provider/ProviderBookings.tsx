import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMyProviderProfile, useProviderBookings, updateBookingStatus } from '@/hooks/useSupabase';

interface ProviderBookingsProps {
  onBack: () => void;
}

const statusConfig = {
  pending:     { label: 'Pending',     color: 'bg-amber-500/20 text-amber-400',     icon: Clock },
  confirmed:   { label: 'Confirmed',   color: 'bg-cyan-500/20 text-cyan-400',       icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-violet-500/20 text-violet-400',   icon: Loader2 },
  completed:   { label: 'Completed',   color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
  cancelled:   { label: 'Cancelled',   color: 'bg-rose-500/20 text-rose-400',       icon: XCircle },
};

type FilterType = 'all' | 'pending' | 'confirmed' | 'completed';

export default function ProviderBookings({ onBack }: ProviderBookingsProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const { data: provider } = useMyProviderProfile();
  const { data: bookings, loading, refetch } = useProviderBookings(provider?.id ?? null);

  const displayed = (bookings ?? []).filter(b => filter === 'all' || b.status === filter);

  const handleStatusChange = async (id: string, newStatus: 'confirmed' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      await updateBookingStatus(id, newStatus);
      toast.success(`Booking ${newStatus}`);
      refetch();
    } catch {
      toast.error('Failed to update booking');
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
              <h1 className="text-xl font-bold text-white">Bookings</h1>
              <p className="text-sm text-slate-400">{displayed.length} bookings</p>
            </div>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm focus:outline-none">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No bookings</h3>
            <p className="text-slate-400">No {filter !== 'all' ? filter : ''} bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((booking) => {
              const status = statusConfig[booking.status];
              const StatusIcon = status.icon;
              return (
                <div key={booking.id} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{booking.service_category}</h3>
                      <p className="text-sm text-slate-400">{booking.sub_services?.join(', ')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />{status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{booking.scheduled_date} · {booking.scheduled_time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{booking.address}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">KES {booking.price.toLocaleString()}</span>
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">Decline</Button>
                          <Button size="sm" onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0">Accept</Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button size="sm" onClick={() => handleStatusChange(booking.id, 'in_progress')}
                          className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">Start Service</Button>
                      )}
                      {booking.status === 'in_progress' && (
                        <Button size="sm" onClick={() => handleStatusChange(booking.id, 'completed')}
                          className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0">Mark Complete</Button>
                      )}
                    </div>
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
