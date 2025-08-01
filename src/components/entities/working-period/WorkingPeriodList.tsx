import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ClockIcon,
  DocumentArrowUpIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { WorkingPeriodDTO } from '../../../types/entities';
import { workingPeriodService } from '../../../services/workingPeriodService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

interface WorkingPeriodListProps {
  onEdit?: (workingPeriod: WorkingPeriodDTO) => void;
  onAdd?: () => void;
  onExcelUpload?: () => void;
}

const WorkingPeriodList: React.FC<WorkingPeriodListProps> = ({ onEdit, onAdd, onExcelUpload }) => {
  const [workingPeriods, setWorkingPeriods] = useState<WorkingPeriodDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWorkingPeriods();
  }, []);

  const loadWorkingPeriods = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workingPeriodService.getAll();
      setWorkingPeriods(data);
    } catch (err) {
      setError('Failed to load working periods');
      console.error('Error loading working periods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this working period?')) {
      return;
    }

    try {
      await workingPeriodService.delete(id);
      await loadWorkingPeriods();
    } catch (err) {
      setError('Failed to delete working period');
      console.error('Error deleting working period:', err);
    }
  };

  const formatTime = (time: any) => {
    if (!time) return '';
    if (typeof time === 'string') return time;
    return `${time.hour?.toString().padStart(2, '0')}:${time.minute?.toString().padStart(2, '0')}`;
  };

  const filteredWorkingPeriods = workingPeriods.filter(period =>
    period.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    period.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ClockIcon className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">Working Periods</h1>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {filteredWorkingPeriods.length}
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
            className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Working Period</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search working periods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Working Period Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkingPeriods.map((period) => (
          <div key={period.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  {period.isNightPeriod ? (
                    <MoonIcon className="w-5 h-5 text-blue-500" />
                  ) : (
                    <SunIcon className="w-5 h-5 text-yellow-500" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {period.name}
                  </h3>
                </div>

                {/* Time Range */}
                <div className="mb-3">
                  <div className="text-lg font-mono text-emerald-600 mb-1">
                    {formatTime(period.startTime)} - {formatTime(period.endTime)}
                  </div>
                  {period.durationHours && (
                    <div className="text-sm text-gray-500">
                      Duration: {period.durationHours} hours
                    </div>
                  )}
                </div>

                {period.description && (
                  <p className="text-gray-600 mb-3 text-sm">
                    {period.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span>Shifts: {period.shiftCount || 0}</span>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    period.active !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {period.active !== false ? 'Active' : 'Inactive'}
                  </span>
                  {period.isNightPeriod && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      Night Period
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onEdit?.(period)}
                  className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                  title="Edit Working Period"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(period.id!)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Working Period"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredWorkingPeriods.length === 0 && !loading && (
        <div className="text-center py-12">
          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No working periods found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating a new working period.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onAdd}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add Your First Working Period
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkingPeriodList;