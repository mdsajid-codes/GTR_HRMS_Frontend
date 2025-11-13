import React from 'react';
import { X } from 'lucide-react';

// Reusable InfoDisplay component
const InfoDisplay = ({ label, value }) => (
    <div>
        <p className="text-sm text-foreground-muted">{label}</p>
        <p className="font-medium text-foreground">{value || <span className="text-foreground-muted/50">N/A</span>}</p>
    </div>
);

// Reusable Section component
const Section = ({ title, children }) => (
    <div className="p-4 border border-border rounded-lg bg-background-muted">
        <h4 className="font-semibold mb-4 text-foreground-muted">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children}
        </div>
    </div>
);

const LeadFullDetailsModal = ({ isOpen, onClose, lead }) => {
    if (!isOpen || !lead) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-semibold text-foreground">All Details for {lead.firstName} {lead.lastName}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-foreground-muted hover:bg-background-muted"><X size={20} /></button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    <Section title="General Information">
                        <InfoDisplay label="Lead No." value={lead.leadNo} />
                        <InfoDisplay label="First Name" value={lead.firstName} />
                        <InfoDisplay label="Last Name" value={lead.lastName} />
                        <InfoDisplay label="Designation" value={lead.designation} />
                        <InfoDisplay label="Email" value={lead.email} />
                        <InfoDisplay label="Phone" value={lead.phone} />
                        <InfoDisplay label="Website" value={lead.website} />
                    </Section>

                    <Section title="Company Information">
                        <InfoDisplay label="Company Name" value={lead.companyName} />
                        <InfoDisplay label="Industry" value={lead.industryName} />
                    </Section>

                    <Section title="Lead Status & Origin">
                        <InfoDisplay label="Current Stage" value={lead.currentStageName} />
                        <InfoDisplay label="Lead Source" value={lead.leadSource} />
                        <InfoDisplay label="Status" value={lead.status} />
                        <InfoDisplay label="Owner" value={lead.ownerName} />
                        <InfoDisplay label="Location" value={lead.locationName} />
                    </Section>

                    {lead.address && (
                        <Section title="Address">
                            <InfoDisplay label="Street" value={lead.address.street} />
                            <InfoDisplay label="City" value={lead.address.city} />
                            <InfoDisplay label="State" value={lead.address.state} />
                            <InfoDisplay label="Zip" value={lead.address.zip} />
                            <InfoDisplay label="Country" value={lead.address.country} />
                        </Section>
                    )}

                    {lead.products && lead.products.length > 0 && (
                        <Section title="Products/Services of Interest">
                            <div className="md:col-span-3">
                                <ul className="list-disc list-inside pl-2">
                                    {lead.products.map(p => <li key={p.id}>{p.name}</li>)}
                                </ul>
                            </div>
                        </Section>
                    )}

                    {lead.requirements && (
                        <Section title="Requirements">
                            <p className="md:col-span-3 text-foreground">{lead.requirements}</p>
                        </Section>
                    )}

                    {lead.notes && (
                        <Section title="Notes">
                            <p className="md:col-span-3 text-foreground">{lead.notes}</p>
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadFullDetailsModal;