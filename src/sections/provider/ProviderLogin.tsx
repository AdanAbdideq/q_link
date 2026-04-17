import { useState } from 'react';
import { ArrowLeft, Phone, Lock, Eye, EyeOff, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { kenyanCounties, mockServiceCategories } from '@/data/mockData';

interface ProviderLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

type Mode = 'signin' | 'signup';

export default function ProviderLogin({ onLogin, onBack }: ProviderLoginProps) {
  const { signInWithPhone, signUpProvider } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sign in
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Sign up
  const [name, setName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [city, setCity] = useState('');
  const [county, setCounty] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('per hour');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) { toast.error('Please fill in all fields'); return; }
    setIsLoading(true);
    try {
      await signInWithPhone(phone, password);
      toast.success('Welcome back, Provider!');
      onLogin();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed');
    } finally { setIsLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !signupPhone || !signupPassword || !city || !county || !businessName || !category) {
      toast.error('Please fill in all required fields'); return;
    }
    setIsLoading(true);
    try {
      await signUpProvider({
        name, phone: signupPhone, password: signupPassword, city, county,
        businessName, category, description,
        subServices: [], counties: [county],
        basePrice: parseFloat(basePrice) || 0,
        priceUnit,
      });
      toast.success('Registration submitted! Your account is pending admin approval.');
      setMode('signin');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {mode === 'signin' ? 'Provider Login' : 'Register as Provider'}
            </h1>
            <p className="text-slate-400">{mode === 'signin' ? 'Manage your services and bookings' : 'List your services on Q-LINK'}</p>
          </div>

          <div className="flex rounded-lg bg-slate-700/50 p-1 mb-6">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all
                  ${mode === m ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                {m === 'signin' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 7XX XXX XXX"
                    className="pl-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-12 pr-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 h-12">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Business Name *</label>
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your business"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input type="tel" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+254 7XX XXX XXX"
                    className="pl-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Service Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-slate-700/50 border border-slate-600 text-white text-sm">
                  <option value="">Select category...</option>
                  {mockServiceCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about your services..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-md bg-slate-700/50 border border-slate-600 text-white text-sm placeholder:text-slate-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">County *</label>
                  <select value={county} onChange={(e) => setCounty(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-slate-700/50 border border-slate-600 text-white text-sm">
                    <option value="">Select...</option>
                    {kenyanCounties.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">City *</label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Nairobi"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Base Price (KES)</label>
                  <Input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="1500"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Price Unit</label>
                  <select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-slate-700/50 border border-slate-600 text-white text-sm">
                    <option value="per hour">Per hour</option>
                    <option value="per day">Per day</option>
                    <option value="per session">Per session</option>
                    <option value="per project">Per project</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password *</label>
                <Input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
              </div>
              <Button type="submit" disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 h-12">
                {isLoading ? 'Submitting...' : 'Submit for Approval'}
              </Button>
              <p className="text-xs text-center text-slate-500">Your profile will be reviewed by our team within 24 hours.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
