import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ListBulletIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { TaskDTO, DepartmentDTO } from '../../../types/entities';
import { taskService } from '../../../services/taskService';
import { departmentService } from '../../../services/departmentService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

interface TaskListProps {
  onEdit?: (task: TaskDTO) => void;
  onAdd?: () => void;
  onExcelUpload?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ onEdit, onAdd, onExcelUpload }) => {
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<number | ''>('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksData, departmentsData] = await Promise.all([
        taskService.getAll(),
        departmentService.getAll()
      ]);
      setTasks(tasksData);
      setDepartments(departmentsData);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.delete(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getPriorityLabel = (priority: number) => {
    if (priority <= 2) return { label: 'High', color: 'bg-red-100 text-red-800' };
    if (priority <= 5) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Low', color: 'bg-green-100 text-green-800' };
  };

  const getTaskStatus = (task: TaskDTO) => {
    const now = new Date();
    const startTime = new Date(task.startTime);
    const endTime = new Date(task.endTime);

    if (now < startTime) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    if (now > endTime) return { label: 'Completed', color: 'bg-gray-100 text-gray-800' };
    return { label: 'Ongoing', color: 'bg-orange-100 text-orange-800' };
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !filterDepartment || task.departmentId === filterDepartment;
    
    const taskPriority = getPriorityLabel(task.priority);
    const matchesPriority = filterPriority === 'all' || 
      taskPriority.label.toLowerCase() === filterPriority;

    const taskStatus = getTaskStatus(task);
    const matchesStatus = filterStatus === 'all' ||
      taskStatus.label.toLowerCase() === filterStatus;

    return matchesSearch && matchesDepartment && matchesPriority && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ListBulletIcon className="w-6 h-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {filteredTasks.length}
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
            className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.map((task) => {
          const startDateTime = formatDateTime(task.startTime);
          const endDateTime = formatDateTime(task.endTime);
          const priority = getPriorityLabel(task.priority);
          const status = getTaskStatus(task);

          return (
            <div key={task.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {task.name}
                      </h3>
                      
                      {/* Priority and Status Badges */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${priority.color}`}>
                          {priority.label === 'High' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                          Priority: {priority.label}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Time Information */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      <span>Start: {startDateTime.date} at {startDateTime.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span>End: {endDateTime.date} at {endDateTime.time}</span>
                    </div>
                    {task.durationHours && (
                      <div className="text-sm text-gray-500">
                        Duration: {task.durationHours}h {task.durationMinutes ? `${task.durationMinutes}m` : ''}
                      </div>
                    )}
                  </div>

                  {/* Department */}
                  {task.department && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-500">Department: </span>
                      <span className="text-sm font-medium text-gray-700">{task.department.name}</span>
                    </div>
                  )}

                  {/* Required Qualifications */}
                  {task.requiredQualifications && task.requiredQualifications.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-500 block mb-1">Required Qualifications:</span>
                      <div className="flex flex-wrap gap-1">
                        {task.requiredQualifications.map(qual => (
                          <span 
                            key={qual.id} 
                            className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
                          >
                            {qual.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Status */}
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      task.active !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {task.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEdit?.(task)}
                    className="p-2 text-gray-400 hover:text-amber-600 transition-colors"
                    title="Edit Task"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id!)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Task"
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
      {filteredTasks.length === 0 && !loading && (
        <div className="text-center py-12">
          <ListBulletIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterDepartment || filterPriority !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search criteria or filters.' 
              : 'Get started by creating a new task.'}
          </p>
          {!searchQuery && !filterDepartment && filterPriority === 'all' && filterStatus === 'all' && (
            <button
              onClick={onAdd}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Add Your First Task
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;