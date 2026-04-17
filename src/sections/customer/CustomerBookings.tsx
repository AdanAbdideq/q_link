import { ArrowLeft, Calendar, MapPin, Clock, CheckCircle, XCircle, Clock3, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCustomerBookings, updateBookingStatus } from '@/hooks/useSupabase';
import { toast } from 'sonner';

interface CustomerBookingsProps {
  onBack: () => void;
}

const statusConfig = {
  pending:     { label: 'Pending',     color: 'bg-amber-500/20 text-amber-400',   icon: Clock3 },
  confirmed:   { label: 'Confirmed',   color: 'bg-cyan-500/20 text-cyan-400',     icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-violet-500/20 text-violet-400', icon: Loader2 },
  completed:   { label: 'Completed',   color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
  cancelled:   { label: 'Cancelled',   color: 'bg-rose-500/20 text-rose-400',     icon: XCircle },
};

export default function CustomerBookings({ onBack }: CustomerBookingsProps) {
  const { data: bookings, loading, refetch } = useCustomerBookings();

  const handleCancel = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, 'cancelled');
      toast.success('Booking cancelled');
      refetch();
    } catch {
      toast.error('Failed to cancel booking');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">My Bookings</h1>
            <p className="text-sm text-slate-400">{bookings?.length ?? 0} total bookings</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : (bookings ?? []).length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No bookings yet</h3>
            <p className="text-slate-400">Start by booking your first service</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(bookings ?? []).map((booking) => {
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

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="w-4 h-4" /><span>{booking.scheduled_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" /><span>{booking.scheduled_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="w-4 h-4" /><span>{booking.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-400">Total Price</span>
                    <span className="text-lg font-bold text-white">KES {booking.price.toLocaleString()}</span>
                  </div>

                  {(booking.status === 'confirmed' || booking.status === 'in_progress') && (
                    <div className="pt-4 border-t border-slate-700/50">
                      <p className="text-sm text-slate-400 mb-3">Show this QR code to your provider</p>
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-white">
                          <QRCodeSVG value={booking.qr_code} size={80} level="M" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Booking ID</p>
                          <p className="text-sm font-mono text-slate-300">{booking.qr_code}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                      <button onClick={() => handleCancel(booking.id)}
                        className="flex-1 py-2 rounded-lg bg-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/30 transition-colors">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
