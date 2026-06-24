import { useState } from 'react';
import {
  Heart, Award, AlertTriangle, Plus, Trash2, StickyNote
} from 'lucide-react';
import type { Murid, CatatanPerilaku } from '../types';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { cn } from '../lib/utils';

interface PerilakuPageProps {
  muridList: Murid[];
  perilakuList: CatatanPerilaku[];
  onAddPerilaku: (perilaku: Omit<CatatanPerilaku, 'id' | 'user_id' | 'created_at'>) => void;
  onDeletePerilaku: (id: string) => void;
}

export default function PerilakuPage({ muridList, perilakuList, onAddPerilaku, onDeletePerilaku }: PerilakuPageProps) {
  const [filterKelas, setFilterKelas] = useState('');
  const [selectedMurid, setSelectedMurid] = useState<Murid | null>(null);
  const [jenis, setJenis] = useState<'prestasi' | 'pelanggaran' | 'catatan'>('catatan');
  const [catatan, setCatatan] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const kelasList = [...new Set(muridList.map(m => m.kelas))].sort();
  const muridFiltered = muridList.filter(m => m.kelas === filterKelas);

  const perilakuMurid = perilakuList
    .filter(p => p.murid_id === selectedMurid?.id)
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMurid || !catatan.trim()) return;
    onAddPerilaku({
      murid_id: selectedMurid.id,
      jenis,
      catatan: catatan.trim(),
    });
    setCatatan('');
  };

  const jenisConfig = {
    prestasi: { icon: Award, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Prestasi' },
    pelanggaran: { icon: AlertTriangle, color: 'rose', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Pelanggaran' },
    catatan: { icon: StickyNote, color: 'sky', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Catatan' },
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h2 className="section-title">Catatan Perilaku & Akhlak</h2>
        <p className="section-subtitle">Pantau perkembangan karakter, kedisiplinan, dan takzir santri</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Panel */}
        <div className="space-y-4">
          <div className="card p-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pilih Kelas</label>
            <select
              className="input-field"
              value={filterKelas}
              onChange={e => { setFilterKelas(e.target.value); setSelectedMurid(null); }}
            >
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map(k => <option key={k} value={k}>Kelas {k}</option>)}
            </select>
          </div>

          {filterKelas && (
            <div className="card p-4">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pilih Santri</label>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {muridFiltered.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMurid(m)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all border',
                      selectedMurid?.id === m.id
                        ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-md'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-100'
                    )}
                  >
                    {m.nama}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedMurid ? (
            <>
              {/* Form */}
              <div className="card p-5">
                <h3 className="font-bold text-slate-800 mb-4">
                  Catatan untuk: <span className="text-emerald-600">{selectedMurid.nama}</span>
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jenis Catatan</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(jenisConfig) as Array<keyof typeof jenisConfig>).map(j => {
                        const config = jenisConfig[j];
                        const Icon = config.icon;
                        return (
                          <button
                            key={j}
                            type="button"
                            onClick={() => setJenis(j)}
                            className={cn(
                              'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all border',
                              jenis === j
                                ? `${config.bg} ${config.text} ${config.border} ring-2 ring-offset-1`
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Catatan</label>
                    <textarea
                      rows={3}
                      className="input-field resize-none"
                      placeholder="Tulis catatan perilaku, prestasi, atau pelanggaran..."
                      value={catatan}
                      onChange={e => setCatatan(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Simpan Catatan
                    </button>
                  </div>
                </form>
              </div>

              {/* History */}
              <div className="card p-5">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-slate-400" />
                  Histori Perilaku Santri
                </h3>
                <div className="space-y-3">
                  {perilakuMurid.map(p => {
                    const config = jenisConfig[p.jenis];
                    const Icon = config.icon;
                    return (
                      <div key={p.id} className={cn(
                        'p-4 rounded-xl border relative group transition-all hover:shadow-sm',
                        config.bg, config.border
                      )}>
                        <button
                          onClick={() => setConfirmDelete(p.id)}
                          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/50 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={cn('w-4 h-4', config.text)} />
                          <span className={cn('text-xs font-bold uppercase', config.text)}>
                            {config.label}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-auto">
                            {new Date(p.created_at || '').toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium text-sm leading-relaxed pr-8">{p.catatan}</p>
                      </div>
                    );
                  })}
                  {perilakuMurid.length === 0 && (
                    <EmptyState
                      title="Belum ada catatan"
                      description="Belum ada rekam jejak perilaku tercatat"
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card border-dashed border-slate-200 p-12 text-center">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">
                Pilih kelas dan santri di sebelah kiri untuk melihat rekam perilaku
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { confirmDelete && onDeletePerilaku(confirmDelete); setConfirmDelete(null); }}
        title="Hapus Catatan"
        message="Apakah Anda yakin ingin menghapus catatan ini?"
      />
    </div>
  );
}
