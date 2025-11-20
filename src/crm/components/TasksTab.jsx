import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader, AlertCircle, PlusCircle, Edit, Trash2, Calendar, User, Tag } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const TaskItem = ({ task, onEdit, onDelete }) => (
    <div className="p-4 bg-background-muted rounded-lg border border-border">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-semibold text-foreground">{task.subject}</p>
                <p className="text-sm text-foreground-muted mt-1">{task.comments}</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => onEdit(task)} className="p-1 text-primary hover:text-primary/80" title="Edit Task"><Edit size={16} /></button>
                <button onClick={() => onDelete(task.id)} className="p-1 text-red-500 hover:text-red-600" title="Delete Task"><Trash2 size={16} /></button>
            </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground-muted">
            <span className="flex items-center gap-1"><Calendar size={14} /> Due: {task.dueDate || 'N/A'}</span>
            <span className="flex items-center gap-1"><User size={14} /> To: {task.assignedToName || 'N/A'}</span>
            <span className="flex items-center gap-1"><Tag size={14} /> Status: {task.status || 'N/A'}</span>
        </div>
    </div>
);

const TasksTab = ({ leadId, onAddTask, onEditTask }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTasks = useCallback(async () => {
        if (!leadId) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crm/tasks/lead/${leadId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (err) {
            setError('Failed to fetch tasks.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/crm/tasks/${taskId}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchTasks(); // Refresh list
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete task.'}`);
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Tasks</h3>
                <button onClick={onAddTask} className="btn-primary flex items-center gap-2">
                    <PlusCircle size={16} /> New Task
                </button>
            </div>
            <div className="space-y-4">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskItem key={task.id} task={task} onEdit={onEditTask} onDelete={handleDelete} />
                    ))
                ) : (
                    <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-background-muted text-foreground-muted">
                        <AlertCircle className="mx-auto h-12 w-12" />
                        <h3 className="mt-2 text-sm font-medium text-foreground">No tasks found</h3>
                        <p className="mt-1 text-sm">Get started by creating a new task for this lead.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TasksTab;