import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Users, Edit, Loader, Building, Briefcase, Globe, MapPin, Tag, User, Calendar, StickyNote } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeadFullDetailsModal from '../components/LeadFullDetailsModal'; // New modal for full details

const API_URL = import.meta.env.VITE_API_BASE_URL;
const InfoDisplay = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-2">
        {Icon && <Icon className="h-4 w-4 text-foreground-muted mt-0.5 flex-shrink-0" />}
        <div>
            <p className="text-sm text-foreground-muted">{label}</p>
            <p className="font-medium text-foreground break-words">{value || <span className="text-foreground-muted/50">N/A</span>}</p>
        </div>
    </div>
);

const Section = ({ title, children }) => (
    <div className="p-4 border border-border rounded-lg bg-background-muted">
        <h4 className="font-semibold mb-4 text-foreground-muted">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children}
        </div>
    </div>
);

const SidebarTab = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors ${
            isActive
                ? 'bg-primary/10 text-primary'
                : 'text-foreground-muted hover:bg-background-muted hover:text-foreground'
        }`}
    >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
    </button>
);

const ActivityFeed = ({ lead }) => (
    <div className="p-4">
        <h3 className="font-semibold text-foreground mb-4">Activity Feed</h3>
        <p className="text-sm text-foreground-muted">Activity feed for this lead will be displayed here. This can include notes, tasks, events, and emails.</p>
        {/* Placeholder for activity items */}
        <div className="mt-4 space-y-4">
            <div className="p-3 bg-background-muted rounded-lg">
                <p className="text-sm font-medium">Note Added</p>
                <p className="text-xs text-foreground-muted">by Admin on {new Date().toLocaleDateString()}</p>
                <p className="text-sm mt-1">Called the lead, they are interested in a demo next week.</p>
            </div>
        </div>
    </div>
);

const LeadInfo = () => {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
    const [isFullDetailsModalOpen, setIsFullDetailsModalOpen] = useState(false);
    const [activeSidebarTab, setActiveSidebarTab] = useState('Activity');

    const fetchLeadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/crm/leads/${leadId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            setLead(response.data);
        } catch (err) {
            setError('Failed to fetch lead details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchLeadData();
    }, [fetchLeadData]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">{error}</div>;
    }

    if (!lead) {
        return <div className="text-center p-4">Lead not found.</div>;
    }

    const initials = `${lead.firstName ? lead.firstName.charAt(0) : ''}${lead.lastName ? lead.lastName.charAt(0) : ''}`;

    return (
        <div className="bg-background text-foreground flex flex-col h-full">
            {/* Header */}
            <header className={`bg-card text-card-foreground border-b border-border flex-shrink-0 transition-all duration-300 ${isHeaderExpanded ? 'h-auto' : 'h-24'}`}>
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">                        <button onClick={() => navigate('/crm-dashboard/leads')} className="p-1.5 rounded-full hover:bg-background-muted">
                            <ArrowLeft className="h-5 w-5 text-foreground" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                                {initials}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">{lead.firstName} {lead.lastName}</h2>
                                <p className="text-sm text-foreground-muted">Lead No: {lead.leadNo || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col text-sm text-right">
                            <p className="text-foreground-muted">Phone: {lead.phone || 'N/A'}</p>
                            <p className="text-foreground-muted">Email: {lead.email || 'N/A'}</p>
                        </div>
                        <button onClick={() => setIsFullDetailsModalOpen(true)} className="btn-secondary p-2" title="View All Details">
                            <Users className="h-5 w-5" />
                        </button>
                        <button onClick={() => alert('Edit functionality to be implemented here.')} className="btn-secondary p-2" title="Edit Lead">
                            <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => setIsHeaderExpanded(!isHeaderExpanded)} className="btn-secondary p-2" title={isHeaderExpanded ? 'Collapse Details' : 'Expand Details'}>
                            {isHeaderExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {isHeaderExpanded && (
                    <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <InfoDisplay icon={Building} label="Company" value={lead.companyName} />
                        <InfoDisplay icon={Briefcase} label="Industry" value={lead.industryName} />
                        <InfoDisplay icon={Globe} label="Website" value={lead.website} />
                        <InfoDisplay icon={MapPin} label="Location" value={lead.locationName} />
                        <InfoDisplay icon={Tag} label="Status" value={lead.status} />
                        <InfoDisplay icon={User} label="Owner" value={lead.ownerName} />
                        <InfoDisplay icon={Calendar} label="Created At" value={lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'N/A'} />
                        <InfoDisplay icon={Calendar} label="Last Updated At" value={lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : 'N/A'} />
                        {lead.notes && <InfoDisplay icon={StickyNote} label="Notes" value={lead.notes} />}
                    </div>
                )}
            </header>

            <div className="flex-1 flex overflow-hidden">

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto">
                    {activeSidebarTab === 'Activity' && <ActivityFeed lead={lead} />}
                    {activeSidebarTab === 'Tasks' && <div className="p-4"><p>Tasks related to this lead will be shown here.</p></div>}
                    {activeSidebarTab === 'Events' && <div className="p-4"><p>Events scheduled with this lead will be shown here.</p></div>}
                    {activeSidebarTab === 'Notes' && (
                        <div className="p-4">
                            <h3 className="font-semibold text-foreground mb-2">Notes</h3>
                            <div className="p-3 bg-background-muted rounded-lg text-sm whitespace-pre-wrap">
                                {lead.notes || 'No notes for this lead.'}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Full Details Modal */}
            <LeadFullDetailsModal
                isOpen={isFullDetailsModalOpen}
                onClose={() => setIsFullDetailsModalOpen(false)}
                lead={lead}
            />
        </div>
    );
}

export default LeadInfo;
