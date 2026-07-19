import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import { Plus, Folder, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast, showConfirm } = useToast();
  
  // Create/Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null); // null means create, otherwise holds project data
  const [formData, setFormData] = useState({ name: '', description: '', status: 'ACTIVE' });

  // Member Management state
  const [showMemberModal, setShowMemberModal] = useState(null); // stores selected project
  const [newMemberId, setNewMemberId] = useState('');
  const [projectMembers, setProjectMembers] = useState([]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProject) {
        await api.put(`/projects/${editProject.id}`, formData);
        showToast("Project updated successfully!", "success");
      } else {
        await api.post('/projects', formData);
        showToast("Project created successfully!", "success");
      }
      setShowModal(false);
      setFormData({ name: '', description: '', status: 'ACTIVE' });
      setEditProject(null);
      fetchProjects(); // refresh
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${editProject ? 'update' : 'create'} project`, "error");
    }
  };

  const openCreateModal = () => {
    setEditProject(null);
    setFormData({ name: '', description: '', status: 'ACTIVE' });
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditProject(project);
    setFormData({ name: project.name, description: project.description || '', status: project.status });
    setShowModal(true);
  };

  const openMemberModal = async (project) => {
    setShowMemberModal(project);
    try {
      const res = await api.get(`/projects/${project.id}/members`);
      setProjectMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const canManageProjects = user?.role === 'ADMINISTRATOR' || user?.role === 'PROJECT_MANAGER';

  const handleDeleteProject = (projectId) => {
    showConfirm("Are you sure you want to delete this project? This action cannot be undone.", async () => {
      try {
        await api.delete(`/projects/${projectId}`);
        showToast("Project deleted", "success");
        fetchProjects();
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to delete project', "error");
      }
    });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberId) return;
    try {
      await api.post(`/projects/${showMemberModal.id}/members/${newMemberId}`);
      setNewMemberId('');
      showToast("Member added successfully!", "success");
      // refresh members
      const res = await api.get(`/projects/${showMemberModal.id}/members`);
      setProjectMembers(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add member', "error");
    }
  };

  const handleRemoveMember = (projectId, userId) => {
    showConfirm("Are you sure you want to remove this member?", async () => {
      try {
        await api.delete(`/projects/${projectId}/members/${userId}`);
        showToast("Member removed", "success");
        const res = await api.get(`/projects/${projectId}/members`);
        setProjectMembers(res.data);
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to remove member', "error");
      }
    });
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Projects</h1>
          <p className="text-muted">Manage your team's projects and workspaces</p>
        </div>
        {canManageProjects && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={20} /> New Project
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {projects.map(p => (
          <div key={p.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                  <Folder size={24} />
                </div>
                <h3 style={{ margin: 0 }}>{p.name}</h3>
              </div>
              <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
            </div>
            
            <p className="text-muted" style={{ marginBottom: '24px', flex: 1, lineHeight: 1.5 }}>
              {p.description || 'No description provided.'}
            </p>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <Clock size={16} />
                {new Date(p.createdAt).toLocaleDateString()}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {canManageProjects && (
                  <>
                    <button className="btn btn-ghost" style={{ padding: '6px' }} title="Edit Project" onClick={() => openEditModal(p)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '6px' }} title="Manage Members" onClick={() => openMemberModal(p)}>
                      <Users size={16} />
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '6px', color: '#fca5a5' }} title="Delete Project" onClick={() => handleDeleteProject(p.id)}>
                      <span style={{ fontSize: '12px' }}>Delete</span>
                    </button>
                  </>
                )}
                <Link to={`/projects/${p.id}/tasks`} className="btn btn-primary" style={{ padding: '6px 12px' }}>
                  Tasks &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--glass-border)' }}>
            <Folder size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
            {canManageProjects ? (
              <>
                <h3>No projects yet</h3>
                <p className="text-muted">Get started by creating your first project.</p>
              </>
            ) : (
              <>
                <h3>No assigned projects</h3>
                <p className="text-muted">You haven't been assigned to any projects yet.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ marginBottom: '24px' }}>{editProject ? 'Edit Project' : 'Create Project'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Project Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Website Redesign" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Description</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What is this project about?" />
              </div>
              {editProject && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editProject ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMemberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ marginBottom: '8px' }}>Manage Members</h2>
            <p className="text-muted" style={{ marginBottom: '24px' }}>Project: {showMemberModal.name}</p>
            
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input required type="number" value={newMemberId} onChange={e => setNewMemberId(e.target.value)} placeholder="User ID to add" style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary">Add Member</button>
            </form>

            <h4 style={{ marginBottom: '12px' }}>Current Members</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {projectMembers.map(member => (
                <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{member.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {member.id} • {member.role}</div>
                  </div>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px', color: '#fca5a5', fontSize: '0.8rem' }} onClick={() => handleRemoveMember(showMemberModal.id, member.id)}>
                    Remove
                  </button>
                </div>
              ))}
              {projectMembers.length === 0 && <div className="text-muted">No members in this project.</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-ghost" onClick={() => { setShowMemberModal(null); setProjectMembers([]); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
