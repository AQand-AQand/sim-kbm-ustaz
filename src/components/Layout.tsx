import {
  CalendarDays,
  ClipboardCheck,
  BookOpen,
  BookMarked,
  Heart,
  BarChart3,
  FileQuestion,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  User,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ActiveTab } from '../types';

interface LayoutProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userEmail: string | null;
  onLogout: () => void;
  onSync: () => void;
  isOffline: boolean;
  isSyncing: boolean;
  children: React.ReactNode;
}

const navItems: { id: ActiveTab; icon: React.ElementType; label: string }[] = [
  { id: 'jadwal', icon: CalendarDays, label: 'Jadwal' },
  { id: 'absensi', icon: ClipboardCheck, label: 'Absensi' },
  { id: 'bukusaku', icon: BookOpen, label: 'Saku' },
  { id: 'hafalan', icon: BookMarked, label: 'Hafalan' },
  { id: 'perilaku', icon: Heart, label: 'Sikap' },
  { id: 'nilai', icon: BarChart3, label: 'Nilai' },
  { id: 'soal', icon: FileQuestion, label: 'Soal' },
  { id: 'murid', icon: Users, label: 'Santri' },
];

export default function Layout({
  activeTab,
  setActiveTab,
  userEmail,
  onLogout,
  onSync,
  isOffline,
  isSyncing,
  children,
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.history.pushState(null, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-0 md:pl-64">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">SIM KBM Ustaz</h1>
              <p className="text-[11px] text-slate-500 font-medium">
                {now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOffline && (
              <span className="flex items-center px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 animate-pulse" />
                Offline
              </span>
            )}
            <button
              onClick={onSync}
              disabled={isSyncing || isOffline}
              className={`p-2 rounded-xl transition-all ${isOffline ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'} ${isSyncing ? 'animate-spin' : ''}`}
              title="Sinkronisasi Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-3 py-1.5">
              <div className="w-6 h-6 bg-emerald-500 rounded-full text-white flex items-center justify-center text-[10px] font-bold mr-2">
                <User className="w-3 h-3" />
              </div>
              <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">
                {userEmail?.split('@')[0] || 'Ustaz'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-100 fixed top-0 bottom-0 left-0 z-40">
        <div className="p-5 bg-emerald-600 text-white flex items-center gap-3">
          <BookOpen className="w-7 h-7" />
          <span className="text-lg font-bold tracking-wide">Portal Ustaz</span>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 px-4 py-2.5 rounded-xl font-bold transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl md:hidden animate-slide-in-right">
            <div className="p-5 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                <span className="font-bold">Portal Ustaz</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-3 px-2 space-y-0.5">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-100 bg-white">
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 px-4 py-2.5 rounded-xl font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.04)] border-t border-slate-100 z-30 flex justify-around p-2 pb-safe">
        {navItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center p-1.5 rounded-xl min-w-[56px] transition-all ${isActive ? 'text-emerald-600 scale-105' : 'text-slate-400'}`}
            >
              <div className={`p-1 rounded-lg mb-0.5 ${isActive ? 'bg-emerald-50' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[9px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center p-1.5 rounded-xl min-w-[56px] text-slate-400"
        >
          <div className="p-1 rounded-lg mb-0.5">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-medium">Lainnya</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
