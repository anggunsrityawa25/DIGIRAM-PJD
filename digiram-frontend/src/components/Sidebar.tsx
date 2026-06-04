// FILE: src/components/Sidebar.tsx
// Perbaikan: nama dan initials diambil dari user context secara reaktif
// sehingga saat profil diubah di PengaturanAkses, sidebar otomatis ikut berubah.

import { type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAssessments } from '../contexts/AssessmentContext';
import logoImg from '../imports/Logo_PJD6.png';
import {
  LayoutDashboard, Building2, ClipboardCheck, History, Settings,
  MapPin, ListChecks, FileCheck, LogOut, BookOpen,
} from 'lucide-react';

interface NavItem {
  id: string;
  icon: ReactNode;
  label: string;
  badge?: number;
}

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ currentPage, onPageChange, onLogout }: SidebarProps) {
  // user dibaca langsung dari context — reactif terhadap updateUser()
  const { user, logout } = useAuth();
  const { getAssessmentsByRegion } = useAssessments();

  const antrianCount = user?.role !== 'hospital' && (user as any)?.regionId
    ? getAssessmentsByRegion((user as any).regionId).filter(a => a.status === 'submitted' || a.status === 'under_review').length
    : 0;

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  const getNavItems = (): { section: string; items: NavItem[] }[] => {
    if (user?.role === 'hospital') {
      return [
        {
          section: 'Utama',
          items: [
            { id: 'dashboard', icon: <LayoutDashboard size={16} />, label: 'Beranda' },
            { id: 'profil', icon: <Building2 size={16} />, label: 'Profil Faskes' },
          ],
        },
        {
          section: 'Penilaian Mandiri',
          items: [
            { id: 'audit', icon: <ClipboardCheck size={16} />, label: 'Audit RME' },
            { id: 'riwayat', icon: <History size={16} />, label: 'Riwayat Penilaian' },
          ],
        },
        {
          section: 'Akun',
          items: [
            { id: 'pengaturan', icon: <Settings size={16} />, label: 'Pengaturan Akses' },
          ],
        },
      ];
    } else {
      return [
        {
          section: 'Utama',
          items: [
            { id: 'dashboard', icon: <LayoutDashboard size={16} />, label: 'Beranda' },
            { id: 'faskes-regional', icon: <MapPin size={16} />, label: 'Data Faskes Regional' },
          ],
        },
        {
          section: 'Verifikasi',
          items: [
            { id: 'verifikasi', icon: <ListChecks size={16} />, label: 'Antrian Verifikasi', badge: antrianCount > 0 ? antrianCount : undefined },
            { id: 'riwayat-verifikasi', icon: <FileCheck size={16} />, label: 'Riwayat Verifikasi' },
          ],
        },
        {
          section: 'Instrumen',
          items: [
            { id: 'instrumen-emram', icon: <BookOpen size={16} />, label: 'Instrumen EMRAM' },
          ],
        },
        {
          section: 'Akun',
          items: [
            { id: 'pengaturan', icon: <Settings size={16} />, label: 'Pengaturan Akses' },
          ],
        },
      ];
    }
  };

  const getRoleLabel = () => {
    if (user?.role === 'hospital') return 'Staf Rumah Sakit';
    return 'Admin Dinkes';
  };

  // Ambil inisial dari nama terbaru di context (reaktif)
  const getUserInitials = () => {
    const name = user?.name;
    if (!name) return 'U';
    const names = name.split(' ').filter(Boolean);
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return names[0][0].toUpperCase();
  };

  return (
    <aside className="simari-sidebar scrollbar-thin">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <img src={logoImg} alt="DIGIRAM" style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0 }} />
          <div className="logo-text">DIGIRAM</div>
        </div>
        <div className="logo-sub">EMRAM-AUDIT RME</div>
      </div>

      <nav className="sidebar-nav">
        {getNavItems().map((section, idx) => (
          <div key={idx} className="nav-section">
            <div className="nav-section-label">{section.section}</div>
            {section.items.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => onPageChange(item.id)}
              >
                <span className="nav-icon" style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* User card — menampilkan nama terbaru dari context */}
        <button
          onClick={() => onPageChange('pengaturan')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            borderRadius: '8px',
            background: currentPage === 'pengaturan' ? 'var(--accent-light)' : 'var(--surface2)',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'background 0.15s',
          }}
        >
          <div className="user-avatar">{getUserInitials()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* user.name di sini reaktif — berubah otomatis saat updateUser() dipanggil */}
            <div className="user-name" style={{ color: currentPage === 'pengaturan' ? 'var(--accent)' : 'var(--text)' }}>
              {user?.name}
            </div>
            <div className="user-role">{getRoleLabel()}</div>
          </div>
          <Settings size={12} color="var(--text3)" />
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 10px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--danger)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            marginTop: '4px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-light)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <LogOut size={13} />
          Keluar dari Sistem
        </button>
      </div>
    </aside>
  );
}