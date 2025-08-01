import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { TaskDTO, DepartmentDTO, QualificationDTO } from '../../../types/entities';
import { taskService } from '../../../services/taskService';
import { departmentService } from '../../../services/departmentService';
import { qualificationService } from '../../../services/qualificationService';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  task?: TaskDTO;
}

const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSave,
  task
}) => {
  const [formData, setFormData] = useState<Partial<TaskDTO>>({
    name: '',
    startTime: '',
    endTime: '',
    priority: 3,
    description: '',
    active: true,
    departmentId: 0,
    requiredQualificationIds: []
  });
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [qualifications, setQualifications] = useState<QualificationDTO[]>([]);
  const [selectedQualifications, setSelectedQualifications] = useState<QualificationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!task?.id;

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        startTime: task.startTime || '',
        endTime: task.endTime || '',
        priority: task.priority || 3,
        description: task.description || '',
        active: task.active !== false,
        departmentId: task.departmentId || 0,
        requiredQualificationIds: task.requiredQualificationIds || []
      });
      // Set selected qualifications if task has them
      if (task.requiredQualifications) {
        setSelectedQualifications(task.requiredQualifications);
      }
    } else {
      setFormData({
        name: '',
        startTime: '',
        endTime: '',
        priority: 3,
        description: '',
        active: true,
        departmentId: 0,
        requiredQualificationIds: []
      });
      setSelectedQualifications([]);
    }
    setError(null);
  }, [task, isOpen]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [departmentsData, qualificationsData] = await Promise.all([
        departmentService.getAll(),
        qualificationService.getAll()
      ]);
      setDepartments(departmentsData);
      setQualifications(qualificationsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const formatDateTimeForInput = (dateTimeStr: string) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  const handleQualificationToggle = (qualification: QualificationDTO) => {
    const isSelected = selectedQualifications.some(q => q.id === qualification.id);
    
    if (isSelected) {
      const newSelected = selectedQualifications.filter(q => q.id !== qualification.id);
      setSelectedQualifications(newSelected);
      setFormData(prev => ({
        ...prev,
        requiredQualificationIds: newSelected.map(q => q.id!).filter(id => id !== undefined)
      }));
    } else {
      const newSelected = [...selectedQualifications, qualification];
      setSelectedQualifications(newSelected);
      setFormData(prev => ({
        ...prev,
        requiredQualificationIds: newSelected.map(q => q.id!).filter(id => id !== undefined)
      }));
    }
  };

  const removeQualification = (qualificationId: number) => {
    const newSelected = selectedQualifications.filter(q => q.id !== qualificationId);
    setSelectedQualifications(newSelected);
    setFormData(prev => ({
      ...prev,
      requiredQualificationIds: newSelected.map(q => q.id!).filter(id => id !== undefined)
    }));
  };

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return '';
    
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const diffMs = end.getTime() - start.getTime();
    
    if (diffMs <= 0) return 'Invalid duration';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Task name is required');
      return;
    }

    if (!formData.departmentId || formData.departmentId === 0) {
      setError('Department is required');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setError('Start time and end time are required');
      return;
    }

    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    
    if (endDate <= startDate) {
      setError('End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit) {
        await taskService.update(task.id!, formData);
      } else {
        await taskService.create(formData as Omit<TaskDTO, 'id'>);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(`Failed to ${isEdit ? 'update' : 'create'} task`);
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const duration = calculateDuration();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Task' : 'Add New Task'}
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

          {/* Name and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter task name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                value={formData.priority || 3}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value={1}>1 - Highest</option>
                <option value={2}>2 - High</option>
                <option value={3}>3 - Medium</option>
                <option value={4}>4 - Low</option>
                <option value={5}>5 - Lowest</option>
              </select>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              value={formData.departmentId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, departmentId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
              disabled={loadingData}
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* DateTime Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formatDateTimeForInput(formData.startTime || '')}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formatDateTimeForInput(formData.endTime || '')}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Duration Display */}
          {duration && (
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-sm text-gray-600">Duration: </span>
              <span className="text-sm font-medium text-gray-900">{duration}</span>
            </div>
          )}

          {/* Required Qualifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Qualifications
            </label>
            
            {/* Selected Qualifications */}
            {selectedQualifications.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedQualifications.map(qual => (
                  <span 
                    key={qual.id}
                    className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full"
                  >
                    {qual.name}
                    <button
                      type="button"
                      onClick={() => removeQualification(qual.id!)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Available Qualifications */}
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div className="text-xs text-gray-500 mb-2">
                Click to select/deselect qualifications:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {qualifications.map(qual => {
                  const isSelected = selectedQualifications.some(q => q.id === qual.id);
                  return (
                    <button
                      key={qual.id}
                      type="button"
                      onClick={() => handleQualificationToggle(qual)}
                      className={`text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        isSelected 
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {qual.name}
                    </button>
                  );
                })}
              </div>
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
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              placeholder="Enter task description (optional)"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active !== false}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">
              Active Task
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
              disabled={loading || loadingData}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default TaskForm;