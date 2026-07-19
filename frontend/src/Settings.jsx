import { useState, useEffect } from 'react';
import api from './api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { User as UserIcon, Lock, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { showToast, showConfirm } = useToast();
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adminTargetId, setAdminTargetId] = useState('');
  const [adminTargetRole, setAdminTargetRole] = useState('MEMBER');
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/users/me');
        setMyProfile(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!myProfile) return;
    try {
      await api.put(`/users/${myProfile.id}`, { email });
      showToast("Profile updated successfully! You may need to log in again if you changed your email.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', "error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!myProfile) return;
    try {
      await api.put(`/users/${myProfile.id}/password`, { currentPassword, newPassword });
      showToast("Password updated successfully!", "success");
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update password', "error");
    }
  };

  const handleDeactivate = async (e) => {
    e.preventDefault();
    showConfirm("Are you sure you want to deactivate this user?", async () => {
      try {
        await api.delete(`/users/${adminTargetId}`);
        showToast("User deactivated!", "success");
        setAdminTargetId('');
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to deactivate user', "error");
      }
    });
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${adminTargetId}/activate`);
      showToast("User activated!", "success");
      setAdminTargetId('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to activate user', "error");
    }
  };

  const handleChangeRole = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${adminTargetId}`, { role: adminTargetRole });
      showToast("User role updated successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user role', "error");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '8px' }}>Settings</h1>
      <p className="text-muted" style={{ marginBottom: '32px' }}>Manage your account and preferences.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Profile Settings */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--accent-primary)', padding: '8px', borderRadius: '8px' }}>
              <UserIcon size={24} color="white" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Profile Information</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={!myProfile || email === user?.email}>Update Profile</button>
          </form>
        </div>

        {/* Password */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px' }}>
              <Lock size={24} color="white" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Change Password</h2>
          </div>
          
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Current Password</label>
              <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>New Password</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', alignSelf: 'flex-start' }}>Update Password</button>
          </form>
        </div>

        {/* Admin Section */}
        {user?.role === 'ADMINISTRATOR' && (
          <div className="glass-panel" style={{ padding: '32px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--accent-danger)', padding: '8px', borderRadius: '8px' }}>
                <ShieldAlert size={24} color="white" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Administration</h2>
            </div>
            
            <p className="text-muted" style={{ marginBottom: '16px' }}>Manage user access and deactivations across the system.</p>
            
            <div style={{ display: 'flex', gap: '12px', maxWidth: '500px', marginBottom: '16px' }}>
              <input type="number" placeholder="Target User ID" required value={adminTargetId} onChange={e => setAdminTargetId(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-danger" onClick={handleDeactivate} disabled={!adminTargetId}>Deactivate</button>
              <button className="btn btn-primary" style={{ background: 'var(--accent-success)' }} onClick={handleActivate} disabled={!adminTargetId}>Activate</button>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', maxWidth: '500px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <select value={adminTargetRole} onChange={e => setAdminTargetRole(e.target.value)} style={{ flex: 1 }}>
                <option value="MEMBER">MEMBER</option>
                <option value="PROJECT_MANAGER">PROJECT MANAGER</option>
                <option value="ADMINISTRATOR">ADMINISTRATOR</option>
              </select>
              <button className="btn btn-primary" onClick={handleChangeRole} disabled={!adminTargetId}>Change Role</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
