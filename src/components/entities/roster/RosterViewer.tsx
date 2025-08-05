import React, { useState } from 'react';
import { CalendarDaysIcon, ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { RosterPlan, ConstraintViolation, RosterAssignment } from '../../../types/entities';

interface RosterViewerProps {
  rosterPlan: RosterPlan;
}

const RosterViewer: React.FC<RosterViewerProps> = ({ rosterPlan }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'statistics' | 'violations'>('schedule');

  const getWeekDays = () => {
    const startDateStr = rosterPlan.weekStartDate || rosterPlan.startDate;
    if (!startDateStr) return [];
    
    const start = new Date(startDateStr);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const weekDays = getWeekDays();
  const { statistics } = rosterPlan;
  const violations = statistics?.constraintViolations || [];
  const totalViolations = (rosterPlan.hardConstraintViolations || 0) + (rosterPlan.softConstraintViolations || 0);

  const tabs = [
    { key: 'schedule', label: 'Weekly Schedule', icon: CalendarDaysIcon },
    { key: 'statistics', label: 'Statistics', icon: ChartBarIcon },
    { key: 'violations', label: `Violations (${totalViolations})`, icon: ExclamationTriangleIcon }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Roster Plan</h2>
            <p className="text-gray-600">
              {rosterPlan.weekStartDate || rosterPlan.startDate ? 
                new Date(rosterPlan.weekStartDate || rosterPlan.startDate!).toLocaleDateString() : 'N/A'} - {' '}
              {rosterPlan.weekEndDate || rosterPlan.endDate ? 
                new Date(rosterPlan.weekEndDate || rosterPlan.endDate!).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Algorithm: {rosterPlan.algorithmUsed}</div>
            <div className="text-sm text-gray-600">
              Score: {(rosterPlan.score || rosterPlan.fitnessScore || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              Generated in: {rosterPlan.executionTime || rosterPlan.executionTimeMs || 0}ms
            </div>
            {(rosterPlan.hardConstraintViolations !== undefined || rosterPlan.softConstraintViolations !== undefined) && (
              <div className="text-sm text-gray-600">
                Violations: {rosterPlan.hardConstraintViolations || 0} hard, {rosterPlan.softConstraintViolations || 0} soft
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'schedule' && (
          <div className="overflow-x-auto">
            {!rosterPlan.assignments || rosterPlan.assignments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900">No Assignments</h3>
                <p className="text-gray-500">No staff assignments found for this roster plan.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  {weekDays.map(day => (
                    <th key={day.toISOString()} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from(new Set(rosterPlan.assignments?.filter(a => a?.staff?.id).map(a => a.staff.id) || [])).map(staffId => {
                  const staffAssignments = rosterPlan.assignments?.filter(a => a?.staff?.id === staffId) || [];
                  const staff = staffAssignments[0]?.staff;
                  const staffName = staff ? `${staff.name || ''} ${staff.surname || ''}`.trim() : `Staff ${staffId}`;
                  const totalHours = staffAssignments.reduce((sum, a) => sum + (a?.durationHours || 0), 0);

                  return (
                    <tr key={staffId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div>
                          <div>{staffName}</div>
                          {staff?.registrationCode && (
                            <div className="text-xs text-gray-500">{staff.registrationCode}</div>
                          )}
                        </div>
                      </td>
                      {weekDays.map(day => {
                        const dayAssignments = staffAssignments.filter(a => a?.date === day.toISOString().split('T')[0]);
                        return (
                          <td key={day.toISOString()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dayAssignments.length > 0 ? (
                              <div className="space-y-1">
                                {dayAssignments.map((assignment, idx) => (
                                  <div key={idx} className="text-xs">
                                    <div className="font-medium text-blue-600">
                                      {assignment?.shift?.name || 'Unknown Shift'}
                                    </div>
                                    <div className="text-gray-400">
                                      {assignment?.durationHours || 0}h
                                    </div>
                                    <div className="text-green-600">
                                      {assignment?.task?.name || 'Unknown Task'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {totalHours.toFixed(1)}h
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900">Task Coverage</h3>
              <p className="text-2xl font-bold text-blue-600">
                {(rosterPlan.taskCoverageRate || 0).toFixed(1)}%
              </p>
              <p className="text-sm text-blue-600">
                Task assignment coverage rate
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-900">Staff Utilization</h3>
              <p className="text-2xl font-bold text-green-600">
                {(rosterPlan.staffUtilizationRate || 0).toFixed(1)}%
              </p>
              <p className="text-sm text-green-600">Staff utilization rate</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900">Total Assignments</h3>
              <p className="text-2xl font-bold text-purple-600">
                {rosterPlan.totalAssignments || 0}
              </p>
              <p className="text-sm text-purple-600">
                Total staff assignments
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900">Unique Staff</h3>
              <p className="text-2xl font-bold text-orange-600">
                {rosterPlan.uniqueStaffCount || 0}
              </p>
              <p className="text-sm text-orange-600">
                Staff members involved
              </p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h3 className="text-lg font-semibold text-indigo-900">Feasible</h3>
              <p className="text-2xl font-bold text-indigo-600">
                {rosterPlan.feasible ? '✓' : '✗'}
              </p>
              <p className="text-sm text-indigo-600">
                Solution feasibility
              </p>
            </div>
          </div>
        )}

        {activeTab === 'violations' && (
          <div className="space-y-4">
            {totalViolations === 0 ? (
              <div className="text-center py-8">
                <div className="text-green-500 text-6xl mb-4">✓</div>
                <h3 className="text-lg font-medium text-gray-900">No Constraint Violations</h3>
                <p className="text-gray-500">All constraints have been satisfied in this roster plan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h3 className="text-lg font-semibold text-red-900">Hard Constraint Violations</h3>
                    <p className="text-3xl font-bold text-red-600">
                      {rosterPlan.hardConstraintViolations || 0}
                    </p>
                    <p className="text-sm text-red-600">Must be satisfied</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="text-lg font-semibold text-yellow-900">Soft Constraint Violations</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                      {rosterPlan.softConstraintViolations || 0}
                    </p>
                    <p className="text-sm text-yellow-600">Preferred but not mandatory</p>
                  </div>
                </div>
                
                {violations.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Detailed Violations</h4>
                    {violations.map((violation, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(violation.severity)} mb-2`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{violation.type}</h4>
                            <p className="text-sm mt-1">{violation.description}</p>
                            {violation.staffName && (
                              <p className="text-sm mt-1">Staff: {violation.staffName}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(violation.severity)}`}>
                            {violation.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unassigned Tasks */}
      {rosterPlan.unassignedTasks && rosterPlan.unassignedTasks.length > 0 && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-lg font-medium text-red-600 mb-4">
            Unassigned Tasks ({rosterPlan.unassignedTasks.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rosterPlan.unassignedTasks.map(task => (
              <div key={task.id} className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                <h4 className="font-medium text-red-800">{task.name}</h4>
                <p className="text-sm text-red-600">
                  {new Date(task.startTime).toLocaleString()} - {new Date(task.endTime).toLocaleString()}
                </p>
                <p className="text-sm text-red-600">Priority: {task.priority}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RosterViewer;