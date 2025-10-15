import React, { useState } from 'react';
import { LayoutGrid, CalendarDays, CalendarOff, ArrowLeft, Layers } from 'lucide-react';
import LeaveCategory from '../components/leaveComponents/LeaveCategory';
import HolidayPolicy from '../components/leaveComponents/HolidayPolicy';

const componentMap = {
    'Leave Category': <LeaveCategory />,
    'Create Holiday Policy' : <HolidayPolicy />
    
};

const policyItems = [
    { name: 'Leave Category', icon: LayoutGrid, action: 'view', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { name: 'Create Holiday Policy', icon: CalendarDays, action: 'view', color: 'text-green-600', bgColor: 'bg-green-100' },
    { name: 'Create Week Break Policy', icon: CalendarOff, path: '#', color: 'text-red-600', bgColor: 'bg-red-100' },
];

const LeavePolicy = () => {
    const [activeItem, setActiveItem] = useState(null);

    const handleItemClick = (item) => {
        const component = componentMap[item.name];
        if (component) {
            setActiveItem({ name: item.name, component });
        } else if (item.path) {
            alert(`The "${item.name}" feature is not yet implemented.`);
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
                <button
                    key={item.name}
                    onClick={() => handleItemClick(item)}
                    className="aspect-[3/2] flex flex-col items-center justify-center bg-white p-4 rounded-full shadow-md hover:shadow-xl hover:bg-slate-50 transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <div className={`p-3 ${item.bgColor} ${item.color} rounded-full mb-3`}>
                        <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-center text-sm font-medium text-slate-700">{item.name}</span>
                </button>
            ))}
        </div>
    );
}

export default LeavePolicy;
