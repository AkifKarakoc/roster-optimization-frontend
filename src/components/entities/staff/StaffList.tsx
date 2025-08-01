import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserGroupIcon,
  DocumentArrowUpIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  UsersIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { StaffDTO, DepartmentDTO, SquadDTO, QualificationDTO } from '../../../types/entities';
import { staffService } from '../../../services/staffService';
import { departmentService } from '../../../services/departmentService';
import { squadService } from '../../../services/squadService';
import { qualificationService } from '../../../services/qualificationService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

interface StaffListProps {
  onEdit?: (staff: StaffDTO) => void;
  onAdd?: () => void;
  onExcelUpload?: () => void;
}

const StaffList: React.FC<StaffListProps> = ({ onEdit, onAdd, onExcelUpload }) => {
  const [staff, setStaff] = useState<StaffDTO[]>([]);
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [squads, setSquads] = useState<SquadDTO[]>([]);
  const [qualifications, setQualifications] = useState<QualificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<number | ''>('');
  const [filterSquad, setFilterSquad] = useState<number | ''>('');
  const [filterQualification, setFilterQualification] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-rules' | 'with-overrides' | 'without-qualifications'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [staffData, departmentsData, squadsData, qualificationsData] = await Promise.all([
        staffService.getAll(),
        departmentService.getAll(),
        squadService.getAll(),
        qualificationService.getAll()
      ]);
      setStaff(staffData);
      setDepartments(departmentsData);
      setSquads(squadsData);
      setQualifications(qualificationsData);
    } catch (err) {
      setError('Failed to load staff');
      console.error('Error loading staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      await staffService.delete(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete staff member');
      console.error('Error deleting staff:', err);
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.registrationCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !filterDepartment || member.departmentId === filterDepartment;
    const matchesSquad = !filterSquad || member.squadId === filterSquad;
    
    const hasQualification = !filterQualification || 
      member.qualificationIds?.includes(filterQualification) ||
      member.qualifications?.some(q => q.id === filterQualification);

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'with-rules' && member.hasDayOffRule) ||
      (filterStatus === 'with-overrides' && member.hasConstraintOverrides) ||
      (filterStatus === 'without-qualifications' && (!member.qualifications || member.qualifications.length === 0));

    return matchesSearch && matchesDepartment && matchesSquad && hasQualification && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserGroupIcon className="w-6 h-6 text-rose-600" />
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {filteredStaff.length}
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
            className="flex items-center space-x-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterSquad}
            onChange={(e) => setFilterSquad(e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="">All Squads</option>
            {squads.map(squad => (
              <option key={squad.id} value={squad.id}>{squad.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterQualification}
            onChange={(e) => setFilterQualification(e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="">All Qualifications</option>
            {qualifications.map(qual => (
              <option key={qual.id} value={qual.id}>{qual.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="all">All Staff</option>
            <option value="with-rules">With Day Off Rules</option>
            <option value="with-overrides">With Constraint Overrides</option>
            <option value="without-qualifications">Without Qualifications</option>
          </select>
        </div>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStaff.map((member) => (
          <div key={member.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Name and Registration */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {member.displayName || member.fullName || `${member.name} ${member.surname}`}
                  </h3>
                  <div className="text-sm text-gray-500 font-mono">
                    #{member.registrationCode}
                  </div>
                </div>

                {/* Contact Info */}
                {(member.email || member.phone) && (
                  <div className="mb-4 space-y-1">
                    {member.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <EnvelopeIcon className="w-4 h-4 mr-2" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Department and Squad */}
                <div className="mb-4 space-y-2">
                  {member.department && (
                    <div className="flex items-center text-sm">
                      <BuildingOfficeIcon className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-gray-700">{member.department.name}</span>
                    </div>
                  )}
                  {member.squad && (
                    <div className="flex items-center text-sm">
                      <UsersIcon className="w-4 h-4 text-violet-500 mr-2" />
                      <span className="text-gray-700">{member.squad.name}</span>
                    </div>
                  )}
                </div>

                {/* Qualifications */}
                {member.qualifications && member.qualifications.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <AcademicCapIcon className="w-4 h-4 mr-1" />
                      <span>Qualifications ({member.qualificationCount || member.qualifications.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {member.qualifications.slice(0, 3).map(qual => (
                        <span 
                          key={qual.id} 
                          className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
                        >
                          {qual.name}
                        </span>
                      ))}
                      {member.qualifications.length > 3 && (
                        <span className="inline-flex px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                          +{member.qualifications.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Status Badges */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {member.hasDayOffRule && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Day Off Rules
                    </span>
                  )}
                  {member.hasConstraintOverrides && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                      Constraint Overrides
                    </span>
                  )}
                  {(!member.qualifications || member.qualifications.length === 0) && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      No Qualifications
                    </span>
                  )}
                </div>

                {/* Squad Cycle Position */}
                {member.currentCyclePosition !== undefined && member.squad?.squadWorkingPattern && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Squad Cycle Position</div>
                    <div className="text-sm font-medium text-gray-700">
                      Day {member.currentCyclePosition} of {member.squad.squadWorkingPattern.cycleLength}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    member.active !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onEdit?.(member)}
                  className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                  title="Edit Staff"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member.id!)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Staff"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStaff.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterDepartment || filterSquad || filterQualification || filterStatus !== 'all'
              ? 'Try adjusting your search criteria or filters.' 
              : 'Get started by adding a new staff member.'}
          </p>
          {!searchQuery && !filterDepartment && !filterSquad && !filterQualification && filterStatus === 'all' && (
            <button
              onClick={onAdd}
              className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
            >
              Add Your First Staff Member
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffList;