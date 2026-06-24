import { useState } from 'react';
import {
  Save, FileText, Share2, Search,
  Award, CalendarDays, Heart, BookMarked
} from 'lucide-react';
import type { Murid, Nilai, Absensi, CatatanPerilaku, CapaianHafalan } from '../types';
import EmptyState from '../components/EmptyState';
import { generatePDF, shareWA, generateRaporPDF } from '../lib/pdf';
import { cn } from '../lib/utils';

interface NilaiPageProps {
  muridList: Murid[];
  nilaiList: Nilai[];
  absensiList: Absensi[];
  perilakuList: CatatanPerilaku[];
  capaianList: CapaianHafalan[];
  onSaveNilai: (nilai: Omit<Nilai, 'id' | 'user_id' | 'created_at'>) => void;
}

export default function NilaiPage({
  muridList, nilaiList, absensiList, perilakuList, capaianList, onSaveNilai
}: NilaiPageProps) {
  const [activeTab, setActiveTab] = useState<'input' | 'rapor'>('input');
  const [filterKelas, setFilterKelas] = useState('');
  const [pelajaran, setPelajaran] = useState('');
  const [jenisUjian, setJenisUjian] = useState('Ulangan');
  const [searchQuery, setSearchQuery] = useState('');
  const [draftNilai, setDraftNilai] = useState<Record<string, number>>({});

  // Rapor states
  const [raporKelas, setRaporKelas] = useState('');
  const [raporMurid, setRaporMurid] = useState<Murid | null>(null);

  const kelasList = [...new Set(muridList.map(m => m.kelas))].sort();

  const muridDiKelas = muridList
    .filter(m => m.kelas === filterKelas)
    .filter(m => m.nama.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.nama.localeCompare(b.nama));

  const getExistingNilai = (muridId: string): number | undefined => {
    if (draftNilai[muridId] !== undefined) return draftNilai[muridId];
    const found = nilaiList.find(n =>
      n.murid_id === muridId &&
      n.pelajaran.toLowerCase() === pelajaran.toLowerCase() &&
      n.jenis_ujian === jenisUjian
    );
    return found?.skor;
  };

  const handleNilaiChange = (muridId: string, value: string) => {
    const num = value === '' ? undefined : parseInt(value);
    if (num !== undefined && (num < 0 || num > 100)) return;
    setDraftNilai(prev => {
      const next = { ...prev };
      if (num === undefined) delete next[muridId];
      else next[muridId] = num;
      return next;
    });
  };

  const simpanNilai = () => {
    if (!filterKelas || !pelajaran) {
      alert('Pilih kelas dan isi mata pelajaran terlebih dahulu!');
      return;
    }
    const records = Object.entries(draftNilai)
      .filter(([, v]) => v !== undefined)
      .map(([murid_id, skor]) => ({
        murid_id,
        pelajaran,
        jenis_ujian: jenisUjian,
        skor: skor as number,
      }));

    if (records.length === 0) {
      alert('Isi nilai minimal satu santri!');
      return;
    }

    records.forEach(r => onSaveNilai(r));
    setDraftNilai({});
    alert('Nilai berhasil disimpan!');
  };

  const exportNilaiPDF = () => {
    const headers = ['Nama Santri', 'Jenis Ujian', 'Nilai'];
    const body = muridDiKelas.map(m => {
      const n = getExistingNilai(m.id);
      return [m.nama, jenisUjian, n !== undefined ? n.toString() : '-'];
    });
    generatePDF(`Nilai ${pelajaran} - Kelas ${filterKelas}`, headers, body, [
      `Mata Pelajaran: ${pelajaran}`,
      `Jenis: ${jenisUjian}`,
    ]);
  };

  const shareNilaiWA = () => {
    let text = `*LAPORAN NILAI KELAS ${filterKelas}*\n`;
    text += `Mapel: ${pelajaran} (${jenisUjian})\n\n`;
    muridDiKelas.forEach(m => {
      const n = getExistingNilai(m.id);
      text += `*${m.nama}*: ${n !== undefined ? n : '-'}\n`;
    });
    shareWA(text);
  };

  // Rapor data
  const raporMuridList = muridList.filter(m => m.kelas === raporKelas);
  const raporNilai = nilaiList.filter(n => n.murid_id === raporMurid?.id);
  const raporAbsen = absensiList.filter(a => a.murid_id === raporMurid?.id);
  const raporPerilaku = perilakuList.filter(p => p.murid_id === raporMurid?.id);
  const raporCapaian = capaianList.filter(c => c.murid_id === raporMurid?.id);

  const absenStats = raporAbsen.length > 0 ? {
    hadir: raporAbsen.filter(a => a.status === 'Hadir').length,
    izin: raporAbsen.filter(a => a.status === 'Izin').length,
    sakit: raporAbsen.filter(a => a.status === 'Sakit').length,
    alpha: raporAbsen.filter(a => a.status === 'Alpha').length,
    total: raporAbsen.length,
  } : { hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0 };

  const raporStats = raporNilai.length > 0
    ? {
        rata: (raporNilai.reduce((s, n) => s + n.skor, 0) / raporNilai.length).toFixed(1),
        tertinggi: Math.max(...raporNilai.map(n => n.skor)),
        terendah: Math.min(...raporNilai.map(n => n.skor)),
      }
    : null;

  const handleExportRaporPDF = () => {
    if (!raporMurid) return;
    generateRaporPDF(
      raporMurid,
      absenStats,
      raporNilai,
      raporPerilaku,
      raporCapaian,
    );
  };

  const handleShareRaporWA = () => {
    if (!raporMurid) return;
    let text = `*RAPOR AKADEMIK SANTRI*\n\n`;
    text += `👤 *${raporMurid.nama}*\n`;
    text += `🏫 Kelas: ${raporMurid.kelas}\n\n`;

    if (absenStats.total > 0) {
      text += `*📊 Kehadiran:*\n`;
      text += `Hadir: ${absenStats.hadir}, Izin: ${absenStats.izin}, Sakit: ${absenStats.sakit}, Alpha: ${absenStats.alpha}\n`;
      text += `Persentase: ${absenStats.total > 0 ? ((absenStats.hadir / absenStats.total) * 100).toFixed(1) : 0}%\n\n`;
    }

    if (raporNilai.length > 0) {
      text += `*📝 Nilai:*\n`;
      raporNilai.forEach(n => {
        const predikat = n.skor >= 85 ? 'A' : n.skor >= 70 ? 'B' : n.skor >= 60 ? 'C' : n.skor >= 50 ? 'D' : 'E';
        text += `${n.pelajaran} (${n.jenis_ujian}): ${n.skor} (${predikat})\n`;
      });
      text += `\n`;
    }

    if (raporCapaian.length > 0) {
      text += `*📖 Capaian Hafalan:*\n`;
      raporCapaian.forEach(c => {
        text += `${c.tanggal}: ${c.capaian}\n`;
      });
      text += `\n`;
    }

    if (raporPerilaku.length > 0) {
      text += `*💡 Catatan Perilaku:*\n`;
      raporPerilaku.forEach(p => {
        text += `[${p.jenis}] ${p.catatan}\n`;
      });
    }

    text += `\nWassalamu'alaikum Warahmatullahi Wabarakatuh.`;
    shareWA(text);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h2 className="section-title">Nilai Ujian Santri</h2>
        <p className="section-subtitle">Input nilai imtihan, UTS, UAS, dan generate raport</p>
      </div>

      {/* Tab Switcher */}
      <div className="tab-switcher">
        <button
          onClick={() => setActiveTab('input')}
          className={cn('tab-btn', activeTab === 'input' ? 'tab-btn-active' : 'tab-btn-inactive')}
        >
          Input Nilai
        </button>
        <button
          onClick={() => setActiveTab('rapor')}
          className={cn('tab-btn', activeTab === 'rapor' ? 'tab-btn-active' : 'tab-btn-inactive')}
        >
          Rapor
        </button>
      </div>

      {/* === INPUT NILAI === */}
      {activeTab === 'input' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kelas</label>
                <select
                  className="input-field"
                  value={filterKelas}
                  onChange={e => { setFilterKelas(e.target.value); setDraftNilai({}); }}
                >
                  <option value="">Pilih Kelas</option>
                  {kelasList.map(k => <option key={k} value={k}>Kelas {k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mata Pelajaran</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Fiqih"
                  value={pelajaran}
                  onChange={e => setPelajaran(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Jenis Penilaian</label>
                <select
                  className="input-field"
                  value={jenisUjian}
                  onChange={e => { setJenisUjian(e.target.value); setDraftNilai({}); }}
                >
                  <option value="Ulangan">Ulangan</option>
                  <option value="Ujian Tulis">Ujian Tulis</option>
                  <option value="Ujian Lisan">Ujian Lisan</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={exportNilaiPDF}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5" /> PDF
                </button>
                <button
                  onClick={shareNilaiWA}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" /> WA
                </button>
              </div>
            </div>
          </div>

          {filterKelas && pelajaran && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Cari nama santri..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="card overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Nama Santri</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase text-center">Nilai (0-100)</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 uppercase text-center">Predikat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {muridDiKelas.map(murid => {
                      const nilai = getExistingNilai(murid.id);
                      const predikat = nilai === undefined ? '-' :
                        nilai >= 85 ? 'A' : nilai >= 70 ? 'B' : nilai >= 60 ? 'C' : nilai >= 50 ? 'D' : 'E';
                      const predikatColor = nilai === undefined ? 'text-slate-400' :
                        nilai >= 85 ? 'text-emerald-600' : nilai >= 70 ? 'text-sky-600' : nilai >= 60 ? 'text-amber-600' : 'text-rose-600';
                      return (
                        <tr key={murid.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="p-4 font-semibold text-slate-800 text-sm">{murid.nama}</td>
                          <td className="p-4">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="w-24 mx-auto block p-2 border border-slate-200 rounded-lg text-center font-bold focus:ring-2 focus:ring-emerald-200 text-sm"
                              placeholder="-"
                              defaultValue={nilai !== undefined ? nilai : ''}
                              onBlur={e => handleNilaiChange(murid.id, e.target.value)}
                            />
                          </td>
                          <td className="p-4 text-center">
                            <span className={cn('text-sm font-black', predikatColor)}>{predikat}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                onClick={simpanNilai}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan Semua Nilai
              </button>
            </>
          )}

          {(!filterKelas || !pelajaran) && (
            <EmptyState
              title="Pilih Parameter"
              description="Pilih kelas dan isi mata pelajaran untuk memunculkan lembar penilaian"
            />
          )}
        </div>
      )}

      {/* === RAPOR === */}
      {activeTab === 'rapor' && (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kelas</label>
                <select
                  className="input-field"
                  value={raporKelas}
                  onChange={e => { setRaporKelas(e.target.value); setRaporMurid(null); }}
                >
                  <option value="">Pilih Kelas</option>
                  {kelasList.map(k => <option key={k} value={k}>Kelas {k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Santri (Opsional)</label>
                <select
                  className="input-field"
                  value={raporMurid?.id || ''}
                  onChange={e => {
                    const m = muridList.find(x => x.id === e.target.value);
                    setRaporMurid(m || null);
                  }}
                >
                  <option value="">Semua Santri</option>
                  {raporMuridList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
              </div>
            </div>
          </div>

          {raporKelas && raporMurid && (
            <div className="card p-5 space-y-5">
              {/* Header */}
              <div className="text-center pb-4 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-800">RAPOR AKADEMIK</h3>
                <p className="text-sm text-slate-500">SIM KBM Ustaz</p>
              </div>

              {/* Data Diri */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Nama</span>
                    <span className="font-bold text-slate-800">{raporMurid.nama}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Kelas</span>
                    <span className="font-bold text-slate-800">{raporMurid.kelas}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tanggal</span>
                    <span className="font-bold text-slate-800">{new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Absensi */}
              {raporAbsen.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-emerald-500" />
                    Kehadiran
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-emerald-50 rounded-xl p-2 text-center border border-emerald-100">
                      <div className="text-lg font-black text-emerald-700">{absenStats.hadir}</div>
                      <div className="text-[9px] font-bold text-emerald-500 uppercase">Hadir</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-2 text-center border border-amber-100">
                      <div className="text-lg font-black text-amber-700">{absenStats.izin}</div>
                      <div className="text-[9px] font-bold text-amber-500 uppercase">Izin</div>
                    </div>
                    <div className="bg-sky-50 rounded-xl p-2 text-center border border-sky-100">
                      <div className="text-lg font-black text-sky-700">{absenStats.sakit}</div>
                      <div className="text-[9px] font-bold text-sky-500 uppercase">Sakit</div>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-2 text-center border border-rose-100">
                      <div className="text-lg font-black text-rose-700">{absenStats.alpha}</div>
                      <div className="text-[9px] font-bold text-rose-500 uppercase">Alpha</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Persentase Kehadiran</span>
                      <span className="font-bold text-emerald-600">
                        {absenStats.total > 0 ? ((absenStats.hadir / absenStats.total) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${absenStats.total > 0 ? (absenStats.hadir / absenStats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Nilai */}
              {raporNilai.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-500" />
                    Nilai Ujian
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="p-2 text-[10px] font-black text-slate-500 uppercase">Pelajaran</th>
                          <th className="p-2 text-[10px] font-black text-slate-500 uppercase">Jenis</th>
                          <th className="p-2 text-[10px] font-black text-slate-500 uppercase text-center">Skor</th>
                          <th className="p-2 text-[10px] font-black text-slate-500 uppercase text-center">Predikat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {raporNilai.map(n => {
                          const predikat = n.skor >= 85 ? 'A' : n.skor >= 70 ? 'B' : n.skor >= 60 ? 'C' : n.skor >= 50 ? 'D' : 'E';
                          return (
                            <tr key={n.id} className="border-b border-slate-50">
                              <td className="p-2 font-medium">{n.pelajaran}</td>
                              <td className="p-2 text-slate-500">{n.jenis_ujian}</td>
                              <td className="p-2 text-center font-bold">{n.skor}</td>
                              <td className="p-2 text-center">
                                <span className={cn(
                                  'text-xs font-black px-2 py-0.5 rounded-full',
                                  n.skor >= 85 ? 'bg-emerald-50 text-emerald-700' :
                                  n.skor >= 70 ? 'bg-sky-50 text-sky-700' :
                                  n.skor >= 60 ? 'bg-amber-50 text-amber-700' :
                                  'bg-rose-50 text-rose-700'
                                )}>
                                  {predikat}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {raporStats && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                        <div className="text-lg font-black text-emerald-700">{raporStats.rata}</div>
                        <div className="text-[10px] font-bold text-emerald-500 uppercase">Rata-rata</div>
                      </div>
                      <div className="bg-sky-50 rounded-xl p-3 text-center border border-sky-100">
                        <div className="text-lg font-black text-sky-700">{raporStats.tertinggi}</div>
                        <div className="text-[10px] font-bold text-sky-500 uppercase">Tertinggi</div>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                        <div className="text-lg font-black text-amber-700">{raporStats.terendah}</div>
                        <div className="text-[10px] font-bold text-amber-500 uppercase">Terendah</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Capaian Hafalan */}
              {raporCapaian.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-emerald-500" />
                    Capaian Hafalan
                  </h4>
                  <div className="space-y-2">
                    {raporCapaian.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <span className="text-xs font-medium text-slate-700">{c.capaian}</span>
                        <span className="text-[10px] text-slate-400">{c.tanggal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Catatan Perilaku */}
              {raporPerilaku.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-500" />
                    Catatan Perilaku
                  </h4>
                  <div className="space-y-2">
                    {raporPerilaku.map(p => (
                      <div key={p.id} className={cn(
                        'p-3 rounded-xl border text-sm',
                        p.jenis === 'prestasi' ? 'bg-emerald-50 border-emerald-100' :
                        p.jenis === 'pelanggaran' ? 'bg-rose-50 border-rose-100' :
                        'bg-sky-50 border-sky-100'
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                            p.jenis === 'prestasi' ? 'bg-emerald-200 text-emerald-800' :
                            p.jenis === 'pelanggaran' ? 'bg-rose-200 text-rose-800' :
                            'bg-sky-200 text-sky-800'
                          )}>
                            {p.jenis}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(p.created_at || '').toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <p className="text-slate-700">{p.catatan}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={handleExportRaporPDF}
                  className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                >
                  <FileText className="w-4 h-4" /> Export PDF
                </button>
                <button
                  onClick={handleShareRaporWA}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                >
                  <Share2 className="w-4 h-4" /> Share WA
                </button>
              </div>
            </div>
          )}

          {raporKelas && !raporMurid && (
            <EmptyState
              title="Pilih Santri"
              description="Pilih santri untuk melihat rapor lengkap"
            />
          )}
        </div>
      )}
    </div>
  );
}
