import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { SquadDTO, SquadWorkingPatternDTO } from '../../../types/entities';
import { squadService } from '../../../services/squadService';
import { squadWorkingPatternService } from '../../../services/squadWorkingPatternService';

interface SquadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  squad?: SquadDTO;
}

const SquadForm: React.FC<SquadFormProps> = ({
  isOpen,
  onClose,
  onSave,
  squad
}) => {
  const [formData, setFormData] = useState<Partial<SquadDTO>>({
    name: '',
    startDate: '',
    description: '',
    active: true,
    squadWorkingPatternId: 0
  });
  const [workingPatterns, setWorkingPatterns] = useState<SquadWorkingPatternDTO[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<SquadWorkingPatternDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPatterns, setLoadingPatterns] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!squad?.id;

  useEffect(() => {
    if (isOpen) {
      loadWorkingPatterns();
    }
  }, [isOpen]);

  useEffect(() => {
    if (squad) {
      setFormData({
        name: squad.name || '',
        startDate: squad.startDate || '',
        description: squad.description || '',
        active: squad.active !== false,
        squadWorkingPatternId: squad.squadWorkingPatternId || 0
      });
      
      // Set selected pattern if squad has one
      if (squad.squadWorkingPattern) {
        setSelectedPattern(squad.squadWorkingPattern);
      }
    } else {
      // Set default start date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        name: '',
        startDate: today,
        description: '',
        active: true,
        squadWorkingPatternId: 0
      });
      setSelectedPattern(null);
    }
    setError(null);
  }, [squad, isOpen]);

  const loadWorkingPatterns = async () => {
    try {
      setLoadingPatterns(true);
      const data = await squadWorkingPatternService.getAll();
      setWorkingPatterns(data.filter(p => p.active !== false)); // Only show active patterns
    } catch (err) {
      console.error('Error loading working patterns:', err);
    } finally {
      setLoadingPatterns(false);
    }
  };

  const handlePatternChange = (patternId: number) => {
    const pattern = workingPatterns.find(p => p.id === patternId);
    setSelectedPattern(pattern || null);
    setFormData(prev => ({
      ...prev,
      squadWorkingPatternId: patternId
    }));
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  const calculateSquadInfo = () => {
    if (!formData.startDate) return null;
    
    const startDate = new Date(formData.startDate);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const daysSinceStart = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let currentCycleDay = 0;
    if (selectedPattern && selectedPattern.cycleLength && daysSinceStart >= 0) {
      currentCycleDay = (daysSinceStart % selectedPattern.cycleLength) + 1;
    }
    
    return {
      daysSinceStart: Math.max(0, daysSinceStart),
      currentCycleDay,
      isNew: daysSinceStart < 7,
      isInFuture: daysSinceStart < 0
    };
  };

  const renderPatternPreview = (pattern: SquadWorkingPatternDTO) => {
    if (!pattern.shiftPattern) return null;
    
    const items = pattern.shiftPattern.split(',').map(item => item.trim());
    const maxPreview = 7; // Show max 7 days for preview
    
    return (
      <div className="flex flex-wrap gap-1">
        {items.slice(0, maxPreview).map((item, index) => (
          <span 
            key={index}
            className={`px-2 py-1 text-xs font-medium rounded ${
              item.toLowerCase() === 'dayoff' || item.toLowerCase() === 'off'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-violet-100 text-violet-800'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Squad name is required');
      return;
    }

    if (!formData.squadWorkingPatternId || formData.squadWorkingPatternId === 0) {
      setError('Working pattern is required');
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit) {
        await squadService.update(squad.id!, formData);
      } else {
        await squadService.create(formData as Omit<SquadDTO, 'id'>);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(`Failed to ${isEdit ? 'update' : 'create'} squad`);
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const squadInfo = calculateSquadInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Squad' : 'Add New Squad'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Squad Name *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Enter squad name"
              required
            />
          </div>

          {/* Working Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Working Pattern *
            </label>
            <select
              value={formData.squadWorkingPatternId || ''}
              onChange={(e) => handlePatternChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
              disabled={loadingPatterns}
            >
              <option value="">Select working pattern</option>
              {workingPatterns.map(pattern => (
                <option key={pattern.id} value={pattern.id}>
                  {pattern.name} ({pattern.cycleLength} days, {pattern.workingDaysPercentage?.toFixed(1)}% work)
                </option>
              ))}
            </select>
          </div>

          {/* Selected Pattern Preview */}
          {selectedPattern && (
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <InformationCircleIcon className="w-5 h-5 text-violet-600" />
                <div className="text-sm font-medium text-violet-900">
                  Selected Pattern: {selectedPattern.name}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                <div>
                  <div className="text-violet-700">Cycle Length</div>
                  <div className="font-medium text-violet-900">{selectedPattern.cycleLength} days</div>
                </div>
                <div>
                  <div className="text-violet-700">Working Days</div>
                  <div className="font-medium text-violet-900">{selectedPattern.workingDaysInCycle}</div>
                </div>
                <div>
                  <div className="text-violet-700">Day Offs</div>
                  <div className="font-medium text-violet-900">{selectedPattern.dayOffCount}</div>
                </div>
                <div>
                  <div className="text-violet-700">Work Ratio</div>
                  <div className="font-medium text-violet-900">{selectedPattern.workingDaysPercentage?.toFixed(1)}%</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-violet-700 mb-2">Pattern Preview:</div>
                {renderPatternPreview(selectedPattern)}
              </div>
            </div>
          )}

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={formatDateForInput(formData.startDate || '')}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
          </div>

          {/* Squad Info Display */}
          {squadInfo && formData.startDate && selectedPattern && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-3">Squad Information:</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Days Since Start</div>
                  <div className="font-medium text-gray-900">
                    {squadInfo.isInFuture ? 'Starts in future' : `${squadInfo.daysSinceStart} days`}
                  </div>
                </div>
                {!squadInfo.isInFuture && (
                  <div>
                    <div className="text-gray-500">Current Cycle Day</div>
                    <div className="font-medium text-gray-900">
                      Day {squadInfo.currentCycleDay} of {selectedPattern.cycleLength}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-gray-500">Squad Status</div>
                  <div className={`font-medium ${
                    squadInfo.isInFuture ? 'text-blue-600' :
                    squadInfo.isNew ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {squadInfo.isInFuture ? 'Future Squad' :
                     squadInfo.isNew ? 'New Squad' : 'Established Squad'}
                  </div>
                </div>
              </div>
              
              {!squadInfo.isInFuture && selectedPattern && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Cycle Progress</span>
                    <span>{Math.round((squadInfo.currentCycleDay / selectedPattern.cycleLength) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-violet-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(squadInfo.currentCycleDay / selectedPattern.cycleLength) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              placeholder="Enter squad description (optional)"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active !== false}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">
              Active Squad
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingPatterns}
              className="flex items-center space-x-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CheckIcon className="w-4 h-4" />
              )}
              <span>{loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SquadForm;