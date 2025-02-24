import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';

interface EventFiltersProps {
  onSearch: (query: string) => void;
  onDateRangeChange: (start: Date | null, end: Date | null) => void;
  onTypeChange: (type: string) => void;
  onLocationChange: (location: string) => void;
}

export function EventFilters({
  onSearch,
  onDateRangeChange,
  onTypeChange,
  onLocationChange
}: EventFiltersProps) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search events..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <select
              onChange={(e) => onTypeChange(e.target.value)}
              className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
            >
              <option value="">All Types</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="conference">Conference</option>
              <option value="social">Social</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="date"
              onChange={(e) => onDateRangeChange(new Date(e.target.value), null)}
              className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}