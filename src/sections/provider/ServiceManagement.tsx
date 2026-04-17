import { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useMyProviderProfile, updateProviderProfile } from '@/hooks/useSupabase';
import { kenyanCounties, mockServiceCategories } from '@/data/mockData';

interface ServiceManagementProps {
  onBack: () => void;
}

export default function ServiceManagement({ onBack }: ServiceManagementProps) {
  const { data: provider, loading, refetch } = useMyProviderProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('per hour');
  const [subServices, setSubServices] = useState<string[]>([]);
  const [counties, setCounties] = useState<string[]>([]);
  const [newSubService, setNewSubService] = useState('');

  useEffect(() => {
    if (provider) {
      setBusinessName(provider.business_name);
      setDescription(provider.description ?? '');
      setCategory(provider.category);
      setBasePrice(String(provider.base_price));
      setPriceUnit(provider.price_unit);
      setSubServices(provider.sub_services ?? []);
      setCounties(provider.counties ?? []);
    }
  }, [provider]);

  const handleSave = async () => {
    if (!provider) return;
    setIsSaving(true);
    try {
      await updateProviderProfile(provider.id, {
        business_name: businessName,
        description,
        category,
        base_price: parseFloat(basePrice) || 0,
        price_unit: priceUnit,
        sub_services: subServices,
        counties,
      });
      toast.success('Service details updated successfully');
      setIsEditing(false);
      refetch();
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const addSubService = () => {
    if (newSubService.trim() && !subServices.includes(newSubService.trim())) {
      setSubServices([...subServices, newSubService.trim()]);
      setNewSubService('');
    }
  };

  const removeSubService = (s: string) => setSubServices(subServices.filter(x => x !== s));
  const toggleCounty = (c: string) =>
    setCounties(counties.includes(c) ? counties.filter(x => x !== c) : [...counties, c]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">My Services</h1>
              <p className="text-sm text-slate-400">Manage your service offerings</p>
            </div>
          </div>
          <Button onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
            variant="outline" className="border-slate-700 text-white">
            {isEditing ? <><X className="w-4 h-4 mr-2" />Cancel</> : <><Edit2 className="w-4 h-4 mr-2" />Edit</>}
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Basic Info */}
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-5">Business Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Business Name</label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} disabled={!isEditing}
                className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={!isEditing}
                rows={3} className="w-full px-3 py-2 rounded-md bg-slate-700/50 border border-slate-600 text-white text-sm resize-none disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={!isEditing}
                className="w-full h-10 px-3 rounded-md bg-slate-700/50 border border-slate-600 text-white text-sm disabled:opacity-60">
                {mockServiceCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Base Price (KES)</label>
                <Input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} disabled={!isEditing}
                  className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Price Unit</label>
                <select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)} disabled={!isEditing}
                  className="w-full h-10 px-3 rounded-md bg-slate-700/50 border border-slate-600 text-white text-sm disabled:opacity-60">
                  <option value="per hour">Per hour</option>
                  <option value="per day">Per day</option>
                  <option value="per session">Per session</option>
                  <option value="per project">Per project</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-services */}
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-5">Sub-services</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {subServices.map((s) => (
              <span key={s} className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
                {s}
                {isEditing && <button onClick={() => removeSubService(s)} className="hover:text-white"><Trash2 className="w-3 h-3" /></button>}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <Input value={newSubService} onChange={(e) => setNewSubService(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSubService()}
                placeholder="Add sub-service (e.g. Pipe Repair)"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
              <Button onClick={addSubService} variant="outline" className="border-slate-600 text-white">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Counties */}
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-5">Service Counties</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {kenyanCounties.map((c) => (
              <button key={c} onClick={() => isEditing && toggleCounty(c)} disabled={!isEditing}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all
                  ${counties.includes(c)
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700/50 text-slate-400 border border-transparent'}
                  ${isEditing ? 'hover:border-slate-600 cursor-pointer' : 'cursor-default opacity-70'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {isEditing && (
          <Button onClick={handleSave} disabled={isSaving}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 h-12">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </main>
    </div>
  );
}
