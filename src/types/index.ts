export interface Murid {
  id: string;
  nama: string;
  kelas: string;
  domisili?: string;
  alamat?: string;
  user_id?: string;
  created_at?: string;
}

export interface Jadwal {
  id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai?: string;
  kelas: string;
  pelajaran: string;
  ruangan?: string;
  catatan?: string;
  user_id?: string;
  created_at?: string;
}

export interface Absensi {
  id: string;
  murid_id: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  tanggal: string;
  user_id?: string;
  created_at?: string;
}

export interface BukuSakuBatas {
  id: string;
  kelas: string;
  fan: string;
  materi: string;
  halaman?: string;
  target?: string;
  catatan?: string;
  user_id?: string;
  created_at?: string;
}

export interface BukuSakuTagihan {
  id: string;
  tanggal: string;
  kelas: string;
  kitab: string;
  target_dari?: string;
  target_sampai?: string;
  murid_id?: string;
  catatan?: string;
  user_id?: string;
  created_at?: string;
}

export interface CatatanPerilaku {
  id: string;
  murid_id: string;
  jenis: 'prestasi' | 'pelanggaran' | 'catatan';
  catatan: string;
  user_id?: string;
  created_at?: string;
}

export interface Nilai {
  id: string;
  murid_id: string;
  pelajaran: string;
  jenis_ujian: string;
  skor: number;
  user_id?: string;
  created_at?: string;
}

export interface BankSoal {
  id: string;
  pelajaran: string;
  kelas: string;
  batasan?: string;
  isi_soal: string;
  user_id?: string;
  created_at?: string;
}

export interface CapaianHafalan {
  id: string;
  murid_id: string;
  capaian: string;
  tanggal: string;
  user_id?: string;
  created_at?: string;
}

export type ActiveTab =
  | 'jadwal'
  | 'absensi'
  | 'bukusaku'
  | 'hafalan'
  | 'perilaku'
  | 'nilai'
  | 'soal'
  | 'murid';
