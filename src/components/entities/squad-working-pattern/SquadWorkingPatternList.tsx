import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ListBulletIcon,
  DocumentArrowUpIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { SquadWorkingPatternDTO } from '../../../types/entities';
import { squadWorkingPatternService } from '../../../services/squadWorkingPatternService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

interface SquadWorkingPatternListProps {
  onEdit?: (pattern: SquadWorkingPatternDTO) => void;
  onAdd?: () => void;
  onExcelUpload?: () => void;
}

const SquadWorkingPatternList: React.FC<SquadWorkingPatternListProps> = ({ onEdit, onAdd, onExcelUpload }) => {
  const [patterns, setPatterns] = useState<SquadWorkingPatternDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCycleLength, setFilterCycleLength] = useState<number | ''>('');


  useEffect(() => {
    console.log('[SquadWorkingPatternList] Mount, loading patterns...');
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[SquadWorkingPatternList] Fetching squad working patterns...');
      const data = await squadWorkingPatternService.getAll();
      console.log('[SquadWorkingPatternList] Data loaded:', data);
      setPatterns(data);
    } catch (err) {
      setError('Failed to load squad working patterns');
      console.error('[SquadWorkingPatternList] Error loading squad working patterns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this squad working pattern?')) {
      return;
    }

    try {
      await squadWorkingPatternService.delete(id);
      await loadPatterns();
    } catch (err) {
      setError('Failed to delete squad working pattern');
      console.error('Error deleting squad working pattern:', err);
    }
  };

  const parsePattern = (pattern: string) => {
    if (!pattern) return [];
    return pattern.split(',').map(item => item.trim());
  };

  const renderPatternPreview = (pattern: string, cycleLength: number) => {
    const items = parsePattern(pattern);
    const maxPreview = 14; // Show max 14 days for preview
    
    return (
      <div className="flex flex-wrap gap-1">
        {items.slice(0, maxPreview).map((item, index) => (
          <span 
            key={index}
            className={`px-2 py-1 text-xs font-medium rounded ${
              item.toLowerCase() === 'dayoff' || item.toLowerCase() === 'off'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {item.toLowerCase() === 'dayoff' || item.toLowerCase() === 'off' ? 'Off' : item}
          </span>
        ))}
        {items.length > maxPreview && (
          <span className="px-2 py-1 text-xs text-gray-400">
            +{items.length - maxPreview} more...
          </span>
        )}
      </div>
    );
  };

  const getPatternStats = (pattern: SquadWorkingPatternDTO) => {
    const workingDays = pattern.workingDaysInCycle || 0;
    const dayOffs = pattern.dayOffCount || 0;
    const percentage = pattern.workingDaysPercentage || 0;
    
    return { workingDays, dayOffs, percentage };
  };

  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pattern.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pattern.shiftPattern?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCycleLength = !filterCycleLength || pattern.cycleLength === filterCycleLength;

    return matchesSearch && matchesCycleLength;
  });

  // Get unique cycle lengths for filter
  const cycleLengths = Array.from(new Set(patterns.map(p => p.cycleLength))).sort((a, b) => a - b);


  if (loading) {
    console.log('[SquadWorkingPatternList] Loading...');
    return <LoadingSpinner />;
  }
  if (error) {
    console.error('[SquadWorkingPatternList] Render error:', error);
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ListBulletIcon className="w-6 h-6 text-cyan-600" />
          <h1 className="text-2xl font-bold text-gray-900">Squad Working Patterns</h1>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {filteredPatterns.length}
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
            className="flex items-center space-x-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Pattern</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        <div className="min-w-[200px]">
          <select
            value={filterCycleLength}
            onChange={(e) => setFilterCycleLength(e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="">All Cycle Lengths</option>
            {cycleLengths.map(length => (
              <option key={length} value={length}>
                {length} days cycle
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pattern Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatterns.map((pattern) => {
          const stats = getPatternStats(pattern);

          return (
            <div key={pattern.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {pattern.name}
                    </h3>
                    {!pattern.isValidPattern && pattern.patternErrors && pattern.patternErrors.length > 0 && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Invalid
                      </span>
                    )}
                  </div>

                  {pattern.description && (
                    <p className="text-gray-600 mb-4 text-sm">
                      {pattern.description}
                    </p>
                  )}

                  {/* Pattern Preview */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Pattern Preview:</div>
                    {renderPatternPreview(pattern.shiftPattern, pattern.cycleLength)}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="w-4 h-4 text-cyan-500 mr-2" />
                      <div>
                        <div className="text-gray-500">Cycle Length</div>
                        <div className="font-medium">{pattern.cycleLength} days</div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <ClockIcon className="w-4 h-4 text-green-500 mr-2" />
                      <div>
                        <div className="text-gray-500">Working Days</div>
                        <div className="font-medium">{stats.workingDays}/{pattern.cycleLength}</div>
                      </div>
                    </div>
                  </div>

                  {/* Working Percentage */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">Work Ratio</span>
                      <span className="font-medium">{stats.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-cyan-600 h-2 rounded-full" 
                        style={{ width: `${stats.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Squad Count and Status */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Squads: {pattern.squadCount || 0}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      pattern.active !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pattern.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Pattern Errors */}
                  {pattern.patternErrors && pattern.patternErrors.length > 0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="text-xs font-medium text-red-800 mb-1">Pattern Issues:</div>
                      {pattern.patternErrors.map((error, index) => (
                        <div key={index} className="text-xs text-red-700">
                          • {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEdit?.(pattern)}
                    className="p-2 text-gray-400 hover:text-cyan-600 transition-colors"
                    title="Edit Pattern"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pattern.id!)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Pattern"
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
      {filteredPatterns.length === 0 && !loading && (
        <div className="text-center py-12">
          <ListBulletIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No squad working patterns found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterCycleLength
              ? 'Try adjusting your search criteria or filters.' 
              : 'Get started by creating a new squad working pattern.'}
          </p>
          {!searchQuery && !filterCycleLength && (
            <button
              onClick={onAdd}
              className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Add Your First Pattern
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SquadWorkingPatternList;