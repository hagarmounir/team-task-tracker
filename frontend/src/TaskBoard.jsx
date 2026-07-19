import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from './api';
import { useAuth } from './AuthContext';
import { Plus, ArrowLeft, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';
import { useToast } from './ToastContext';

export default function TaskBoard() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
  
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [filters, setFilters] = useState({ assigneeId: '', status: '', dueDateFrom: '', dueDateTo: '' });
  const [isFiltering, setIsFiltering] = useState(false);

  const fetchBoardData = async () => {
    try {
      const projRes = await api.get(`/projects/${projectId}`);
      setProject(projRes.data);
      
      let tasksRes;
      if (isFiltering) {
        tasksRes = await api.get('/tasks/search', { params: { projectId, ...filters } });
      } else {
        tasksRes = await api.get(`/tasks/by-project/${projectId}`);
      }
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [projectId, isFiltering]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setIsFiltering(true);
    fetchBoardData();
  };

  const handleClearFilters = () => {
    setFilters({ assigneeId: '', status: '', dueDateFrom: '', dueDateTo: '' });
    setIsFiltering(false);
  };

  const canManageTasks = user?.role === 'ADMINISTRATOR' || user?.role === 'PROJECT_MANAGER';

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: parseInt(projectId) });
      setShowCreateModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
      showToast("Task created successfully!", "success");
      fetchBoardData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create task', "error");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      showToast(`Task moved to ${newStatus}`, "success");
      fetchBoardData(); // Refresh board
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', "error");
    }
  };

  if (loading) return <div>Loading board...</div>;

  const columns = ['TODO', 'IN_PROGRESS', 'DONE', 'REOPENED', 'CANCELLED'];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link to="/" className="btn btn-ghost" style={{ padding: '4px 8px', marginBottom: '12px', display: 'inline-flex' }}>
            <ArrowLeft size={16} /> Back to Projects
          </Link>
          <h1 style={{ marginBottom: '4px' }}>{project?.name} - Tasks</h1>
        </div>
        {canManageTasks && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={20} /> New Task
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleApplyFilters} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px' }}>Assignee ID</label>
          <input type="number" value={filters.assigneeId} onChange={e => setFilters({...filters, assigneeId: e.target.value})} placeholder="User ID" style={{ width: '120px' }} />
        </div>
        <div>
          <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px' }}>Status</label>
          <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} style={{ width: '150px' }}>
            <option value="">Any</option>
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px' }}>Due Date From</label>
          <input type="date" value={filters.dueDateFrom} onChange={e => setFilters({...filters, dueDateFrom: e.target.value})} />
        </div>
        <div>
          <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px' }}>Due Date To</label>
          <input type="date" value={filters.dueDateTo} onChange={e => setFilters({...filters, dueDateTo: e.target.value})} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Filter</button>
          {isFiltering && (
            <button type="button" className="btn btn-ghost" onClick={handleClearFilters} style={{ padding: '8px 16px' }}>Clear</button>
          )}
        </div>
      </form>

      {/* Kanban Board Layout */}
      <div style={{ display: 'flex', gap: '24px', flex: 1, overflowX: 'auto', paddingBottom: '16px' }}>
        {columns.map(status => {
          const colTasks = tasks.filter(t => t.status === status);
          if (colTasks.length === 0 && (status === 'REOPENED' || status === 'CANCELLED')) return null; // Hide empty edge-case columns
          
          return (
            <div key={status} className="glass-panel" style={{ width: '320px', minWidth: '320px', display: 'flex', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.4)' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>{status.replace('_', ' ')}</h3>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{colTasks.length}</span>
              </div>
              
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
                {colTasks.map(task => (
                  <div key={task.id} className="glass-card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setSelectedTask(task)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{task.priority}</span>
                    </div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>{task.title}</h4>
                    <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {task.dueDate && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {task.dueDate}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Quick Action to change status */}
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }} onClick={e => e.stopPropagation()}>
                      <select 
                        style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)' }}
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ marginBottom: '24px' }}>Create Task</h2>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Title</label>
                <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Task title" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Description</label>
                <textarea rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Task details" />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={fetchBoardData} 
        />
      )}
    </div>
  );
}
