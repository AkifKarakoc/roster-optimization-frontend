import React, { useState, useEffect } from 'react';
import { RosterPlan } from '../../../types/entities';
import { rosterService } from '../../../services/rosterService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

interface RosterListProps {
  onEdit: (roster: RosterPlan) => void;
  onAdd: () => void;
  onExcelUpload: () => void;
}

const RosterList: React.FC<RosterListProps> = ({ onEdit, onAdd, onExcelUpload }) => {
  const [rosters, setRosters] = useState<RosterPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealthAndLoad();
  }, []);

  const checkHealthAndLoad = async () => {
    try {
      await rosterService.healthCheck();
      setIsHealthy(true);
      await loadRosters();
    } catch (error) {
      setIsHealthy(false);
      setError('Roster optimization service is unavailable');
      setLoading(false);
    }
  };

  const loadRosters = async () => {
    try {
      setLoading(true);
      // Note: This would need a backend endpoint to get all rosters
      // For now, we'll show an empty list
      setRosters([]);
      setError(null);
    } catch (err) {
      setError('Failed to load rosters');
      console.error('Error loading rosters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this roster?')) {
      return;
    }

    try {
      // Note: This would need a backend endpoint to delete rosters
      await loadRosters();
    } catch (err) {
      setError('Failed to delete roster');
      console.error('Error deleting roster:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isHealthy) {
    return (
      <div className="p-6">
        <ErrorMessage message={error || 'Service unavailable'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roster Management</h1>
          <p className="text-gray-600">Manage and generate staff rosters</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onExcelUpload}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Upload Excel
          </button>
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate New Roster
          </button>
        </div>
      </div>

      {/* Service Status */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="h-5 w-5 bg-green-400 rounded-full"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Optimization Service Status: Online
            </p>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Roster List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Generated Rosters</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {rosters.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No rosters generated yet. Click "Generate New Roster" to create one.
            </div>
          ) : (
            rosters.map((roster) => (
              <div key={roster.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Roster #{roster.id}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Created: {roster.createdAt ? new Date(roster.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(roster)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(roster.id?.toString() || '')}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RosterList;
