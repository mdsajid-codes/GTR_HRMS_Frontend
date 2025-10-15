import React, { useState, useEffect, useCallback } from 'react';
import { Loader, AlertCircle, BookOpen, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import * as leaveApi from '../../pages/leaveApi';

const PolicyDetail = ({ label, value, isBool = false }) => (
    <div className="flex justify-between items-center py-2 text-sm">
        <dt className="text-slate-500">{label}</dt>
        <dd className="font-medium text-slate-700 text-right">
            {isBool ? (
                value ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
            ) : (
                value || 'N/A'
            )}
        </dd>
    </div>
);

const LeaveTypePolicyDetails = ({ ltp }) => {
    const [isOpen, setIsOpen] = useState(false);

    const formatValue = (value) => {
        if (typeof value === 'string') {
            return value.replace(/_/g, ' ');
        }
        return value;
    };

    return (
        <div className="bg-slate-50 rounded-lg border border-slate-200/50">
            <button
                className="w-full flex justify-between items-center p-4 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h4 className="font-semibold text-blue-600">{ltp.leaveType?.leaveType.replace('_', ' ')}</h4>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-700">
                        {ltp.quotaLimitType === 'UNLIMITED' ? 'Unlimited' : `${ltp.quotaDays || 0} days / year`}
                    </span>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-200">
                    <dl className="divide-y divide-slate-100">
                        <PolicyDetail label="Annual Quota" value={ltp.quotaLimitType === 'UNLIMITED' ? 'Unlimited' : `${ltp.quotaDays} days`} />
                        <PolicyDetail label="Accrual Type" value={formatValue(ltp.accrualType)} />
                        {ltp.accrualType === 'PERIODIC' && (
                            <>
                                <PolicyDetail label="Accrual Interval" value={formatValue(ltp.accrualInterval)} />
                                <PolicyDetail label="Accrual Amount" value={`${ltp.accrualAmountDays} days`} />
                            </>
                        )}
                        <PolicyDetail label="Allow Half-Day" value={ltp.applicationSettings?.allowHalfDay} isBool />
                        <PolicyDetail label="Requires Comment" value={ltp.applicationSettings?.requireComment} isBool />
                        <PolicyDetail label="Requires Attachment if leave exceeds" value={`${ltp.applicationSettings?.attachmentIfExceedsDays || 'N/A'} days`} />
                        <PolicyDetail label="Allow Back-dated Application" value={ltp.applicationSettings?.allowBackdatedApplication} isBool />
                        {ltp.applicationSettings?.allowBackdatedApplication && (
                            <PolicyDetail label="Max Back-dated Days" value={`${ltp.applicationSettings?.backdatedMaxDays} days`} />
                        )}
                        <PolicyDetail label="Allowed in Notice Period" value={ltp.restrictionSettings?.allowedInNoticePeriod} isBool />
                        <PolicyDetail label="Max Consecutive Days" value={ltp.restrictionSettings?.limitConsecutiveDays ? `${ltp.restrictionSettings?.maxConsecutiveDays} days` : 'No Limit'} />
                        <PolicyDetail label="Requires Approval" value={ltp.approvalFlow?.approvalRequired} isBool />
                        {ltp.approvalFlow?.approvalRequired && (
                            <PolicyDetail label="Approval Levels" value={ltp.approvalLevels?.length || 1} />
                        )}
                        <PolicyDetail label="Year-End Unused Balance" value={formatValue(ltp.yearEndProcessing?.positiveBalanceAction)} />
                    </dl>
                </div>
            )}
        </div>
    );
};

const LeavePolicyView = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPolicies = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await leaveApi.getAllLeavePolicies();
            // For now, we show all policies. In a real scenario, you might filter by employee criteria.
            // We can assume the most relevant is the default one.
            const sortedPolicies = response.data.sort((a, b) => b.defaultPolicy - a.defaultPolicy);
            setPolicies(sortedPolicies);
        } catch (err) {
            setError('Failed to fetch leave policies.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-blue-600" /></div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500"><AlertCircle className="mx-auto h-12 w-12" />{error}</div>;
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Leave Policies</h1>
            {policies.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    <BookOpen className="mx-auto h-12 w-12" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No Policies Found</h3>
                    <p className="mt-1 text-sm">No leave policies have been configured by HR.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {policies.map(policy => (
                        <div key={policy.id} className="bg-white border border-slate-200 rounded-xl shadow-sm">
                            <div className="p-4 border-b border-slate-200">
                                <h2 className="text-xl font-semibold text-slate-800">{policy.name}</h2>
                                {policy.defaultPolicy && <span className="text-xs bg-blue-100 text-blue-600 font-medium px-2 py-0.5 rounded-full ml-2">Default Policy</span>}
                            </div>
                            <div className="p-4">
                                {policy.leaveTypePolicies && policy.leaveTypePolicies.length > 0 ? (
                                    <div className="space-y-3">
                                        {policy.leaveTypePolicies.map(ltp => (
                                            <LeaveTypePolicyDetails key={ltp.id} ltp={ltp} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm">No specific leave type rules are defined for this policy.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LeavePolicyView;