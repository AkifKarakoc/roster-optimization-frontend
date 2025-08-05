import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { StaffDTO, DepartmentDTO, SquadDTO, QualificationDTO } from '../../../types/entities';
import { staffService } from '../../../services/staffService';
import { departmentService } from '../../../services/departmentService';
import { squadService } from '../../../services/squadService';
import { qualificationService } from '../../../services/qualificationService';

interface StaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  staff?: StaffDTO;
}

const StaffForm: React.FC<StaffFormProps> = ({
  isOpen,
  onClose,
  onSave,
  staff
}) => {
  const [formData, setFormData] = useState<Partial<StaffDTO>>({
    name: '',
    surname: '',
    registrationCode: '',
    email: '',
    phone: '',
    active: true,
    departmentId: 0,
    squadId: 0,
    qualificationIds: []
  });
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [squads, setSquads] = useState<SquadDTO[]>([]);
  const [qualifications, setQualifications] = useState<QualificationDTO[]>([]);
  const [selectedQualifications, setSelectedQualifications] = useState<QualificationDTO[]>([]);
  const [filteredSquads, setFilteredSquads] = useState<SquadDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!staff?.id;

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        surname: staff.surname || '',
        registrationCode: staff.registrationCode || '',
        email: staff.email || '',
        phone: staff.phone || '',
        active: staff.active !== false,
        departmentId: staff.departmentId || 0,
        squadId: staff.squadId || 0,
        qualificationIds: staff.qualificationIds || []
      });
      
      // Set selected qualifications if staff has them
      if (staff.qualifications) {
        setSelectedQualifications(staff.qualifications);
      }
    } else {
      setFormData({
        name: '',
        surname: '',
        registrationCode: '',
        email: '',
        phone: '',
        active: true,
        departmentId: 0,
        squadId: 0,
        qualificationIds: []
      });
      setSelectedQualifications([]);
    }
    setError(null);
  }, [staff, isOpen]);

  // Filter squads when department changes
  useEffect(() => {
    if (formData.departmentId) {
      // For now, show all squads. In a real app, you might filter squads by department
      setFilteredSquads(squads);
    } else {
      setFilteredSquads(squads);
    }
  }, [formData.departmentId, squads]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [departmentsData, squadsData, qualificationsData] = await Promise.all([
        departmentService.getAll(),
        squadService.getAll(),
        qualificationService.getAll()
      ]);
      setDepartments(departmentsData.filter(d => d.active !== false));
      setSquads(squadsData.filter(s => s.active !== false));
      setQualifications(qualificationsData.filter(q => q.active !== false));
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleQualificationToggle = (qualification: QualificationDTO) => {
    const isSelected = selectedQualifications.some(q => q.id === qualification.id);
    
    if (isSelected) {
      const newSelected = selectedQualifications.filter(q => q.id !== qualification.id);
      setSelectedQualifications(newSelected);
      setFormData(prev => ({
        ...prev,
        qualificationIds: newSelected.map(q => q.id!).filter(id => id !== undefined)
      }));
    } else {
      const newSelected = [...selectedQualifications, qualification];
      setSelectedQualifications(newSelected);
      setFormData(prev => ({
        ...prev,
        qualificationIds: newSelected.map(q => q.id!).filter(id => id !== undefined)
      }));
    }
  };

  const removeQualification = (qualificationId: number) => {
    const newSelected = selectedQualifications.filter(q => q.id !== qualificationId);
    setSelectedQualifications(newSelected);
    setFormData(prev => ({
      ...prev,
      qualificationIds: newSelected.map(q => q.id!).filter(id => id !== undefined)
    }));
  };

  const validateForm = () => {
    if (!formData.name?.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.surname?.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.registrationCode?.trim()) {
      setError('Registration code is required');
      return false;
    }
    if (!formData.departmentId || formData.departmentId === 0) {
      setError('Department is required');
      return false;
    }
    if (!formData.squadId || formData.squadId === 0) {
      setError('Squad is required');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
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

      if (isEdit) {
        await staffService.update(staff.id!, formData);
      } else {
        await staffService.create(formData as Omit<StaffDTO, 'id'>);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(`Failed to ${isEdit ? 'update' : 'create'} staff member`);
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedDepartment = departments.find(d => d.id === formData.departmentId);
  const selectedSquad = squads.find(s => s.id === formData.squadId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Staff Member' : 'Add New Staff Member'}
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

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.surname || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Code *
                </label>
                <input
                  type="text"
                  value={formData.registrationCode || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono"
                  placeholder="Enter registration code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Organization Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  value={formData.departmentId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, departmentId: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Squad *
                </label>
                <select
                  value={formData.squadId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, squadId: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                  disabled={loadingData}
                >
                  <option value="">Select squad</option>
                  {filteredSquads.map(squad => (
                    <option key={squad.id} value={squad.id}>
                      {squad.name} {squad.squadWorkingPattern ? `(${squad.squadWorkingPattern.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Organization Info */}
            {(selectedDepartment || selectedSquad) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {selectedDepartment && (
                    <div>
                      <div className="text-gray-600">Department:</div>
                      <div className="font-medium text-gray-900">{selectedDepartment.name}</div>
                      {selectedDepartment.description && (
                        <div className="text-gray-500 text-xs mt-1">{selectedDepartment.description}</div>
                      )}
                    </div>
                  )}
                  {selectedSquad && (
                    <div>
                      <div className="text-gray-600">Squad:</div>
                      <div className="font-medium text-gray-900">{selectedSquad.name}</div>
                      {selectedSquad.squadWorkingPattern && (
                        <div className="text-gray-500 text-xs mt-1">
                          Pattern: {selectedSquad.squadWorkingPattern.name} ({selectedSquad.squadWorkingPattern.cycleLength} days)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Qualifications */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Qualifications</h3>
            
            {/* Selected Qualifications */}
            {selectedQualifications.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Selected Qualifications:</div>
                <div className="flex flex-wrap gap-2">
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
              </div>
            )}

            {/* Available Qualifications */}
            <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="text-xs text-gray-500 mb-3">
                Click to select/deselect qualifications:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
                      {qual.description && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {qual.description}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {qualifications.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No qualifications available
                </div>
              )}
            </div>
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
              Active Staff Member
            </label>
          </div>

          {/* Form Summary */}
          {formData.name && formData.surname && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <div className="text-sm font-medium text-rose-900 mb-2">Staff Member Summary:</div>
              <div className="text-sm text-rose-800">
                <strong>{formData.name} {formData.surname}</strong> 
                {formData.registrationCode && ` (#${formData.registrationCode})`}
                {selectedDepartment && ` • ${selectedDepartment.name} Department`}
                {selectedSquad && ` • ${selectedSquad.name} Squad`}
                {selectedQualifications.length > 0 && ` • ${selectedQualifications.length} Qualification${selectedQualifications.length > 1 ? 's' : ''}`}
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
              disabled={loading || loadingData}
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

export default StaffForm;