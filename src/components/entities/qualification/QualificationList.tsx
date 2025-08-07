import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  AcademicCapIcon,
  DocumentArrowUpIcon 
} from '@heroicons/react/24/outline';
import { QualificationDTO } from '../../../types/entities';
import { qualificationService } from '../../../services/qualificationService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

interface QualificationListProps {
  onEdit?: (qualification: QualificationDTO) => void;
  onAdd?: () => void;
  onExcelUpload?: () => void;
}

const QualificationList: React.FC<QualificationListProps> = ({ onEdit, onAdd, onExcelUpload }) => {
  const [qualifications, setQualifications] = useState<QualificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadQualifications();
  }, []);

  const loadQualifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await qualificationService.getAll();
      setQualifications(data);
    } catch (err) {
      setError('Failed to load qualifications');
      console.error('Error loading qualifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this qualification?')) {
      return;
    }

    try {
      await qualificationService.delete(id);
      await loadQualifications(); // Reload list
    } catch (err) {
      setError('Failed to delete qualification');
      console.error('Error deleting qualification:', err);
    }
  };

  const filteredQualifications = qualifications.filter(qual =>
    qual.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qual.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AcademicCapIcon className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Qualifications</h1>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {filteredQualifications.length}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onExcelUpload}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            title="Import qualifications from Excel file. Use format: Qualification ID, Name, Description, Active"
          >
            <DocumentArrowUpIcon className="w-5 h-5" />
            <span>Excel Import</span>
          </button>
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Qualification</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search qualifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Qualification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQualifications.map((qualification) => (
          <div key={qualification.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {qualification.name}
                </h3>
                {qualification.description && (
                  <p className="text-gray-600 mb-4 text-sm">
                    {qualification.description}
                  </p>
                )}
                
                {/* Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Staff: {qualification.staffCount || 0}</span>
                  <span>Tasks: {qualification.taskCount || 0}</span>
                </div>

                {/* Status */}
                <div className="mt-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    qualification.active !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {qualification.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onEdit?.(qualification)}
                  className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                  title="Edit Qualification"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(qualification.id!)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Qualification"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredQualifications.length === 0 && !loading && (
        <div className="text-center py-12">
          <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No qualifications found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating a new qualification.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onAdd}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Your First Qualification
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QualificationList;