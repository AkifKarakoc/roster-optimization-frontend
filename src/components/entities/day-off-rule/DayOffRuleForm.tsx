import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { DayOffRuleDTO, StaffDTO } from '../../../types/entities';
import { dayOffRuleService } from '../../../services/dayOffRuleService';
import { staffService } from '../../../services/staffService';

interface DayOffRuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  rule?: DayOffRuleDTO;
}

const DayOffRuleForm: React.FC<DayOffRuleFormProps> = ({
  isOpen,
  onClose,
  onSave,
  rule
}) => {
  const [formData, setFormData] = useState<Partial<DayOffRuleDTO>>({
    workingDays: 5,
    offDays: 2,
    fixedOffDays: '',
    staffId: 0
  });
  const [staffList, setStaffList] = useState<StaffDTO[]>([]);
  const [staffWithoutRules, setStaffWithoutRules] = useState<StaffDTO[]>([]);
  const [ruleType, setRuleType] = useState<'flexible' | 'fixed'>('flexible');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!rule?.id;

  const daysOfWeek = [
    { key: 'MONDAY', label: 'Monday', short: 'Mon' },
    { key: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
    { key: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
    { key: 'THURSDAY', label: 'Thursday', short: 'Thu' },
    { key: 'FRIDAY', label: 'Friday', short: 'Fri' },
    { key: 'SATURDAY', label: 'Saturday', short: 'Sat' },
    { key: 'SUNDAY', label: 'Sunday', short: 'Sun' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadStaff();
    }
  }, [isOpen]);

  useEffect(() => {
    if (rule) {
      const hasFixedDays = !!rule.fixedOffDays;
      setRuleType(hasFixedDays ? 'fixed' : 'flexible');
      
      setFormData({
        workingDays: rule.workingDays || 5,
        offDays: rule.offDays || 2,
        fixedOffDays: rule.fixedOffDays || '',
        staffId: rule.staffId || 0
      });

      if (hasFixedDays && rule.fixedOffDays) {
        setSelectedDays(rule.fixedOffDays.split(',').map(day => day.trim()));
      } else {
        setSelectedDays([]);
      }
    } else {
      setRuleType('flexible');
      setFormData({
        workingDays: 5,
        offDays: 2,
        fixedOffDays: '',
        staffId: 0
      });
      setSelectedDays([]);
    }
    setError(null);
  }, [rule, isOpen]);

  const loadStaff = async () => {
    try {
      setLoadingStaff(true);
      const [staffData, rulesData] = await Promise.all([
        staffService.getAll(),
        dayOffRuleService.getAll()
      ]);
      
      setStaffList(staffData.filter(s => s.active !== false));
      
      // Find staff without rules (excluding current rule's staff if editing)
      const staffWithRules = rulesData.map(r => r.staffId);
      const availableStaff = staffData.filter(s => 
        s.active !== false && 
        (!staffWithRules.includes(s.id!) || (isEdit && s.id === rule?.staffId))
      );
      setStaffWithoutRules(availableStaff);
    } catch (err) {
      console.error('Error loading staff:', err);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleRuleTypeChange = (type: 'flexible' | 'fixed') => {
    setRuleType(type);
    if (type === 'flexible') {
      setFormData(prev => ({ ...prev, fixedOffDays: '' }));
      setSelectedDays([]);
    } else {
      setFormData(prev => ({ 
        ...prev, 
        workingDays: 0, 
        offDays: 0,
        fixedOffDays: selectedDays.join(',')
      }));
    }
  };

  const handleDayToggle = (dayKey: string) => {
    const newSelectedDays = selectedDays.includes(dayKey)
      ? selectedDays.filter(d => d !== dayKey)
      : [...selectedDays, dayKey];
    
    setSelectedDays(newSelectedDays);
    setFormData(prev => ({
      ...prev,
      fixedOffDays: newSelectedDays.join(',')
    }));
  };

  const calculateCycleInfo = () => {
    if (ruleType === 'flexible') {
      const totalCycle = (formData.workingDays || 0) + (formData.offDays || 0);
      const workRatio = totalCycle > 0 ? (formData.workingDays || 0) / totalCycle : 0;
      return {
        totalCycle,
        workRatio: workRatio * 100,
        description: `Work ${formData.workingDays} days, then ${formData.offDays} days off (${totalCycle} day cycle)`
      };
    } else {
      const daysCount = selectedDays.length;
      const totalWeekDays = 7;
      const workingDaysInWeek = totalWeekDays - daysCount;
      const workRatio = totalWeekDays > 0 ? workingDaysInWeek / totalWeekDays : 0;
      return {
        totalCycle: 7,
        workRatio: workRatio * 100,
        description: `Fixed ${daysCount} day${daysCount !== 1 ? 's' : ''} off per week (${workingDaysInWeek} working days)`
      };
    }
  };

  const validateForm = () => {
    if (!formData.staffId || formData.staffId === 0) {
      setError('Please select a staff member');
      return false;
    }

    if (ruleType === 'flexible') {
      if (!formData.workingDays || formData.workingDays < 1) {
        setError('Working days must be at least 1');
        return false;
      }
      if (!formData.offDays || formData.offDays < 1) {
        setError('Off days must be at least 1');
        return false;
      }
      if (formData.workingDays > 20) {
        setError('Working days cannot exceed 20');
        return false;
      }
      if (formData.offDays > 10) {
        setError('Off days cannot exceed 10');
        return false;
      }
    } else {
      if (selectedDays.length === 0) {
        setError('Please select at least one fixed day off');
        return false;
      }
      if (selectedDays.length >= 7) {
        setError('Cannot select all 7 days as off days');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        fixedOffDays: ruleType === 'fixed' ? formData.fixedOffDays : undefined
      };

      if (isEdit) {
        await dayOffRuleService.update(rule.id!, submitData);
      } else {
        await dayOffRuleService.create(submitData as Omit<DayOffRuleDTO, 'id'>);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(`Failed to ${isEdit ? 'update' : 'create'} day off rule`);
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const cycleInfo = calculateCycleInfo();
  const selectedStaff = staffList.find(s => s.id === formData.staffId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Day Off Rule' : 'Add New Day Off Rule'}
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

          {/* Staff Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Member *
            </label>
            <select
              value={formData.staffId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, staffId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
              disabled={loadingStaff}
            >
              <option value="">Select staff member</option>
              {staffWithoutRules.map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.displayName || `${staff.name} ${staff.surname}`} 
                  ({staff.registrationCode}) - {staff.department?.name}
                </option>
              ))}
            </select>
            {!loadingStaff && staffWithoutRules.length === 0 && (
              <div className="text-sm text-gray-500 mt-1">
                All active staff members already have day off rules
              </div>
            )}
          </div>

          {/* Selected Staff Info */}
          {selectedStaff && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <InformationCircleIcon className="w-5 h-5 text-teal-600" />
                <div className="text-sm font-medium text-teal-900">
                  Selected Staff: {selectedStaff.displayName || `${selectedStaff.name} ${selectedStaff.surname}`}
                </div>
              </div>
              <div className="text-sm text-teal-800 space-y-1">
                <div>Registration: #{selectedStaff.registrationCode}</div>
                <div>Department: {selectedStaff.department?.name}</div>
                <div>Squad: {selectedStaff.squad?.name}</div>
              </div>
            </div>
          )}

          {/* Rule Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rule Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRuleTypeChange('flexible')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  ruleType === 'flexible'
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="font-medium mb-1">Flexible Rule</div>
                <div className="text-sm text-gray-600">
                  Work X days, then Y days off (rotating pattern)
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleRuleTypeChange('fixed')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  ruleType === 'fixed'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="font-medium mb-1">Fixed Rule</div>
                <div className="text-sm text-gray-600">
                  Fixed days of the week off (e.g., weekends)
                </div>
              </button>
            </div>
          </div>

          {/* Flexible Rule Configuration */}
          {ruleType === 'flexible' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Working Days *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.workingDays || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, workingDays: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Off Days *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.offDays || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, offDays: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="2"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Fixed Rule Configuration */}
          {ruleType === 'fixed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Fixed Days Off *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => handleDayToggle(day.key)}
                    className={`p-3 text-sm font-medium rounded-lg transition-colors ${
                      selectedDays.includes(day.key)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="hidden sm:block">{day.label}</div>
                    <div className="sm:hidden">{day.short}</div>
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Select the days of the week that should always be off days
              </div>
            </div>
          )}

          {/* Rule Preview */}
          {(cycleInfo.totalCycle > 0) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-3">Rule Preview:</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Cycle Length</div>
                  <div className="font-medium text-gray-900">{cycleInfo.totalCycle} days</div>
                </div>
                <div>
                  <div className="text-gray-500">Work Ratio</div>
                  <div className="font-medium text-gray-900">{cycleInfo.workRatio.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-gray-500">Pattern</div>
                  <div className="font-medium text-gray-900">{ruleType === 'flexible' ? 'Rotating' : 'Weekly'}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600 bg-white rounded px-3 py-2">
                {cycleInfo.description}
              </div>
            </div>
          )}

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
              disabled={loading || loadingStaff}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default DayOffRuleForm;