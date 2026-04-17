import { useState } from 'react';
import { ArrowLeft, QrCode, CheckCircle, XCircle, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { verifyBookingByQRCode, updateBookingStatus } from '@/hooks/useSupabase';
import type { DbBooking } from '@/lib/supabase';

interface QRScannerProps {
  onBack: () => void;
}

export default function QRScanner({ onBack }: QRScannerProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scannedBooking, setScannedBooking] = useState<DbBooking | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const booking = await verifyBookingByQRCode(code.trim());
      setScannedBooking(booking);
      toast.success('Booking verified!');
    } catch {
      setError('Invalid or unknown booking code.');
      setScannedBooking(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartService = async () => {
    if (!scannedBooking) return;
    try {
      await updateBookingStatus(scannedBooking.id, 'in_progress');
      toast.success('Service started! Booking is now in progress.');
      setScannedBooking(null);
      setCode('');
    } catch {
      toast.error('Failed to update booking status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Verify Booking</h1>
            <p className="text-sm text-slate-400">Enter the customer's booking code</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {!scannedBooking ? (
          <div className="space-y-6">
            {/* QR Scan Placeholder */}
            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-center">
              <div className="w-24 h-24 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Scan QR Code</h3>
              <p className="text-slate-400 text-sm mb-4">
                Use a QR scanner app or enter the booking code manually below.
              </p>
              <p className="text-xs text-slate-500">
                Camera-based scanning requires native app integration.
              </p>
            </div>

            {/* Manual Entry */}
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Enter Booking Code</h3>
              <div className="flex gap-3">
                <Input
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(null); }}
                  placeholder="e.g. QLINK-1234567890-ABC12"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  className="flex-1 bg-slate-700/50 border-slate-600 text-white font-mono placeholder:text-slate-500"
                />
                <Button onClick={handleVerify} disabled={isLoading || !code.trim()}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 px-6">
                  {isLoading ? '...' : 'Verify'}
                </Button>
              </div>
              {error && (
                <div className="mt-3 flex items-center gap-2 text-rose-400 text-sm">
                  <XCircle className="w-4 h-4" />{error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Verified Booking Card */}
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-3 mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Booking Verified!</h3>
                  <p className="text-sm text-emerald-400">This is a valid booking</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Service</span>
                  <span className="text-white font-medium">{scannedBooking.service_category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-medium ${scannedBooking.status === 'confirmed' ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {scannedBooking.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" />Date</span>
                  <span className="text-white">{scannedBooking.scheduled_date} · {scannedBooking.scheduled_time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />Location</span>
                  <span className="text-white text-right max-w-48">{scannedBooking.address}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-700 pt-3">
                  <span className="text-slate-400">Booking ID</span>
                  <span className="text-white font-mono text-xs">{scannedBooking.qr_code}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setScannedBooking(null); setCode(''); }}
                className="flex-1 border-slate-700 text-white h-12">
                Scan Another
              </Button>
              {scannedBooking.status === 'confirmed' && (
                <Button onClick={handleStartService}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 h-12">
                  Start Service
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
