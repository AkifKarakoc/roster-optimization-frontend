import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CalendarDaysIcon,
  DocumentArrowUpIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { ShiftDTO } from '../../../types/entities';
import { shiftService } from '../../../services/shiftService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

interface ShiftListProps {
  onEdit?: (shift: ShiftDTO) => void;
  onAdd?: () => void;
  onExcelUpload?: () => void;
}

const ShiftList: React.FC<ShiftListProps> = ({ onEdit, onAdd, onExcelUpload }) => {
  const [shifts, setShifts] = useState<ShiftDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'day' | 'night'>('all');

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shiftService.getAll();
      setShifts(data);
    } catch (err) {
      setError('Failed to load shifts');
      console.error('Error loading shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) {
      return;
    }

    try {
      await shiftService.delete(id);
      await loadShifts();
    } catch (err) {
      setError('Failed to delete shift');
      console.error('Error deleting shift:', err);
    }
  };

  const formatTime = (time: any) => {
    if (!time) return '';
    if (typeof time === 'string') return time;
    return `${time.hour?.toString().padStart(2, '0')}:${time.minute?.toString().padStart(2, '0')}`;
  };

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = shift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shift.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'day' && !shift.isNightShift) ||
      (filterType === 'night' && shift.isNightShift);

    return matchesSearch && matchesFilter;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarDaysIcon className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Shifts</h1>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {filteredShifts.length}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onExcelUpload}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <DocumentArrowUpIcon className="w-5 h-5" />
            <span>Excel Import</span>
          </button>
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Shift</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search shifts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'all' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('day')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'day' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SunIcon className="w-4 h-4" />
            <span>Day</span>
          </button>
          <button
            onClick={() => setFilterType('night')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'night' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MoonIcon className="w-4 h-4" />
            <span>Night</span>
          </button>
        </div>
      </div>

      {/* Shift Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShifts.map((shift) => (
          <div key={shift.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {shift.isNightShift ? (
                    <MoonIcon className="w-4 h-4 text-blue-500" />
                  ) : (
                    <SunIcon className="w-4 h-4 text-yellow-500" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {shift.name}
                  </h3>
                </div>

                {/* Time Range */}
                <div className="mb-3">
                  <span className="text-lg font-mono text-indigo-600">
                    {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                  </span>
                  {shift.durationHours && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({shift.durationHours}h)
                    </span>
                  )}
                </div>

                {shift.description && (
                  <p className="text-gray-600 mb-3 text-sm">
                    {shift.description}
                  </p>
                )}

                {/* Working Period */}
                {shift.workingPeriod && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">Period: </span>
                    <span className="text-sm font-medium text-gray-700">
                      {shift.workingPeriod.name}
                    </span>
                  </div>
                )}

                {/* Status and Badges */}
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    shift.active !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {shift.active !== false ? 'Active' : 'Inactive'}
                  </span>
                  {shift.fixed && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      Fixed
                    </span>
                  )}
                  {shift.crossesMidnight && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      Crosses Midnight
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onEdit?.(shift)}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                  title="Edit Shift"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(shift.id!)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Shift"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredShifts.length === 0 && !loading && (
        <div className="text-center py-12">
          <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search criteria or filters.' 
              : 'Get started by creating a new shift.'}
          </p>
          {!searchQuery && filterType === 'all' && (
            <button
              onClick={onAdd}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Your First Shift
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ShiftList;