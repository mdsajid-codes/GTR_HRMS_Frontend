import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader, AlertCircle, PlusCircle, Mail, Send, AlertTriangle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const EmailStatusIcon = ({ status }) => {
    switch (status) {
        case 'SENT':
            return <CheckCircle className="h-4 w-4 text-green-500" title="Sent" />;
        case 'FAILED':
            return <AlertTriangle className="h-4 w-4 text-red-500" title="Failed" />;
        default:
            return <Send className="h-4 w-4 text-gray-400" title="Sending" />;
    }
};

const EmailItem = ({ email }) => (
    <div className="p-4 bg-background-muted rounded-lg border border-border">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-semibold text-foreground">{email.subject}</p>
                <p className="text-sm text-foreground-muted mt-1 truncate">To: {email.toAddress}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
                <EmailStatusIcon status={email.status} />
                <span>{new Date(email.createdAt).toLocaleString()}</span>
            </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-sm text-foreground-muted whitespace-pre-wrap">{email.body}</p>
        </div>
        <div className="mt-2 text-xs text-foreground-muted">
            Sent by: {email.sentByEmployeeName || 'N/A'}
        </div>
    </div>
);

const EmailsTab = ({ leadId, onComposeEmail }) => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEmails = useCallback(async () => {
        if (!leadId) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crm/emails/by-lead/${leadId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setEmails(response.data);
        } catch (err) {
            setError('Failed to fetch emails.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);

    if (loading) return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Email History</h3>
                <button onClick={onComposeEmail} className="btn-primary flex items-center gap-2"><PlusCircle size={16} /> Compose Email</button>
            </div>
            <div className="space-y-4">
                {emails.length > 0 ? emails.map(email => <EmailItem key={email.id} email={email} />) : <div className="text-center py-10 border-2 border-dashed border-border rounded-lg bg-background-muted text-foreground-muted"><Mail className="mx-auto h-12 w-12" /><h3 className="mt-2 text-sm font-medium text-foreground">No emails found</h3><p className="mt-1 text-sm">Get started by sending an email to this lead.</p></div>}
            </div>
        </div>
    );
};

export default EmailsTab;