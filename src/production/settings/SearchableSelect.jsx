import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

const SearchableSelect = ({ options, selected, onSelect, placeholder = "Select..." }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        const lowercasedFilter = searchTerm.toLowerCase();
        return options.filter(opt => opt.label.toLowerCase().includes(lowercasedFilter));
    }, [options, searchTerm]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleToggleOption = (option) => {
        onSelect(option); // The parent component handles the logic of adding/removing
    };

    const getSelectedLabel = () => {
        if (!selected || selected.length === 0) {
            return placeholder;
        }
        if (selected.length === 1) {
            return options.find(opt => opt.value === selected[0])?.label || placeholder;
        }
        return `${selected.length} employees selected`;
    };

    const selectedLabel = getSelectedLabel();

    return (
        <div className="relative" ref={wrapperRef}>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="input bg-background-muted border-border text-foreground w-full text-left flex justify-between items-center">
                <span className="truncate">
                    {selectedLabel}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-card border-b border-border">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="input bg-background-muted w-full pr-8"
                            />
                            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                        </div>
                    </div>
                    <ul>
                        {filteredOptions.map(option => {
                            const isSelected = selected.includes(option.value);
                            return (
                            <li key={option.value} onClick={() => handleToggleOption(option)} className="px-4 py-2 hover:bg-background-muted cursor-pointer flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    readOnly
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span>{option.label}</span>
                            </li>
                        )})}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;