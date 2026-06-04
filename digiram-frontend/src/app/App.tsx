// FILE: src/app/App.tsx
// GANTI SELURUH ISI FILE INI

import { Component, ReactNode } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { AssessmentProvider } from '../contexts/AssessmentContext';
import { SimariLoginPage } from '../components/SimariLoginPage';
import { SimariHospitalDashboard } from '../components/SimariHospitalDashboard';
import { SimariDinkesDashboard } from '../components/SimariDinkesDashboard';

// ✅ ErrorBoundary: mencegah seluruh app blank saat ada render error
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[DIGIRAM] Render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#F0FDF4',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '40px',
            maxWidth: '480px', width: '90%', textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid #E5E7EB',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ color: '#111827', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Terjadi Kesalahan
            </h2>
            <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '24px', lineHeight: 1.6 }}>
              Halaman ini mengalami error. Klik tombol di bawah untuk memuat ulang aplikasi.
            </p>
            {this.state.error && (
              <p style={{
                background: '#FEF2F2', color: '#DC2626', fontSize: '11px',
                padding: '8px 12px', borderRadius: '8px', marginBottom: '20px',
                textAlign: 'left', wordBreak: 'break-word',
              }}>
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: '#16A34A', color: 'white', border: 'none',
                borderRadius: '8px', padding: '10px 24px', fontSize: '13px',
                fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <SimariLoginPage />;
  }

  if (user.role === 'hospital') {
    return <SimariHospitalDashboard />;
  }

  if (user.role === 'health_office') {
    return <SimariDinkesDashboard />;
  }

  return <SimariLoginPage />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AssessmentProvider>
          {/* ErrorBoundary juga di dalam untuk menangkap error per-halaman */}
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </AssessmentProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}