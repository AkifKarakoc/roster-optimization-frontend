import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  Cog6ToothIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { ConstraintDTO } from '../../../types/entities';
import { constraintService } from '../../../services/constraintService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

interface ConstraintListProps {
  onEdit?: (constraint: ConstraintDTO) => void;
  onAdd?: () => void;
  onExcelUpload?: () => void;
}

const ConstraintList: React.FC<ConstraintListProps> = ({ onEdit, onAdd, onExcelUpload }) => {
  const [constraints, setConstraints] = useState<ConstraintDTO[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'HARD' | 'SOFT'>('all');
  const [filterOverrides, setFilterOverrides] = useState<'all' | 'with-overrides' | 'without-overrides'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [constraintsData, statisticsData] = await Promise.all([
        constraintService.getAll(),
        constraintService.getStatistics()
      ]);
      setConstraints(constraintsData);
      setStatistics(statisticsData);
    } catch (err) {
      setError('Failed to load constraints');
      console.error('Error loading constraints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this constraint?')) {
      return;
    }

    try {
      await constraintService.delete(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete constraint');
      console.error('Error deleting constraint:', err);
    }
  };

  const getConstraintTypeInfo = (type: string) => {
    if (type === 'HARD') {
      return {
        color: 'bg-red-100 text-red-800',
        icon: ExclamationTriangleIcon,
        description: 'Must be satisfied'
      };
    } else {
      return {
        color: 'bg-blue-100 text-blue-800',
        icon: InformationCircleIcon,
        description: 'Preferred but flexible'
      };
    }
  };

  const getValueTypeInfo = (constraint: ConstraintDTO) => {
    if (constraint.isBoolean) {
      return { type: 'Boolean', color: 'bg-green-100 text-green-800' };
    } else if (constraint.isNumeric) {
      return { type: 'Number', color: 'bg-purple-100 text-purple-800' };
    } else {
      return { type: 'Text', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatConstraintValue = (value: string, constraint: ConstraintDTO) => {
    if (constraint.isBoolean) {
      return value.toLowerCase() === 'true' ? 'Yes' : 'No';
    }
    return value;
  };

  const filteredConstraints = constraints.filter(constraint => {
    const matchesSearch = constraint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      constraint.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || constraint.type === filterType;
    
    const hasOverrides = (constraint.overrideCount || 0) > 0;
    const matchesOverrides = filterOverrides === 'all' ||
      (filterOverrides === 'with-overrides' && hasOverrides) ||
      (filterOverrides === 'without-overrides' && !hasOverrides);

    return matchesSearch && matchesType && matchesOverrides;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Cog6ToothIcon className="w-6 h-6 text-slate-600" />
          <h1 className="text-2xl font-bold text-gray-900">Constraints</h1>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {filteredConstraints.length}
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
            className="flex items-center space-x-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Constraint</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-slate-600" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-slate-600">{statistics.totalConstraints}</div>
                <div className="text-sm text-gray-600">Total Constraints</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-red-600">{statistics.hardConstraints}</div>
                <div className="text-sm text-gray-600">Hard ({statistics.hardPercentage?.toFixed(1)}%)</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <InformationCircleIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-blue-600">{statistics.softConstraints}</div>
                <div className="text-sm text-gray-600">Soft ({statistics.softPercentage?.toFixed(1)}%)</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <UserGroupIcon className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-orange-600">{statistics.constraintsWithOverrides}</div>
                <div className="text-sm text-gray-600">With Overrides ({statistics.overridePercentage?.toFixed(1)}%)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            placeholder="Search constraints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="HARD">Hard Constraints</option>
            <option value="SOFT">Soft Constraints</option>
          </select>
        </div>

        <div>
          <select
            value={filterOverrides}
            onChange={(e) => setFilterOverrides(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="all">All Constraints</option>
            <option value="with-overrides">With Overrides</option>
            <option value="without-overrides">Without Overrides</option>
          </select>
        </div>
      </div>

      {/* Constraint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConstraints.map((constraint) => {
          const typeInfo = getConstraintTypeInfo(constraint.type);
          const valueTypeInfo = getValueTypeInfo(constraint);
          const TypeIcon = typeInfo.icon;

          return (
            <div key={constraint.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Constraint Name and Type */}
                  <div className="flex items-start space-x-2 mb-3">
                    <TypeIcon className={`w-5 h-5 mt-0.5 ${constraint.type === 'HARD' ? 'text-red-500' : 'text-blue-500'}`} />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {constraint.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                          {constraint.type}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${valueTypeInfo.color}`}>
                          {valueTypeInfo.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {constraint.description && (
                    <p className="text-gray-600 mb-4 text-sm">
                      {constraint.description}
                    </p>
                  )}

                  {/* Default Value */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">Default Value:</div>
                    <div className="bg-gray-50 rounded px-3 py-2 font-mono text-sm text-gray-900">
                      {formatConstraintValue(constraint.defaultValue, constraint)}
                    </div>
                  </div>

                  {/* Override Information */}
                  {constraint.overrideCount && constraint.overrideCount > 0 && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="text-sm font-medium text-orange-900 mb-1">
                        Staff Overrides
                      </div>
                      <div className="text-sm text-orange-800">
                        {constraint.overrideCount} staff member{constraint.overrideCount > 1 ? 's' : ''} 
                        {constraint.staffWithOverridesCount && constraint.staffWithOverridesCount !== constraint.overrideCount && 
                          ` (${constraint.staffWithOverridesCount} unique)`
                        } have custom values
                      </div>
                    </div>
                  )}

                  {/* Constraint Properties */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{typeInfo.description}</span>
                    </div>
                    {constraint.valueType && (
                      <div className="flex justify-between">
                        <span>Value Type:</span>
                        <span className="font-medium">{constraint.valueType}</span>
                      </div>
                    )}
                    {constraint.typeDisplay && (
                      <div className="flex justify-between">
                        <span>Display:</span>
                        <span className="font-medium">{constraint.typeDisplay}</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      constraint.active !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {constraint.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEdit?.(constraint)}
                    className="p-2 text-gray-400 hover:text-slate-600 transition-colors"
                    title="Edit Constraint"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(constraint.id!)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Constraint"
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
      {filteredConstraints.length === 0 && !loading && (
        <div className="text-center py-12">
          <Cog6ToothIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No constraints found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterType !== 'all' || filterOverrides !== 'all'
              ? 'Try adjusting your search criteria or filters.' 
              : 'Get started by creating system constraints.'}
          </p>
          {!searchQuery && filterType === 'all' && filterOverrides === 'all' && (
            <button
              onClick={onAdd}
              className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Add Your First Constraint
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ConstraintList;