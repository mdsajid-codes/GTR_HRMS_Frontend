import React, { useState } from 'react';
import { Clock, Briefcase, Repeat, CalendarOff, Users, ArrowLeft } from 'lucide-react';
import TimeType from '../components/base/TimeType';
import WorkType from '../components/base/WorkType';
import ShiftType from '../components/base/ShiftType';
import WeekOffPolicy from '../components/base/WeekOffPolicy';
import LeaveGroup from '../components/base/LeaveGroup';

const componentMap = {
    'Time Type': <TimeType embedded={true} />,
    'Work Type': <WorkType embedded={true} />,
    'Shift Type': <ShiftType embedded={true} />,
    'Weekly Off Policy': <WeekOffPolicy embedded={true} />,
    'Leave Group': <LeaveGroup embedded={true} />,
};

const policyItems = [
    { name: 'Time Type', icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { name: 'Work Type', icon: Briefcase, color: 'text-sky-600', bgColor: 'bg-sky-100' },
    { name: 'Shift Type', icon: Repeat, color: 'text-green-600', bgColor: 'bg-green-100' },
    { name: 'Weekly Off Policy', icon: CalendarOff, color: 'text-rose-600', bgColor: 'bg-rose-100' },
    { name: 'Leave Group', icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
];

const EmployeePolicy = () => {
    const [activeItem, setActiveItem] = useState(null);

    const handleItemClick = (item) => {
        const component = componentMap[item.name];
        if (component) {
            setActiveItem({ name: item.name, component });
        }
    };

    if (activeItem) {
        return (
            <div className="p-4 sm:p-6">
                <div className="flex items-center mb-6">
                    <button onClick={() => setActiveItem(null)} className="btn-secondary flex items-center mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </button>
                    <h2 className="text-xl font-bold text-slate-700">Manage {activeItem.name}</h2>
                </div>
                {activeItem.component}
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {policyItems.map((item) => (
                <button key={item.name} onClick={() => handleItemClick(item)} className="aspect-[3/2] flex flex-col items-center justify-center bg-white p-4 rounded-full shadow-md hover:shadow-xl hover:bg-slate-50 transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <div className={`p-3 ${item.bgColor} ${item.color} rounded-full mb-3`}><item.icon className="h-6 w-6" /></div>
                    <span className="text-center text-sm font-medium text-slate-700">{item.name}</span>
                </button>
            ))}
        </div>
    );
}

export default EmployeePolicy;
