import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = Object.values(err.response.data.errors).join(', ');
        setError(`Validation failed: ${fieldErrors}`);
      } else {
        setError(err.response?.data?.message || 'Failed to login. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', background: 'var(--accent-primary)', padding: '16px', borderRadius: '50%', marginBottom: '16px', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}>
            <LogIn size={32} color="white" />
          </div>
          <h2>Welcome Back</h2>
          <p className="text-muted">Sign in to Team Task Tracker</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@tracker.com"
              required 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '14px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
            <span className="text-muted">Don't have an account? </span>
            <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 'bold' }}>Register here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
