import { useState } from 'react';
import {
  Users, Plus, Search, Pencil, Trash2, GraduationCap, MapPin, Home,
  Filter
} from 'lucide-react';
import type { Murid } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
// cn utility available if needed for class merging

interface MuridPageProps {
  muridList: Murid[];
  onAdd: (murid: Omit<Murid, 'id' | 'user_id' | 'created_at'>) => void;
  onUpdate: (id: string, murid: Partial<Murid>) => void;
  onDelete: (id: string) => void;
}

export default function MuridPage({ muridList, onAdd, onUpdate, onDelete }: MuridPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [form, setForm] = useState({ nama: '', kelas: '', domisili: '', alamat: '' });

  const kelasList = [...new Set(muridList.map(m => m.kelas))].sort();

  const filteredMurid = muridList.filter(m => {
    const matchSearch = m.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKelas = !filterKelas || m.kelas === filterKelas;
    return matchSearch && matchKelas;
  });

  // Stats computed from filtered data

  const openAdd = () => {
    setEditingId(null);
    setForm({ nama: '', kelas: '', domisili: '', alamat: '' });
    setShowModal(true);
  };

  const openEdit = (murid: Murid) => {
    setEditingId(murid.id);
    setForm({
      nama: murid.nama,
      kelas: murid.kelas,
      domisili: murid.domisili || '',
      alamat: murid.alamat || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.kelas) return;

    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    setShowModal(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Data Santri</h2>
          <p className="section-subtitle">Kelola data murid dan kelas</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm w-fit">
          <Plus className="w-4 h-4" />
          Tambah Santri
        </button>
      </div>

      {/* Stats Cards */}
      {muridList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{muridList.length}</p>
                <p className="text-xs text-slate-500 font-medium">Total Santri</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{kelasList.length}</p>
                <p className="text-xs text-slate-500 font-medium">Jumlah Kelas</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Cari nama santri..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            className="input-field pl-10 pr-8 min-w-[160px]"
            value={filterKelas}
            onChange={e => setFilterKelas(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {kelasList.map(k => <option key={k} value={k}>Kelas {k}</option>)}
          </select>
        </div>
      </div>

      {/* Murid List */}
      {filteredMurid.length === 0 ? (
        <EmptyState
          title={searchQuery || filterKelas ? 'Tidak ditemukan' : 'Belum ada santri'}
          description={searchQuery || filterKelas ? 'Coba ubah kata kunci atau filter' : 'Mulai tambahkan data santri'}
          icon={<Users className="w-8 h-8 text-slate-300" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMurid.map(murid => (
            <div key={murid.id} className="card card-hover p-4 relative group">
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(murid)}
                  className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDelete(murid.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-lg shrink-0">
                  {murid.nama.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm truncate">{murid.nama}</h3>
                  <span className="badge badge-success text-[10px] mt-1">Kelas {murid.kelas}</span>
                  {murid.domisili && (
                    <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {murid.domisili}
                    </p>
                  )}
                  {murid.alamat && (
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Home className="w-3 h-3" /> {murid.alamat}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Data Santri' : 'Tambah Santri Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Lengkap *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Nama santri"
              value={form.nama}
              onChange={e => setForm({ ...form, nama: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kelas *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Contoh: 3A"
              value={form.kelas}
              onChange={e => setForm({ ...form, kelas: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Domisili</label>
            <input
              type="text"
              className="input-field"
              placeholder="Contoh: Pondok"
              value={form.domisili}
              onChange={e => setForm({ ...form, domisili: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Alamat</label>
            <textarea
              rows={2}
              className="input-field resize-none"
              placeholder="Alamat lengkap"
              value={form.alamat}
              onChange={e => setForm({ ...form, alamat: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            {editingId ? 'Simpan Perubahan' : 'Tambah Santri'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && onDelete(confirmDelete)}
        title="Hapus Santri"
        message="Data santri beserta absensi dan nilainya akan terhapus. Lanjutkan?"
      />
    </div>
  );
}
