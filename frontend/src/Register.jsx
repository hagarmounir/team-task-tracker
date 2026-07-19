import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './api';
import { UserPlus } from 'lucide-react';
import { useToast } from './ToastContext';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/users/register', formData);
      showToast("Registration successful! Please sign in.", "success");
      navigate('/login');
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = Object.values(err.response.data.errors).join(', ');
        setError(`Validation failed: ${fieldErrors}`);
      } else {
        setError(err.response?.data?.message || 'Failed to register account.');
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
            <UserPlus size={32} color="white" />
          </div>
          <h2>Create Account</h2>
          <p className="text-muted">Join Team Task Tracker</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              placeholder="John Doe"
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              placeholder="user@tracker.com"
              required 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '14px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 'bold' }}>Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
