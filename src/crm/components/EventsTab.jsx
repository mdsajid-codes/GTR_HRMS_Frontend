import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader, AlertCircle, PlusCircle, Edit, Trash2, Calendar, Clock, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const EventItem = ({ event, onEdit, onDelete }) => (
    <div className="p-4 bg-background-muted rounded-lg border border-border">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-semibold text-foreground">{event.subject}: {event.description?.substring(0, 50) || 'No description'}{event.description?.length > 50 ? '...' : ''}</p>
                <p className="text-sm text-foreground-muted mt-1">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {event.date}</span>
                    <span className="flex items-center gap-1 mt-1"><Clock size={14} /> {event.fromTime} - {event.toTime || 'N/A'}</span>
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => onEdit(event)} className="p-1 text-primary hover:text-primary/80" title="Edit Event"><Edit size={16} /></button>
                <button onClick={() => onDelete(event.id)} className="p-1 text-red-500 hover:text-red-600" title="Delete Event"><Trash2 size={16} /></button>
            </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground-muted">
            <span className="flex items-center gap-1"><Users size={14} /> Participants: {event.employeeNames?.join(', ') || 'None'}</span>
        </div>
    </div>
);

const EventsTab = ({ leadId, onAddEvent, onEditEvent }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEvents = useCallback(async () => {
        if (!leadId) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crm/events/lead/${leadId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setEvents(response.data);
        } catch (err) {
            setError('Failed to fetch events.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/crm/events/${eventId}`, { headers: { "Authorization": `Bearer ${token}` } });
                fetchEvents(); // Refresh list
            } catch (err) {
                alert(`Error: ${err.response?.data?.message || 'Failed to delete event.'}`);
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
                <h3 className="text-lg font-semibold text-foreground">Events</h3>
                <button onClick={onAddEvent} className="btn-primary flex items-center gap-2">
                    <PlusCircle size={16} /> New Event
                </button>
            </div>
            <div className="space-y-4">
                {events.length > 0 ? (
                    events.map(event => (
                        <EventItem key={event.id} event={event} onEdit={onEditEvent} onDelete={handleDelete} />
                    ))
                ) : (
                    <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-background-muted text-foreground-muted">
                        <AlertCircle className="mx-auto h-12 w-12" />
                        <h3 className="mt-2 text-sm font-medium text-foreground">No events found</h3>
                        <p className="mt-1 text-sm">Get started by creating a new event for this lead.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsTab;