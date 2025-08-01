import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { WorkingPeriodDTO, LocalTime } from '../../../types/entities';
import { workingPeriodService } from '../../../services/workingPeriodService';

interface WorkingPeriodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  workingPeriod?: WorkingPeriodDTO;
}

const WorkingPeriodForm: React.FC<WorkingPeriodFormProps> = ({
  isOpen,
  onClose,
  onSave,
  workingPeriod
}) => {
  const [formData, setFormData] = useState<Partial<WorkingPeriodDTO>>({
    name: '',
    startTime: { hour: 8, minute: 0 },
    endTime: { hour: 18, minute: 0 },
    description: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!workingPeriod?.id;

  useEffect(() => {
    if (workingPeriod) {
      setFormData({
        name: workingPeriod.name || '',
        startTime: workingPeriod.startTime || { hour: 8, minute: 0 },
        endTime: workingPeriod.endTime || { hour: 18, minute: 0 },
        description: workingPeriod.description || '',
        active: workingPeriod.active !== false
      });
    } else {
      setFormData({
        name: '',
        startTime: { hour: 8, minute: 0 },
        endTime: { hour: 18, minute: 0 },
        description: '',
        active: true
      });
    }
    setError(null);
  }, [workingPeriod, isOpen]);

  const handleTimeChange = (field: 'startTime' | 'endTime', timeStr: string) => {
    const [hourStr, minuteStr] = timeStr.split(':');
    const hour = parseInt(hourStr) || 0;
    const minute = parseInt(minuteStr) || 0;
    
    setFormData(prev => ({
      ...prev,
      [field]: { hour, minute, second: 0, nano: 0 }
    }));
  };

  const formatTimeForInput = (time: LocalTime | undefined) => {
    if (!time) return '08:00';
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  };

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    
    const start = formData.startTime.hour * 60 + formData.startTime.minute;
    const end = formData.endTime.hour * 60 + formData.endTime.minute;
    
    // Handle overnight periods
    const duration = end < start ? (24 * 60 - start + end) : (end - start);
    return Math.round(duration / 60 * 100) / 100; // Round to 2 decimal places
  };

  const isNightPeriod = () => {
    if (!formData.startTime || !formData.endTime) return false;
    
    const startHour = formData.startTime.hour;
    const endHour = formData.endTime.hour;
    
    // Consider night period if starts after 18:00 or ends before 06:00
    return startHour >= 18 || endHour <= 6 || endHour < startHour;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Working period name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        startTime: {
          ...formData.startTime!,
          second: 0,
          nano: 0
        },
        endTime: {
          ...formData.endTime!,
          second: 0,
          nano: 0
        }
      };

      if (isEdit) {
        await workingPeriodService.update(workingPeriod.id!, submitData);
      } else {
        await workingPeriodService.create(submitData as Omit<WorkingPeriodDTO, 'id'>);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(`Failed to ${isEdit ? 'update' : 'create'} working period`);
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const duration = calculateDuration();
  const isNight = isNightPeriod();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Working Period' : 'Add New Working Period'}
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
              Working Period Name *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter working period name"
              required
            />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Duration and Type Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-gray-900">{duration} hours</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Period Type:</span>
              <span className={`font-medium ${isNight ? 'text-blue-600' : 'text-yellow-600'}`}>
                {isNight ? 'Night Period' : 'Day Period'}
              </span>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              placeholder="Enter working period description (optional)"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active !== false}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">
              Active Working Period
            </label>
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
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default WorkingPeriodForm;