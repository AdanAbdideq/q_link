import { useState } from 'react';
import { ArrowLeft, Megaphone, Plus, Send, Eye, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAnnouncements, createAnnouncement, deleteAnnouncement } from '@/hooks/useSupabase';
import type { DbAnnouncement } from '@/lib/supabase';

interface AnnouncementsProps {
  onBack: () => void;
}

export default function Announcements({ onBack }: AnnouncementsProps) {
  const { data: announcements, loading, refetch } = useAnnouncements();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    target_audience: 'all' as DbAnnouncement['target_audience'],
    priority: 'medium' as DbAnnouncement['priority'],
    expires_at: '',
  });

  const handleCreate = async () => {
    if (!form.title || !form.content) { toast.error('Title and message are required'); return; }
    setSaving(true);
    try {
      await createAnnouncement({
        title: form.title,
        content: form.content,
        target_audience: form.target_audience,
        priority: form.priority,
        expires_at: form.expires_at || null,
      });
      toast.success('Announcement published!');
      setForm({ title: '', content: '', target_audience: 'all', priority: 'medium', expires_at: '' });
      setShowModal(false);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create announcement');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      toast.success('Announcement deleted');
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const audienceBadge = (a: DbAnnouncement) => {
    const map = {
      all: 'bg-violet-500/20 text-violet-400',
      customers: 'bg-cyan-500/20 text-cyan-400',
      providers: 'bg-emerald-500/20 text-emerald-400',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs ${map[a.target_audience]}`}>{a.target_audience}</span>;
  };

  const priorityBadge = (p: DbAnnouncement['priority']) => {
    const map = { high: 'bg-rose-500/20 text-rose-400', medium: 'bg-amber-500/20 text-amber-400', low: 'bg-slate-500/20 text-slate-400' };
    return <span className={`px-2 py-0.5 rounded-full text-xs ${map[p]}`}>{p}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Announcements</h1>
              <p className="text-sm text-slate-400">{announcements?.length ?? 0} total</p>
            </div>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-pink-500 hover:bg-pink-600">
            <Plus className="w-4 h-4 mr-2" /> New Announcement
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: announcements?.length ?? 0, color: 'text-violet-400' },
            { label: 'High Priority', value: announcements?.filter(a => a.priority === 'high').length ?? 0, color: 'text-rose-400' },
            { label: 'For Providers', value: announcements?.filter(a => a.target_audience !== 'customers').length ?? 0, color: 'text-emerald-400' },
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {(announcements ?? []).map((a) => (
              <div key={a.id} className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                      <Megaphone className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{a.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {audienceBadge(a)}
                        {priorityBadge(a.priority)}
                        <span className="text-xs text-slate-500">{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(a.id)}
                    className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-400 text-sm line-clamp-2">{a.content}</p>
                {a.expires_at && (
                  <p className="text-xs text-amber-400 mt-2">Expires: {new Date(a.expires_at).toLocaleDateString()}</p>
                )}
              </div>
            ))}

            {(announcements ?? []).length === 0 && (
              <div className="text-center py-16">
                <Megaphone className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No announcements yet</h3>
                <p className="text-slate-400 mb-6">Create your first announcement to reach users</p>
                <Button onClick={() => setShowModal(true)} className="bg-pink-500 hover:bg-pink-600">
                  <Plus className="w-4 h-4 mr-2" /> Create Announcement
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-xl font-bold text-white">New Announcement</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Announcement title" className="bg-slate-800/50 border-slate-700 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message *</label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Enter your message..." className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Audience</label>
                  <select value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value as DbAnnouncement['target_audience'] })}
                    className="w-full h-10 px-3 rounded-md bg-slate-800/50 border border-slate-700 text-white text-sm">
                    <option value="all">All Users</option>
                    <option value="customers">Customers</option>
                    <option value="providers">Providers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as DbAnnouncement['priority'] })}
                    className="w-full h-10 px-3 rounded-md bg-slate-800/50 border border-slate-700 text-white text-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Expires At (optional)</label>
                <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700/50 flex gap-3">
              <Button variant="outline" className="flex-1 border-slate-700 text-white" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button disabled={saving} onClick={handleCreate} className="flex-1 bg-pink-500 hover:bg-pink-600">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Publish</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
