import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ShiftDTO, WorkingPeriodDTO, LocalTime } from '../../../types/entities';
import { shiftService } from '../../../services/shiftService';
import { workingPeriodService } from '../../../services/workingPeriodService';

interface ShiftFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  shift?: ShiftDTO;
}

const ShiftForm: React.FC<ShiftFormProps> = ({
  isOpen,
  onClose,
  onSave,
  shift
}) => {
  const [formData, setFormData] = useState<Partial<ShiftDTO>>({
    name: '',
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 17, minute: 0 },
    description: '',
    isNightShift: false,
    fixed: false,
    active: true,
    workingPeriodId: 0
  });
  const [workingPeriods, setWorkingPeriods] = useState<WorkingPeriodDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!shift?.id;

  useEffect(() => {
    if (isOpen) {
      loadWorkingPeriods();
    }
  }, [isOpen]);

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name || '',
        startTime: shift.startTime || { hour: 9, minute: 0 },
        endTime: shift.endTime || { hour: 17, minute: 0 },
        description: shift.description || '',
        isNightShift: shift.isNightShift || false,
        fixed: shift.fixed || false,
        active: shift.active !== false,
        workingPeriodId: shift.workingPeriodId || 0
      });
    } else {
      setFormData({
        name: '',
        startTime: { hour: 9, minute: 0 },
        endTime: { hour: 17, minute: 0 },
        description: '',
        isNightShift: false,
        fixed: false,
        active: true,
        workingPeriodId: 0
      });
    }
    setError(null);
  }, [shift, isOpen]);

  const loadWorkingPeriods = async () => {
    try {
      setLoadingPeriods(true);
      const data = await workingPeriodService.getAll();
      setWorkingPeriods(data);
    } catch (err) {
      console.error('Error loading working periods:', err);
    } finally {
      setLoadingPeriods(false);
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', timeStr: string) => {
    const [hourStr, minuteStr] = timeStr.split(':');
    const hour = parseInt(hourStr) || 0;
    const minute = parseInt(minuteStr) || 0;
    
    setFormData(prev => ({
      ...prev,
      [field]: { hour, minute, second: 0, nano: 0 }
    }));
  };

  const formatTimeForInput = (time: LocalTime | string | undefined) => {
    if (!time) return '09:00';
    if (typeof time === 'string') return time;
    if (typeof time.hour === 'number' && typeof time.minute === 'number') {
      return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    }
    return '09:00';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Shift name is required');
      return;
    }

    if (!formData.workingPeriodId || formData.workingPeriodId === 0) {
      setError('Working period is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);


      // LocalTime objesini 'HH:mm' stringine çevir
      const toTimeString = (timeObj: any) => {
        if (!timeObj) return '';
        if (typeof timeObj === 'string') return timeObj;
        const h = String(timeObj.hour).padStart(2, '0');
        const m = String(timeObj.minute).padStart(2, '0');
        return `${h}:${m}`;
      };

      const submitData = {
        ...formData,
        startTime: toTimeString(formData.startTime),
        endTime: toTimeString(formData.endTime)
      };

      if (isEdit) {
        await shiftService.update(shift.id!, submitData as any);
      } else {
        await shiftService.create(submitData as any);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(`Failed to ${isEdit ? 'update' : 'create'} shift`);
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Shift' : 'Add New Shift'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shift Name *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter shift name"
              required
            />
          </div>

          {/* Working Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Working Period *
            </label>
            <select
              value={formData.workingPeriodId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, workingPeriodId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              disabled={loadingPeriods}
            >
              <option value="">Select working period</option>
              {workingPeriods.map(period => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                value={formatTimeForInput(formData.startTime)}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                value={formatTimeForInput(formData.endTime)}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Enter shift description (optional)"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isNightShift"
                checked={formData.isNightShift || false}
                onChange={(e) => setFormData(prev => ({ ...prev, isNightShift: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isNightShift" className="ml-2 text-sm text-gray-700">
                Night Shift
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="fixed"
                checked={formData.fixed || false}
                onChange={(e) => setFormData(prev => ({ ...prev, fixed: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="fixed" className="ml-2 text-sm text-gray-700">
                Fixed Shift
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active !== false}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                Active Shift
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingPeriods}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default ShiftForm;