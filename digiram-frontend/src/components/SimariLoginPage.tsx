import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../imports/Logo_PJD6.png';
import { Building2, Stethoscope, Eye, EyeOff } from 'lucide-react';

type RoleChoice = 'hospital' | 'health_office' | null;

const inputStyle = (disabled: boolean, hasError: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: `1px solid ${hasError ? 'var(--danger)' : disabled ? 'var(--border)' : 'var(--border2)'}`,
  background: disabled ? 'var(--surface2)' : 'var(--surface)',
  fontSize: '13px',
  color: disabled ? 'var(--text3)' : 'var(--text)',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  outline: 'none',
  boxSizing: 'border-box' as const,
  cursor: disabled ? 'not-allowed' : 'text',
  transition: 'border-color 0.15s',
});

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text2)',
  marginBottom: '6px',
};

export function SimariLoginPage() {
  const { loginWithCredentials } = useAuth();
  const [role, setRole] = useState<RoleChoice>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const disabled = role === null;
  const canSubmit = !disabled && username.trim() !== '' && password !== '';

  const handleRoleSelect = (r: RoleChoice) => {
    setRole(r);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try{
      const ok = await loginWithCredentials(username.trim(), password);
      if (!ok){
        setError('Email atau kata sandi salah. Periksa kembali dan coba lagi.');
      }
    } catch (err){
      setError('Gagal terhubung ke server backend.');
    } finally{
      setLoading(false);
    }
  };

  const roleCards: { id: RoleChoice; label: string; sub: string; icon: React.ReactNode }[] = [
    {
      id: 'hospital',
      label: 'Staf Rumah Sakit',
      sub: 'Penilaian mandiri EMRAM',
      icon: <Stethoscope size={20} />,
    },
    {
      id: 'health_office',
      label: 'Admin Dinkes',
      sub: 'Verifikasi & monitoring regional',
      icon: <Building2 size={20} />,
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 40px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src={logoImg}
            alt="DIGIRAM"
            style={{ width: '52px', height: '52px', objectFit: 'contain', margin: '0 auto 14px', display: 'block' }}
          />
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '3px',
          }}>
            DIGIRAM
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '0.05em' }}>
            DIGITAL EMRAM AUDIT MANAGER
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Role selector */}
          <div>
            <div style={{ ...labelStyle, marginBottom: '8px' }}>Masuk sebagai</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {roleCards.map(rc => {
                const selected = role === rc.id;
                return (
                  <button
                    key={rc.id}
                    type="button"
                    onClick={() => handleRoleSelect(rc.id)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: '10px',
                      border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                      background: selected ? 'var(--accent-light)' : 'var(--surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <span style={{
                      color: selected ? 'var(--accent)' : 'var(--text3)',
                      display: 'flex', alignItems: 'center',
                    }}>
                      {rc.icon}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: selected ? 'var(--accent)' : 'var(--text)', lineHeight: 1.3 }}>
                      {rc.label}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text3)', lineHeight: 1.4 }}>
                      {rc.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border)' }} />

          {/* Username */}
          <div>
            <label style={labelStyle}>
              Email <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder={disabled ? 'Pilih peran terlebih dahulu' : 'Masukkan email'}
              disabled={disabled}
              style={inputStyle(disabled, !!error)}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>
              Kata Sandi <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder={disabled ? 'Pilih peran terlebih dahulu' : 'Masukkan kata sandi'}
                disabled={disabled}
                style={{ ...inputStyle(disabled, !!error), paddingRight: '40px' }}
                autoComplete="current-password"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                    color: 'var(--text3)', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px',
              background: 'var(--danger-light)', border: '1px solid var(--danger)',
              fontSize: '12px', color: 'var(--danger)', lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            style={{
              width: '100%',
              padding: '11px 20px',
              borderRadius: '8px',
              border: 'none',
              background: canSubmit && !loading ? 'var(--accent)' : 'var(--surface2)',
              color: canSubmit && !loading ? 'white' : 'var(--text3)',
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
              letterSpacing: '0.01em',
            }}
          >
            {loading ? 'Memverifikasi...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
