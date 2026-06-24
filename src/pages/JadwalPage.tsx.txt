import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays, Clock, GraduationCap, MapPin, Plus, Pencil, Trash2,
  BookOpen, Bell, Sparkles
} from 'lucide-react';
import type { Jadwal } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { getHariIni, cn } from '../lib/utils';

interface JadwalPageProps {
  jadwalList: Jadwal[];
  onAdd: (jadwal: Omit<Jadwal, 'id' | 'user_id' | 'created_at'>) => void;
  onUpdate: (id: string, jadwal: Partial<Jadwal>) => void;
  onDelete: (id: string) => void;
  onSync: () => void;
}

const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function JadwalPage({ jadwalList, onAdd, onUpdate, onDelete }: JadwalPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    hari: 'Senin',
    jam_mulai: '',
    jam_selesai: '',
    kelas: '',
    pelajaran: '',
    ruangan: '',
    catatan: '',
  });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hariIni = getHariIni();

  // Jadwal hari ini untuk pengumuman
  const jadwalHariIni = useMemo(() => {
    return jadwalList
      .filter(j => j.hari === hariIni)
      .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
  }, [jadwalList, hariIni]);

  // Hitung mundur ke jadwal berikutnya
  const countdown = useMemo(() => {
    if (jadwalHariIni.length === 0) return null;

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const nextJadwal = jadwalHariIni.find(j => {
      const [jam, menit] = j.jam_mulai.split(':').map(Number);
      const jadwalTime = jam * 60 + menit;
      return jadwalTime > currentTime;
    });

    if (!nextJadwal) return null;

    const [jam, menit] = nextJadwal.jam_mulai.split(':').map(Number);
    const jadwalTime = jam * 60 + menit;
    const diffMinutes = jadwalTime - currentTime;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    const secs = 60 - now.getSeconds();

    return {
      jadwal: nextJadwal,
      hours,
      mins,
      secs: secs === 60 ? 0 : secs,
    };
  }, [jadwalHariIni, now]);

  // Pengumuman otomatis
  const pengumuman = useMemo(() => {
    if (jadwalHariIni.length === 0) return null;
    const jadwalSekarang = jadwalHariIni[0];
    return {
      pelajaran: jadwalSekarang.pelajaran,
      kelas: jadwalSekarang.kelas,
      jam: jadwalSekarang.jam_mulai,
      jamSelesai: jadwalSekarang.jam_selesai,
    };
  }, [jadwalHariIni]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ hari: 'Senin', jam_mulai: '', jam_selesai: '', kelas: '', pelajaran: '', ruangan: '', catatan: '' });
    setShowModal(true);
  };

  const openEdit = (jadwal: Jadwal) => {
    setEditingId(jadwal.id);
    setForm({
      hari: jadwal.hari,
      jam_mulai: jadwal.jam_mulai,
      jam_selesai: jadwal.jam_selesai || '',
      kelas: jadwal.kelas,
      pelajaran: jadwal.pelajaran,
      ruangan: jadwal.ruangan || '',
      catatan: jadwal.catatan || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.jam_mulai || !form.kelas || !form.pelajaran) return;

    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    setShowModal(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* PAPAN PENGUMUMAN */}
      <div className="space-y-4">
        {/* Pengumuman Jadwal Mengajar */}
        {pengumuman && (
          <div className="card bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-emerald-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Pengumuman Hari Ini</span>
                <span className="badge badge-success text-[10px] ml-auto bg-white/20 border-white/20 text-white">Aktif</span>
              </div>
              <h3 className="text-lg font-bold mb-1">
                Ahlan Ustaz, hari ini Anda memiliki jadwal mengajar
              </h3>
              <div className="flex flex-wrap gap-3 mt-3">
                <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                  <BookOpen className="w-4 h-4 text-emerald-200" />
                  <span className="text-sm font-semibold">{pengumuman.pelajaran}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                  <GraduationCap className="w-4 h-4 text-emerald-200" />
                  <span className="text-sm font-semibold">Kelas {pengumuman.kelas}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-emerald-200" />
                  <span className="text-sm font-semibold">
                    {pengumuman.jam}{pengumuman.jamSelesai ? ` - ${pengumuman.jamSelesai}` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hitung Mundur */}
        {countdown && (
          <div className="card p-5 border-l-4 border-l-amber-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Masuk Kelas Berikutnya</span>
                </div>
                <p className="text-sm text-slate-600">
                  {countdown.jadwal.pelajaran} - Kelas {countdown.jadwal.kelas}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-amber-50 rounded-xl px-3 py-2 text-center border border-amber-100">
                  <div className="text-lg font-black text-amber-700">{String(countdown.hours).padStart(2, '0')}</div>
                  <div className="text-[9px] font-bold text-amber-500 uppercase">Jam</div>
                </div>
                <div className="bg-amber-50 rounded-xl px-3 py-2 text-center border border-amber-100">
                  <div className="text-lg font-black text-amber-700">{String(countdown.mins).padStart(2, '0')}</div>
                  <div className="text-[9px] font-bold text-amber-500 uppercase">Menit</div>
                </div>
                <div className="bg-amber-50 rounded-xl px-3 py-2 text-center border border-amber-100">
                  <div className="text-lg font-black text-amber-700">{String(countdown.secs).padStart(2, '0')}</div>
                  <div className="text-[9px] font-bold text-amber-500 uppercase">Detik</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Hari & Tanggal */}
        <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Hari Ini</p>
            <p className="text-sm font-bold text-slate-800">
              {hariIni}, {new Date().getDate()} {namaBulan[new Date().getMonth()]} {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* JADWAL MENGAJAR */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Jadwal Mengajar</h2>
            <p className="section-subtitle">Kelola jadwal pelajaran Anda</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Jadwal</span>
          </button>
        </div>

        {jadwalList.length === 0 ? (
          <EmptyState
            title="Belum ada jadwal"
            description="Mulai tambahkan jadwal mengajar Anda"
            icon={<CalendarDays className="w-8 h-8 text-slate-300" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hariList.map(hari => {
              const jadwalHari = jadwalList
                .filter(j => j.hari === hari)
                .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
              if (jadwalHari.length === 0) return null;

              const isToday = hari === hariIni;

              return (
                <div key={hari} className={cn('card card-hover', isToday && 'ring-2 ring-emerald-200')}>
                  <div className={cn(
                    'px-4 py-3 border-b flex items-center gap-3',
                    isToday ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
                  )}>
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                      isToday ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    )}>
                      {hari.substring(0, 1)}
                    </div>
                    <div className="flex-1">
                      <h3 className={cn('font-bold text-sm', isToday ? 'text-emerald-800' : 'text-slate-700')}>
                        {hari}
                      </h3>
                    </div>
                    {isToday && <span className="badge badge-success text-[10px]">Hari Ini</span>}
                  </div>
                  <div className="p-2">
                    {jadwalHari.map(j => (
                      <div
                        key={j.id}
                        className="p-3 hover:bg-slate-50 rounded-xl transition-colors group relative border-b border-slate-50 last:border-0"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-3 h-3 text-emerald-500" />
                              <span className="text-xs font-bold text-emerald-600">{j.jam_mulai}</span>
                              {j.jam_selesai && (
                                <span className="text-xs text-slate-400">- {j.jam_selesai}</span>
                              )}
                            </div>
                            <div className="font-bold text-slate-800 text-sm">{j.pelajaran}</div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" /> Kelas {j.kelas}
                              </span>
                              {j.ruangan && (
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {j.ruangan}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(j)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(j.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit Jadwal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hari</label>
              <select
                className="input-field"
                value={form.hari}
                onChange={e => setForm({ ...form, hari: e.target.value })}
              >
                {hariList.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kelas</label>
              <input
                type="text"
                className="input-field"
                placeholder="Contoh: 3A"
                value={form.kelas}
                onChange={e => setForm({ ...form, kelas: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Jam Mulai</label>
              <input
                type="time"
                className="input-field"
                value={form.jam_mulai}
                onChange={e => setForm({ ...form, jam_mulai: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Jam Selesai</label>
              <input
                type="time"
                className="input-field"
                value={form.jam_selesai}
                onChange={e => setForm({ ...form, jam_selesai: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mata Pelajaran</label>
            <input
              type="text"
              className="input-field"
              placeholder="Contoh: Fiqih"
              value={form.pelajaran}
              onChange={e => setForm({ ...form, pelajaran: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Ruangan</label>
            <input
              type="text"
              className="input-field"
              placeholder="Contoh: Ruang Kelas 1"
              value={form.ruangan}
              onChange={e => setForm({ ...form, ruangan: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Catatan</label>
            <textarea
              rows={2}
              className="input-field resize-none"
              placeholder="Catatan tambahan..."
              value={form.catatan}
              onChange={e => setForm({ ...form, catatan: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            {editingId ? 'Simpan Perubahan' : 'Tambah Jadwal'}
          </button>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Hapus Jadwal"
        message="Apakah Anda yakin ingin menghapus jadwal ini?"
      />
    </div>
  );
}

const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
