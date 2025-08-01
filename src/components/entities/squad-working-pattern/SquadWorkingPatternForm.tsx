import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SquadWorkingPatternDTO, ShiftDTO } from '../../../types/entities';
import { squadWorkingPatternService } from '../../../services/squadWorkingPatternService';
import { shiftService } from '../../../services/shiftService';

interface SquadWorkingPatternFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  pattern?: SquadWorkingPatternDTO;
}

const SquadWorkingPatternForm: React.FC<SquadWorkingPatternFormProps> = ({
  isOpen,
  onClose,
  onSave,
  pattern
}) => {
  const [formData, setFormData] = useState<Partial<SquadWorkingPatternDTO>>({
    name: '',
    shiftPattern: '',
    description: '',
    cycleLength: 7,
    active: true
  });
  const [patternItems, setPatternItems] = useState<string[]>(['']);
  const [shifts, setShifts] = useState<ShiftDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const isEdit = !!pattern?.id;

  useEffect(() => {
    if (isOpen) {
      loadShifts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (pattern) {
      setFormData({
        name: pattern.name || '',
        shiftPattern: pattern.shiftPattern || '',
        description: pattern.description || '',
        cycleLength: pattern.cycleLength || 7,
        active: pattern.active !== false
      });
      
      // Parse existing pattern
      if (pattern.shiftPattern) {
        const items = pattern.shiftPattern.split(',').map(item => item.trim());
        setPatternItems(items);
      } else {
        setPatternItems(['']);
      }
    } else {
      setFormData({
        name: '',
        shiftPattern: '',
        description: '',
        cycleLength: 7,
        active: true
      });
      setPatternItems(['']);
    }
    setError(null);
    setValidationErrors([]);
  }, [pattern, isOpen]);

  const loadShifts = async () => {
    try {
      setLoadingShifts(true);
      const data = await shiftService.getAll();
      setShifts(data);
    } catch (err) {
      console.error('Error loading shifts:', err);
    } finally {
      setLoadingShifts(false);
    }
  };

  const updatePatternFromItems = (items: string[]) => {
    const patternString = items.filter(item => item.trim() !== '').join(',');
    setFormData(prev => ({
      ...prev,
      shiftPattern: patternString,
      cycleLength: items.filter(item => item.trim() !== '').length
    }));
  };

  const addPatternItem = () => {
    const newItems = [...patternItems, ''];
    setPatternItems(newItems);
    updatePatternFromItems(newItems);
  };

  const removePatternItem = (index: number) => {
    if (patternItems.length <= 1) return;
    const newItems = patternItems.filter((_, i) => i !== index);
    setPatternItems(newItems);
    updatePatternFromItems(newItems);
  };

  const updatePatternItem = (index: number, value: string) => {
    const newItems = [...patternItems];
    newItems[index] = value;
    setPatternItems(newItems);
    updatePatternFromItems(newItems);
  };

  const validatePattern = async () => {
    if (!formData.shiftPattern || !formData.cycleLength) {
      setValidationErrors(['Pattern is required']);
      return false;
    }

    try {
      const result = await squadWorkingPatternService.validatePattern({
        shiftPattern: formData.shiftPattern,
        cycleLength: formData.cycleLength
      });
      
      if (!result.valid) {
        setValidationErrors(result.errors || ['Pattern validation failed']);
        return false;
      }
      
      setValidationErrors([]);
      return true;
    } catch (err) {
      setValidationErrors(['Failed to validate pattern']);
      return false;
    }
  };

  const calculateStats = () => {
    const items = patternItems.filter(item => item.trim() !== '');
    const workingDays = items.filter(item => 
      item.trim().toLowerCase() !== 'dayoff' && 
      item.trim().toLowerCase() !== 'off' && 
      item.trim() !== ''
    ).length;
    const dayOffs = items.length - workingDays;
    const percentage = items.length > 0 ? (workingDays / items.length) * 100 : 0;
    
    return { workingDays, dayOffs, percentage, totalDays: items.length };
  };

  const getCommonPatterns = () => {
    return [
      { name: '5-2 (Mon-Fri)', pattern: ['Shift1', 'Shift1', 'Shift1', 'Shift1', 'Shift1', 'DayOff', 'DayOff'] },
      { name: '4-3 Rotating', pattern: ['Shift1', 'Shift1', 'Shift1', 'Shift1', 'DayOff', 'DayOff', 'DayOff'] },
      { name: '2-2-3', pattern: ['Shift1', 'Shift1', 'DayOff', 'DayOff', 'Shift1', 'Shift1', 'Shift1'] },
      { name: '3-1 Continuous', pattern: ['Shift1', 'Shift1', 'Shift1', 'DayOff'] },
    ];
  };

  const applyCommonPattern = (commonPattern: string[]) => {
    setPatternItems([...commonPattern]);
    updatePatternFromItems(commonPattern);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Pattern name is required');
      return;
    }

    if (!await validatePattern()) {
      setError('Pattern validation failed. Please check the errors below.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit) {
        await squadWorkingPatternService.update(pattern.id!, formData);
      } else {
        await squadWorkingPatternService.create(formData as Omit<SquadWorkingPatternDTO, 'id'>);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(`Failed to ${isEdit ? 'update' : 'create'} squad working pattern`);
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const stats = calculateStats();
  const commonPatterns = getCommonPatterns();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Squad Working Pattern' : 'Add New Squad Working Pattern'}
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

          {/* Name and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pattern Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter pattern name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cycle Length
              </label>
              <input
                type="number"
                value={formData.cycleLength || 7}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                title="Automatically calculated from pattern"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              placeholder="Enter pattern description (optional)"
            />
          </div>

          {/* Common Patterns */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Start Templates
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {commonPatterns.map((cp, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyCommonPattern(cp.pattern)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900">{cp.name}</div>
                  <div className="text-xs text-gray-500">{cp.pattern.length} days</div>
                </button>
              ))}
            </div>

            {/* Pattern Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Pattern Preview:</div>
              <div className="flex flex-wrap gap-2">
                {patternItems.map((item, index) => (
                  <span 
                    key={index}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                      !item || item === '' 
                        ? 'bg-gray-200 text-gray-500 border-2 border-dashed'
                        : item.toLowerCase() === 'dayoff' || item.toLowerCase() === 'off'
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-cyan-100 text-cyan-800'
                    }`}
                  >
                    {!item || item === '' ? `Day ${index + 1}` : 
                     item.toLowerCase() === 'dayoff' || item.toLowerCase() === 'off' ? 'Off' : item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pattern Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalDays}</div>
              <div className="text-sm text-blue-700">Total Days</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.workingDays}</div>
              <div className="text-sm text-green-700">Working Days</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.dayOffs}</div>
              <div className="text-sm text-gray-700">Days Off</div>
            </div>
            <div className="bg-cyan-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-cyan-600">{stats.percentage.toFixed(1)}%</div>
              <div className="text-sm text-cyan-700">Work Ratio</div>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm font-medium text-red-800 mb-2">Pattern Validation Errors:</div>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pattern String Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generated Pattern String
            </label>
            <input
              type="text"
              value={formData.shiftPattern || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm"
              placeholder="Pattern will be generated from the builder above"
            />
            <div className="text-xs text-gray-500 mt-1">
              This is the pattern string that will be stored. It's automatically generated from your pattern builder above.
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active !== false}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">
              Active Pattern
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
              type="button"
              onClick={validatePattern}
              disabled={loading || loadingShifts}
              className="px-4 py-2 text-cyan-700 bg-cyan-100 rounded-lg hover:bg-cyan-200 disabled:opacity-50 transition-colors"
            >
              Validate Pattern
            </button>
            <button
              type="submit"
              disabled={loading || loadingShifts}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default SquadWorkingPatternForm;