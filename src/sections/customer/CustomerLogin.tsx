import { useState } from 'react';
import { ArrowLeft, Phone, Lock, Eye, EyeOff, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { kenyanCounties } from '@/data/mockData';

interface CustomerLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

type Mode = 'signin' | 'signup';

export default function CustomerLogin({ onLogin, onBack }: CustomerLoginProps) {
  const { signInWithPhone, signUpCustomer } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [county, setCounty] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) { toast.error('Please fill in all fields'); return; }
    setIsLoading(true);
    try {
      await signInWithPhone(phone, password);
      toast.success('Welcome back!');
      onLogin();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Sign in failed';
      if (errorMsg.includes('Invalid login')) {
        toast.error('Phone number or password is incorrect');
      } else if (errorMsg.includes('Email not confirmed')) {
        toast.error('Please confirm your email before logging in');
      } else {
        toast.error(errorMsg);
      }
    } finally { setIsLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !city || !county) { toast.error('Please fill in all fields'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setIsLoading(true);
    try {
      await signUpCustomer({ name, email, phone, password, city, county });
      toast.success('Account created! You can now sign in.');
      setMode('signin');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {mode === 'signin' ? 'Customer Login' : 'Create Account'}
            </h1>
            <p className="text-slate-400">{mode === 'signin' ? 'Sign in to book services' : 'Join Q-LINK today'}</p>
          </div>

          <div className="flex rounded-lg bg-slate-700/50 p-1 mb-6">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all
                  ${mode === m ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}>
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
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 text-white border-0 h-12">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Kamau"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 7XX XXX XXX"
                    className="pl-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">County</label>
                  <select value={county} onChange={(e) => setCounty(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-slate-700/50 border border-slate-600 text-white text-sm">
                    <option value="">Select...</option>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="pl-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
              </div>
              <Button type="submit" disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 text-white border-0 h-12 mt-2">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
