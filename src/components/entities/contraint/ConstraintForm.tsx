import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ConstraintDTO } from '../../../types/entities';
import { constraintService } from '../../../services/constraintService';

interface ConstraintFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  constraint?: ConstraintDTO;
}

type ValueType = 'text' | 'number' | 'boolean';

const ConstraintForm: React.FC<ConstraintFormProps> = ({
  isOpen,
  onClose,
  onSave,
  constraint
}) => {
  const [formData, setFormData] = useState<Partial<ConstraintDTO>>({
    name: '',
    type: 'SOFT',
    defaultValue: '',
    description: '',
    active: true
  });
  const [valueType, setValueType] = useState<ValueType>('text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!constraint?.id;

  useEffect(() => {
    if (constraint) {
      setFormData({
        name: constraint.name || '',
        type: constraint.type || 'SOFT',
        defaultValue: constraint.defaultValue || '',
        description: constraint.description || '',
        active: constraint.active !== false
      });

      // Determine value type from constraint properties
      if (constraint.isBoolean) {
        setValueType('boolean');
      } else if (constraint.isNumeric) {
        setValueType('number');
      } else {
        setValueType('text');
      }
    } else {
      setFormData({
        name: '',
        type: 'SOFT',
        defaultValue: '',
        description: '',
        active: true
      });
      setValueType('text');
    }
    setError(null);
  }, [constraint, isOpen]);

  const handleValueTypeChange = (newType: ValueType) => {
    setValueType(newType);
    
    // Reset default value when type changes
    let newDefaultValue = '';
    if (newType === 'boolean') {
      newDefaultValue = 'false';
    } else if (newType === 'number') {
      newDefaultValue = '0';
    }
    
    setFormData(prev => ({ ...prev, defaultValue: newDefaultValue }));
  };

  const validateConstraintName = (name: string) => {
    // Constraint names should be camelCase or snake_case
    const validNamePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    return validNamePattern.test(name);
  };

  const validateDefaultValue = () => {
    const value = formData.defaultValue || '';
    
    if (valueType === 'number') {
      return !isNaN(Number(value));
    } else if (valueType === 'boolean') {
      return value === 'true' || value === 'false';
    }
    
    return true; // Text values are always valid
  };

  const getCommonConstraints = () => {
    return [
      {
        name: 'maxWorkingHoursPerDay',
        type: 'HARD' as const,
        description: 'Maximum hours an employee can work in a single day',
        valueType: 'number' as ValueType,
        defaultValue: '12'
      },
      {
        name: 'maxWorkingHoursPerWeek',
        type: 'HARD' as const,
        description: 'Maximum hours an employee can work in a week',
        valueType: 'number' as ValueType,
        defaultValue: '40'
      },
      {
        name: 'minimumDayOff',
        type: 'HARD' as const,
        description: 'Minimum number of days off per week',
        valueType: 'number' as ValueType,
        defaultValue: '2'
      },
      {
        name: 'timeBetweenShifts',
        type: 'HARD' as const,
        description: 'Minimum hours between consecutive shifts',
        valueType: 'number' as ValueType,
        defaultValue: '8'
      },
      {
        name: 'nightShiftsAllowed',
        type: 'HARD' as const,
        description: 'Whether employee can work night shifts',
        valueType: 'boolean' as ValueType,
        defaultValue: 'true'
      },
      {
        name: 'workingPatternCompliancy',
        type: 'SOFT' as const,
        description: 'Follow squad working pattern when possible',
        valueType: 'boolean' as ValueType,
        defaultValue: 'true'
      },
      {
        name: 'fairnessTarget',
        type: 'SOFT' as const,
        description: 'Maximum deviation of assigned hours among employees',
        valueType: 'number' as ValueType,
        defaultValue: '4'
      }
    ];
  };

  const applyCommonConstraint = (common: any) => {
    setFormData(prev => ({
      ...prev,
      name: common.name,
      type: common.type,
      defaultValue: common.defaultValue,
      description: common.description
    }));
    setValueType(common.valueType);
  };

  const validateForm = () => {
    if (!formData.name?.trim()) {
      setError('Constraint name is required');
      return false;
    }

    if (!validateConstraintName(formData.name)) {
      setError('Constraint name must be alphanumeric and start with a letter (use camelCase or snake_case)');
      return false;
    }

    if (!formData.defaultValue?.trim()) {
      setError('Default value is required');
      return false;
    }

    if (!validateDefaultValue()) {
      setError(`Invalid ${valueType} value. ${
        valueType === 'number' ? 'Please enter a valid number.' :
        valueType === 'boolean' ? 'Please select true or false.' : ''
      }`);
      return false;
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
        // Set value type flags based on selected type
        isBoolean: valueType === 'boolean',
        isNumeric: valueType === 'number',
        valueType: valueType
      };

      if (isEdit) {
        await constraintService.update(constraint.id!, submitData);
      } else {
        await constraintService.create(submitData as Omit<ConstraintDTO, 'id'>);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(`Failed to ${isEdit ? 'update' : 'create'} constraint`);
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const commonConstraints = getCommonConstraints();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Constraint' : 'Add New Constraint'}
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

          {/* Common Constraints Templates */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quick Start Templates
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {commonConstraints.map((common, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => applyCommonConstraint(common)}
                    className="p-3 text-left border border-gray-300 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        common.type === 'HARD' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {common.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        common.valueType === 'number' 
                          ? 'bg-green-100 text-green-800' 
                          : common.valueType === 'boolean'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {common.valueType}
                      </span>
                    </div>
                    <div className="font-medium text-sm text-gray-900 mb-1">
                      {common.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {common.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Constraint Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Constraint Details</h3>
            <div className="space-y-4">
              {/* Constraint Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constraint Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono"
                  placeholder="e.g., maxWorkingHoursPerDay"
                  required
                />
                <div className="mt-1 text-xs text-gray-500">
                  Use camelCase or snake_case format (letters, numbers, underscore only)
                </div>
              </div>

              {/* Constraint Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constraint Type *
                </label>
                <select
                  value={formData.type || 'SOFT'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'HARD' | 'SOFT' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                >
                  <option value="SOFT">SOFT - Preferred but can be violated</option>
                  <option value="HARD">HARD - Must be enforced</option>
                </select>
                <div className="mt-1 text-xs text-gray-500">
                  <span className="font-medium">HARD:</span> Must never be violated (rejects solution).{' '}
                  <span className="font-medium">SOFT:</span> Preferred but can be violated with penalty.
                </div>
              </div>

              {/* Value Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value Type *
                </label>
                <select
                  value={valueType}
                  onChange={(e) => handleValueTypeChange(e.target.value as ValueType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                >
                  <option value="text">Text - String values</option>
                  <option value="number">Number - Numeric values</option>
                  <option value="boolean">Boolean - True/False values</option>
                </select>
              </div>

              {/* Default Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Value *
                </label>
                {valueType === 'boolean' ? (
                  <select
                    value={formData.defaultValue || 'false'}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    required
                  >
                    <option value="false">False</option>
                    <option value="true">True</option>
                  </select>
                ) : (
                  <input
                    type={valueType === 'number' ? 'number' : 'text'}
                    value={formData.defaultValue || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder={valueType === 'number' ? 'Enter a number' : 'Enter text value'}
                    step={valueType === 'number' ? 'any' : undefined}
                    required
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe what this constraint controls and how it affects optimization..."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active !== false}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Active Constraint
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.name && formData.defaultValue && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-900">Constraint Preview</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-mono font-medium">{formData.name}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    formData.type === 'HARD' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {formData.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    valueType === 'number' 
                      ? 'bg-green-100 text-green-800' 
                      : valueType === 'boolean'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {valueType}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Default Value:</span>
                  <span className="font-medium">{formData.defaultValue}</span>
                </div>
                {formData.description && (
                  <div>
                    <span className="text-gray-600">Description:</span>
                    <div className="mt-1 text-gray-800">{formData.description}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-amber-900 mb-1">Important Notes:</div>
                <ul className="text-amber-800 space-y-1 list-disc list-inside">
                  <li>HARD constraints will reject any solution that violates them</li>
                  <li>SOFT constraints add penalty scores when violated</li>
                  <li>Constraint names must be unique across the system</li>
                  <li>Changes will affect all future optimizations</li>
                </ul>
              </div>
            </div>
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
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default ConstraintForm;