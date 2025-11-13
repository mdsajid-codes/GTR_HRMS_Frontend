import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    Award,
    Layers,
    FileText,
    LayoutGrid,
    Landmark,
    Network,
    Braces,
    GitFork,
    Flag,
    Plane,
    X,
    ArrowLeft,
} from 'lucide-react';
import Department from '../components/base/Department';
import Designation from '../components/base/Designation';
import JobBand from '../components/base/JobBand';
import Nationality from '../components/base/Nationality';
import Category from '../components/base/Category';
import DocumentType from '../components/base/DocumentType';

const componentMap = {
    'Departments': <Department embedded={true} />,
    'Designations': <Designation embedded={true} />,
    'Job Bands': <JobBand embedded={true} />,
    'Categories': <Category />,
    'Nationalities': <Nationality embedded={true} />,
    'Document Types': <DocumentType embedded={true} />,
};

const creationItems = [
    { name: 'Departments', icon: Building2, action: 'modal', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { name: 'Designations', icon: Award, action: 'modal', color: 'text-green-600', bgColor: 'bg-green-100' },
    { name: 'Job Bands', icon: Layers, action: 'modal', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { name: 'Categories', icon: LayoutGrid, action: 'modal', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { name: 'Finance Business Units', icon: Landmark, path: '#', color: 'text-rose-600', bgColor: 'bg-rose-100' },
    { name: 'Department Dimensions', icon: Network, path: '#', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
    { name: 'Internal Coding', icon: Braces, path: '#', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    { name: 'Sub Divisions', icon: GitFork, path: '#', color: 'text-teal-600', bgColor: 'bg-teal-100' },
    { name: 'Nationalities', icon: Flag, action: 'modal', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { name: 'Document Types', icon: FileText, action: 'modal', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    { name: 'Airport Section', icon: Plane, path: '#', color: 'text-sky-600', bgColor: 'bg-sky-100' },
];

const DepartmentCreation = () => {
    const [activeItem, setActiveItem] = useState(null);
    const navigate = useNavigate();

    const handleItemClick = (item) => {
        const component = componentMap[item.name];
        if (component) {
            setActiveItem({ name: item.name, component });
        } else if (item.path) {
            const { path } = item;
            if (path !== '#') {
                navigate(path);
            } else {
                alert('This feature is not yet implemented.');
            }
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
            {creationItems.map((item) => (
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

export default DepartmentCreation;
