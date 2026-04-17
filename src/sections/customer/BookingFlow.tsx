import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useServiceCategories, useProvider, createBooking } from '@/hooks/useSupabase';
import { useAuth } from '@/context/AuthContext';
import { kenyanCounties } from '@/data/mockData';

interface BookingFlowProps {
  serviceId: string;
  providerId: string;
  onBack: () => void;
  onComplete: () => void;
}

export default function BookingFlow({ serviceId, providerId, onBack, onComplete }: BookingFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [county, setCounty] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const { data: categories } = useServiceCategories();
  const { data: provider } = useProvider(providerId);
  const category = (categories ?? []).find(c => c.id === serviceId);

  const canProceed = () => {
    if (step === 1) return date && time;
    if (step === 2) return county && city && address && phone;
    return true;
  };

  const handleSubmit = async () => {
    if (!user || !provider || !category) return;
    setIsLoading(true);
    try {
      const qrCode = `QLINK-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      await createBooking({
        customer_id: user.id,
        provider_id: provider.id,
        service_category: category.name,
        sub_services: [],
        status: 'pending',
        scheduled_date: date,
        scheduled_time: time,
        address,
        county,
        city,
        notes: notes || null,
        price: provider.base_price,
        qr_code: qrCode,
      });
      toast.success('Booking confirmed! The provider will be in touch shortly.');
      onComplete();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!provider || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Book Service</h1>
            <p className="text-sm text-slate-400">{provider.business_name}</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[{ num: 1, label: 'Schedule' }, { num: 2, label: 'Location' }, { num: 3, label: 'Confirm' }].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium
                ${step >= s.num ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span className={`ml-2 text-sm ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
              {i < 2 && <div className="w-16 h-0.5 bg-slate-700 mx-4" />}
            </div>
          ))}
        </div>

        {/* Step 1: Schedule */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <h2 className="text-lg font-semibold text-white mb-5">Choose Date & Time</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-12 bg-slate-700/50 border-slate-600 text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                      className="pl-12 bg-slate-700/50 border-slate-600 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={() => setStep(2)} disabled={!canProceed()}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 text-white border-0 h-12">
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <h2 className="text-lg font-semibold text-white mb-5">Service Location</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">County</label>
                    <select value={county} onChange={(e) => setCounty(e.target.value)}
                      className="w-full h-10 px-3 rounded-md bg-slate-700/50 border border-slate-600 text-white text-sm">
                      <option value="">Select county...</option>
                      {kenyanCounties.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">City / Town</label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Nairobi"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Street Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input value={address} onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter full address"
                      className="pl-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                      className="pl-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes (optional)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-sm placeholder:text-slate-500 resize-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-slate-700 text-white h-12">Back</Button>
              <Button onClick={() => setStep(3)} disabled={!canProceed()}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 text-white border-0 h-12">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <h2 className="text-lg font-semibold text-white mb-5">Confirm Booking</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Service</span>
                  <span className="text-white font-medium">{category.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Provider</span>
                  <span className="text-white font-medium">{provider.business_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Date & Time</span>
                  <span className="text-white font-medium">{date} at {time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Location</span>
                  <span className="text-white font-medium text-right max-w-48">{address}, {city}</span>
                </div>
                {notes && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Notes</span>
                    <span className="text-white font-medium text-right max-w-48">{notes}</span>
                  </div>
                )}
                <div className="border-t border-slate-700 pt-4 flex justify-between">
                  <span className="text-white font-semibold">Total Estimate</span>
                  <span className="text-xl font-bold text-cyan-400">KES {provider.base_price.toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-500">Final price will be confirmed by the provider. Payment via M-Pesa on completion.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-slate-700 text-white h-12">Back</Button>
              <Button onClick={handleSubmit} disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 text-white border-0 h-12">
                {isLoading ? 'Confirming...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
