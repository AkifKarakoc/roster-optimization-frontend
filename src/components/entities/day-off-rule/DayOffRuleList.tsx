import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CalendarDaysIcon,
  DocumentArrowUpIcon,
  ClockIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { DayOffRuleDTO, StaffDTO, DepartmentDTO, SquadDTO } from '../../../types/entities';
import { dayOffRuleService } from '../../../services/dayOffRuleService';
import { staffService } from '../../../services/staffService';
import { departmentService } from '../../../services/departmentService';
import { squadService } from '../../../services/squadService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

interface DayOffRuleListProps {
  onEdit?: (rule: DayOffRuleDTO) => void;
  onAdd?: () => void;
  onExcelUpload?: () => void;
}

const DayOffRuleList: React.FC<DayOffRuleListProps> = ({ onEdit, onAdd, onExcelUpload }) => {
  const [rules, setRules] = useState<DayOffRuleDTO[]>([]);
  const [staff, setStaff] = useState<StaffDTO[]>([]);
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [squads, setSquads] = useState<SquadDTO[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'flexible' | 'fixed'>('all');
  const [filterDepartment, setFilterDepartment] = useState<number | ''>('');
  const [filterSquad, setFilterSquad] = useState<number | ''>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rulesData, staffData, departmentsData, squadsData, statisticsData] = await Promise.all([
        dayOffRuleService.getAll(),
        staffService.getAll(),
        departmentService.getAll(),
        squadService.getAll(),
        dayOffRuleService.getStatistics()
      ]);
      setRules(rulesData);
      setStaff(staffData);
      setDepartments(departmentsData);
      setSquads(squadsData);
      setStatistics(statisticsData);
    } catch (err) {
      setError('Failed to load day off rules');
      console.error('Error loading day off rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this day off rule?')) {
      return;
    }

    try {
      await dayOffRuleService.delete(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete day off rule');
      console.error('Error deleting day off rule:', err);
    }
  };

  const getDaysOfWeek = () => [
    'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'
  ];

  const formatFixedDays = (fixedDays: string) => {
    if (!fixedDays) return [];
    return fixedDays.split(',').map(day => day.trim());
  };

  const getDayAbbreviation = (day: string) => {
    const abbr: { [key: string]: string } = {
      'SUNDAY': 'Sun',
      'MONDAY': 'Mon',
      'TUESDAY': 'Tue',
      'WEDNESDAY': 'Wed',
      'THURSDAY': 'Thu',
      'FRIDAY': 'Fri',
      'SATURDAY': 'Sat'
    };
    return abbr[day.toUpperCase()] || day;
  };

  const getRuleTypeInfo = (rule: DayOffRuleDTO) => {
    if (rule.fixedOffDays) {
      return {
        type: 'Fixed',
        description: `Fixed days: ${formatFixedDays(rule.fixedOffDays).map(getDayAbbreviation).join(', ')}`,
        color: 'bg-blue-100 text-blue-800'
      };
    } else {
      return {
        type: 'Flexible',
        description: `${rule.workingDays} work days, then ${rule.offDays} off days`,
        color: 'bg-green-100 text-green-800'
      };
    }
  };

  const getStaffInfo = (staffId: number) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return null;

    const department = departments.find(d => d.id === staffMember.departmentId);
    const squad = squads.find(s => s.id === staffMember.squadId);

    return { staffMember, department, squad };
  };

  const filteredRules = rules.filter(rule => {
    const staffInfo = getStaffInfo(rule.staffId);
    const staffMember = staffInfo?.staffMember;
    
    const matchesSearch = !searchQuery || (
      staffMember?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember?.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember?.registrationCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const ruleType = rule.fixedOffDays ? 'fixed' : 'flexible';
    const matchesType = filterType === 'all' || filterType === ruleType;
    
    const matchesDepartment = !filterDepartment || staffMember?.departmentId === filterDepartment;
    const matchesSquad = !filterSquad || staffMember?.squadId === filterSquad;

    return matchesSearch && matchesType && matchesDepartment && matchesSquad;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarDaysIcon className="w-6 h-6 text-teal-600" />
          <h1 className="text-2xl font-bold text-gray-900">Day Off Rules</h1>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {filteredRules.length}
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
            className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Rule</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-teal-600" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-teal-600">{statistics.totalRules}</div>
                <div className="text-sm text-gray-600">Total Rules</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-green-600">{statistics.flexibleRules}</div>
                <div className="text-sm text-gray-600">Flexible ({statistics.flexiblePercentage?.toFixed(1)}%)</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-blue-600">{statistics.fixedRules}</div>
                <div className="text-sm text-gray-600">Fixed ({statistics.fixedPercentage?.toFixed(1)}%)</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <UserIcon className="w-8 h-8 text-gray-600" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-600">{staff.length - rules.length}</div>
                <div className="text-sm text-gray-600">Staff Without Rules</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <input
            type="text"
            placeholder="Search by staff name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Rule Types</option>
            <option value="flexible">Flexible Rules</option>
            <option value="fixed">Fixed Rules</option>
          </select>
        </div>

        <div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">All Squads</option>
            {squads.map(squad => (
              <option key={squad.id} value={squad.id}>{squad.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRules.map((rule) => {
          const staffInfo = getStaffInfo(rule.staffId);
          const ruleTypeInfo = getRuleTypeInfo(rule);

          return (
            <div key={rule.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Staff Information */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {staffInfo?.staffMember ? 
                        `${staffInfo.staffMember.name} ${staffInfo.staffMember.surname}` : 
                        'Unknown Staff'
                      }
                    </h3>
                    {staffInfo?.staffMember?.registrationCode && (
                      <div className="text-sm text-gray-500 font-mono mb-2">
                        #{staffInfo.staffMember.registrationCode}
                      </div>
                    )}
                    
                    {/* Department and Squad */}
                    <div className="space-y-1">
                      {staffInfo?.department && (
                        <div className="text-sm text-gray-600">
                          Dept: {staffInfo.department.name}
                        </div>
                      )}
                      {staffInfo?.squad && (
                        <div className="text-sm text-gray-600">
                          Squad: {staffInfo.squad.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rule Type Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${ruleTypeInfo.color}`}>
                      {ruleTypeInfo.type} Rule
                    </span>
                  </div>

                  {/* Rule Details */}
                  <div className="space-y-3">
                    {rule.fixedOffDays ? (
                      // Fixed Rule
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Fixed Days Off:</div>
                        <div className="flex flex-wrap gap-1">
                          {formatFixedDays(rule.fixedOffDays).map((day, index) => (
                            <span 
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded"
                            >
                              {getDayAbbreviation(day)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Flexible Rule
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Working Days</div>
                          <div className="text-lg font-bold text-green-600">{rule.workingDays}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Off Days</div>
                          <div className="text-lg font-bold text-teal-600">{rule.offDays}</div>
                        </div>
                      </div>
                    )}

                    {/* Total Cycle and Work Ratio */}
                    {rule.totalCycleDays && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Cycle Length</div>
                            <div className="font-medium">{rule.totalCycleDays} days</div>
                          </div>
                          {rule.workRatio && (
                            <div>
                              <div className="text-gray-500">Work Ratio</div>
                              <div className="font-medium">{(rule.workRatio * 100).toFixed(1)}%</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rule Description */}
                    {rule.ruleDescription && (
                      <div className="pt-2">
                        <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                          {rule.ruleDescription}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEdit?.(rule)}
                    className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
                    title="Edit Rule"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id!)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Rule"
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
      {filteredRules.length === 0 && !loading && (
        <div className="text-center py-12">
          <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No day off rules found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterType !== 'all' || filterDepartment || filterSquad
              ? 'Try adjusting your search criteria or filters.' 
              : 'Get started by creating a day off rule for staff members.'}
          </p>
          {!searchQuery && filterType === 'all' && !filterDepartment && !filterSquad && (
            <button
              onClick={onAdd}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Add Your First Day Off Rule
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DayOffRuleList;