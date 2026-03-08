import React from 'react';
import { Calendar } from 'lucide-react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';

export const DateRangeFilter = ({ range, setRange }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 bg-[#1a1a1a] border border-border-color hover:border-primary/50 text-white px-4 py-2.5 rounded-lg transition-all text-sm font-semibold shadow-md"
            >
                <Calendar size={18} className="text-primary" />
                <span>
                    {format(range[0].startDate, 'MMM d, yyyy')} - {format(range[0].endDate, 'MMM d, yyyy')}
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 z-50 bg-[#1a1a1a] border border-border-color rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <DateRange
                        ranges={range}
                        onChange={item => setRange([item.selection])}
                        moveRangeOnFirstSelection={false}
                        months={1}
                        direction="vertical"
                        rangeColors={['#d4af37']}
                        className="analytics-date-range"
                    />
                    <div className="p-2 border-t border-border-color flex justify-end">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="bg-primary text-black px-4 py-1.5 rounded text-xs font-bold uppercase transition-colors hover:bg-highlight"
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
