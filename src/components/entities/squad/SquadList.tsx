import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserGroupIcon,
  DocumentArrowUpIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { SquadDTO, SquadWorkingPatternDTO } from '../../../types/entities';
import { squadService } from '../../../services/squadService';
import { squadWorkingPatternService } from '../../../services/squadWorkingPatternService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

interface SquadListProps {
  onEdit?: (squad: SquadDTO) => void;
  onAdd?: () => void;
  onExcelUpload?: () => void;
}

const SquadList: React.FC<SquadListProps> = ({ onEdit, onAdd, onExcelUpload }) => {
  const [squads, setSquads] = useState<SquadDTO[]>([]);
  const [patterns, setPatterns] = useState<SquadWorkingPatternDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPattern, setFilterPattern] = useState<number | ''>('');
  const [filterStaffing, setFilterStaffing] = useState<'all' | 'with-staff' | 'without-staff'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [squadsData, patternsData] = await Promise.all([
        squadService.getAll(),
        squadWorkingPatternService.getAll()
      ]);
      setSquads(squadsData);
      setPatterns(patternsData);
    } catch (err) {
      setError('Failed to load squads');
      console.error('Error loading squads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this squad?')) {
      return;
    }

    try {
      await squadService.delete(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete squad');
      console.error('Error deleting squad:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getSquadAge = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const getSquadStatus = (squad: SquadDTO) => {
    const daysSinceStart = squad.daysSinceStart || 0;
    
    if (daysSinceStart < 7) {
      return { label: 'New', color: 'bg-blue-100 text-blue-800' };
    } else if (daysSinceStart < 30) {
      return { label: 'Recent', color: 'bg-green-100 text-green-800' };
    } else {
      return { label: 'Established', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const filteredSquads = squads.filter(squad => {
    const matchesSearch = squad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      squad.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPattern = !filterPattern || squad.squadWorkingPatternId === filterPattern;
    
    const staffCount = squad.staffCount || 0;
    const matchesStaffing = filterStaffing === 'all' ||
      (filterStaffing === 'with-staff' && staffCount > 0) ||
      (filterStaffing === 'without-staff' && staffCount === 0);

    return matchesSearch && matchesPattern && matchesStaffing;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserGroupIcon className="w-6 h-6 text-violet-600" />
          <h1 className="text-2xl font-bold text-gray-900">Squads</h1>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {filteredSquads.length}
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
            className="flex items-center space-x-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Squad</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            placeholder="Search squads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <select
            value={filterPattern}
            onChange={(e) => setFilterPattern(e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="">All Working Patterns</option>
            {patterns.map(pattern => (
              <option key={pattern.id} value={pattern.id}>
                {pattern.name} ({pattern.cycleLength} days)
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterStaffing}
            onChange={(e) => setFilterStaffing(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="all">All Squads</option>
            <option value="with-staff">With Staff</option>
            <option value="without-staff">Without Staff</option>
          </select>
        </div>
      </div>

      {/* Squad Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSquads.map((squad) => {
          const status = getSquadStatus(squad);
          const age = getSquadAge(squad.startDate);

          return (
            <div key={squad.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {squad.name}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {squad.description && (
                    <p className="text-gray-600 mb-4 text-sm">
                      {squad.description}
                    </p>
                  )}

                  {/* Working Pattern Info */}
                  {squad.squadWorkingPattern && (
                    <div className="mb-4 p-3 bg-violet-50 rounded-lg">
                      <div className="text-sm font-medium text-violet-900 mb-1">
                        {squad.squadWorkingPattern.name}
                      </div>
                      <div className="text-xs text-violet-700">
                        {squad.squadWorkingPattern.cycleLength} day cycle • 
                        {squad.squadWorkingPattern.workingDaysPercentage?.toFixed(1)}% work ratio
                      </div>
                    </div>
                  )}

                  {/* Squad Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <UsersIcon className="w-4 h-4 text-violet-500 mr-2" />
                      <div>
                        <div className="text-gray-500">Staff Count</div>
                        <div className="font-medium">{squad.staffCount || 0} members</div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="w-4 h-4 text-blue-500 mr-2" />
                      <div>
                        <div className="text-gray-500">Started</div>
                        <div className="font-medium">{formatDate(squad.startDate)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Current Cycle Info */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">Squad Age:</span>
                      <span className="font-medium">{age}</span>
                    </div>
                    {squad.currentCycleDay !== undefined && squad.squadWorkingPattern && (
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-500">Current Cycle Day:</span>
                        <span className="font-medium">
                          Day {squad.currentCycleDay} of {squad.squadWorkingPattern.cycleLength}
                        </span>
                      </div>
                    )}
                    {squad.daysSinceStart !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Total Days:</span>
                        <span className="font-medium">{squad.daysSinceStart} days</span>
                      </div>
                    )}
                  </div>

                  {/* Current Cycle Progress */}
                  {squad.currentCycleDay !== undefined && squad.squadWorkingPattern && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Cycle Progress</span>
                        <span>{Math.round((squad.currentCycleDay / squad.squadWorkingPattern.cycleLength) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-violet-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(squad.currentCycleDay / squad.squadWorkingPattern.cycleLength) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {squad.isNewSquad ? 'New Squad' : 'Established Squad'}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      squad.active !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {squad.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEdit?.(squad)}
                    className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                    title="Edit Squad"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(squad.id!)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Squad"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredSquads.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No squads found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterPattern || filterStaffing !== 'all'
              ? 'Try adjusting your search criteria or filters.' 
              : 'Get started by creating a new squad.'}
          </p>
          {!searchQuery && !filterPattern && filterStaffing === 'all' && (
            <button
              onClick={onAdd}
              className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
            >
              Add Your First Squad
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SquadList;