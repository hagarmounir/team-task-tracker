import { useState, useEffect } from 'react';
import api from './api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { X, Send, Trash2 } from 'lucide-react';

export default function TaskDetailModal({ task, onClose, onUpdate }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || '');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [priority, setPriority] = useState(task.priority || 'MEDIUM');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  const { user } = useAuth();
  const { showToast, showConfirm } = useToast();

  useEffect(() => {
    fetchComments();
  }, [task.id]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/by-task/${task.id}`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post('/comments', { taskId: task.id, content: newComment });
      setNewComment('');
      showToast("Comment added!", "success");
      fetchComments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add comment', "error");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      showToast("Comment deleted", "success");
      fetchComments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete comment', "error");
    }
  };

  const handleEditCommentSubmit = async (e, commentId) => {
    e.preventDefault();
    if (!editCommentContent.trim()) return;
    try {
      await api.put(`/comments/${commentId}`, { content: editCommentContent });
      setEditingCommentId(null);
      showToast("Comment updated", "success");
      fetchComments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update comment', "error");
    }
  };

  const handleDeleteTask = () => {
    showConfirm("Are you sure you want to delete this task?", async () => {
      try {
        await api.delete(`/tasks/${task.id}`);
        showToast("Task deleted", "success");
        onClose();
        onUpdate();
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to delete task', "error");
      }
    });
  };

  const handleUpdateDetails = async () => {
    setIsUpdating(true);
    try {
      await api.put(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        priority: priority,
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        dueDate: dueDate || null
      });
      showToast("Task updated successfully!", "success");
      onUpdate(); // refresh board
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update task details', "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', height: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ margin: 0 }}>{task.title}</h2>
              <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
              <span className={`badge badge-${task.status.toLowerCase()}`}>{task.status}</span>
            </div>
            <p className="text-muted" style={{ margin: 0 }}>Created on {new Date(task.createdAt).toLocaleDateString()}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {user?.role !== 'MEMBER' && (
              <button className="btn btn-danger" style={{ padding: '8px' }} onClick={handleDeleteTask} title="Delete Task">
                <Trash2 size={18} />
              </button>
            )}
            <button className="btn btn-ghost" style={{ padding: '8px' }} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Main Info */}
          <div style={{ flex: 3, padding: '24px', overflowY: 'auto', borderRight: '1px solid var(--glass-border)' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Description</h4>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '32px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {task.description || 'No description provided.'}
            </div>

            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Comments</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {loadingComments ? <div>Loading comments...</div> : comments.map(c => (
                <div key={c.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-primary)' }}>User {c.userId}</span>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                    {editingCommentId === c.id ? (
                      <form onSubmit={(e) => handleEditCommentSubmit(e, c.id)} style={{ display: 'flex', gap: '8px' }}>
                        <input value={editCommentContent} onChange={e => setEditCommentContent(e.target.value)} style={{ flex: 1, padding: '4px' }} />
                        <button type="submit" className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Save</button>
                        <button type="button" className="btn btn-ghost" onClick={() => setEditingCommentId(null)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Cancel</button>
                      </form>
                    ) : (
                      c.content
                    )}
                  </p>
                  <div style={{ marginTop: '8px', textAlign: 'right' }}>
                     {editingCommentId !== c.id && (
                       <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }} onClick={() => { setEditingCommentId(c.id); setEditCommentContent(c.content); }}>Edit</button>
                     )}
                     <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }} onClick={() => handleDeleteComment(c.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div className="text-muted">No comments yet.</div>}
            </div>

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px' }}>
              <input 
                value={newComment} 
                onChange={e => setNewComment(e.target.value)} 
                placeholder="Write a comment..." 
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Sidebar Info */}
          <div style={{ flex: 1, padding: '24px', background: 'rgba(0,0,0,0.1)' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px' }}>Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: '100%', padding: '6px 10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <div>
                <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px' }}>Assignee ID</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="number" 
                    value={assigneeId} 
                    onChange={e => setAssigneeId(e.target.value)} 
                    placeholder="e.g. 2" 
                    style={{ flex: 1, padding: '6px 10px' }}
                  />
                  <button className="btn btn-ghost" style={{ padding: '6px 10px' }} title="Unassign" onClick={() => setAssigneeId('')}>
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px' }}>Due Date</label>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                  style={{ width: '100%', padding: '6px 10px' }}
                />
              </div>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '8px', padding: '8px' }} 
                onClick={handleUpdateDetails}
                disabled={isUpdating || (assigneeId == (task.assigneeId || '') && dueDate == (task.dueDate || '') && priority === task.priority)}
              >
                {isUpdating ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
