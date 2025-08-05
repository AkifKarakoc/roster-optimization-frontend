import React, { useState, useEffect } from 'react';
import { PlayIcon, ClockIcon } from '@heroicons/react/24/outline';
import { rosterService } from '../../../services/rosterService';
import { departmentService } from '../../../services/departmentService';
import {
  RosterGenerationRequest,
  AlgorithmInfo,
  DepartmentDTO,
  RosterPlan
} from '../../../types/entities';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';

interface RosterGeneratorProps {
  onRosterGenerated: (roster: RosterPlan) => void;
}

const RosterGenerator: React.FC<RosterGeneratorProps> = ({ onRosterGenerated }) => {
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [algorithms, setAlgorithms] = useState<AlgorithmInfo[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmInfo | null>(null);
  const getDefaultWeekDates = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultWeekDates();
  
  const [formData, setFormData] = useState<RosterGenerationRequest>({
    departmentId: 0,
    startDate: defaultDates.start,
    endDate: defaultDates.end,
    algorithmType: '',
    algorithmParameters: {},
    maxExecutionTimeMinutes: 10,
    enableParallelProcessing: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.algorithmType) {
      loadAlgorithmParameters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.algorithmType]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading initial data...');
      
      const [deptData, algData] = await Promise.all([
        departmentService.getAll(),
        rosterService.getAvailableAlgorithms()
      ]);
      
      console.log('Departments loaded:', deptData);
      console.log('Algorithms loaded:', algData);
      
      setDepartments(deptData);
      setAlgorithms(algData);
      
      // If no algorithms are loaded, show an informative message
      if (!algData || algData.length === 0) {
        setError('No optimization algorithms are currently available');
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const loadAlgorithmParameters = async () => {
    try {
      const algorithm = algorithms.find(alg => alg.name === formData.algorithmType);
      if (algorithm) {
        setSelectedAlgorithm(algorithm);
        // Use default parameters from the algorithm info
        setFormData(prev => ({ ...prev, algorithmParameters: { ...algorithm.defaultParameters } }));
      }
    } catch (err) {
      console.error('Failed to load algorithm parameters:', err);
    }
  };

  const handleInputChange = (field: keyof RosterGenerationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      algorithmParameters: { ...prev.algorithmParameters, [paramName]: value }
    }));
  };

  const handleEstimateTime = async () => {
    if (!formData.departmentId || !formData.algorithmType) return;
    
    try {
      const time = await rosterService.getEstimatedExecutionTime(formData);
      setEstimatedTime(time);
    } catch (err) {
      console.error('Failed to estimate time:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🚀 Sending roster generation request:', JSON.stringify(formData, null, 2));
      const roster = await rosterService.generateRosterPlan(formData);
      onRosterGenerated(roster);
    } catch (err: any) {
      setError('Failed to generate roster plan');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading generator..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadInitialData} />;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <PlayIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Generate Roster Plan</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Department Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <select
            value={formData.departmentId}
            onChange={(e) => handleInputChange('departmentId', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value={0}>Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Algorithm Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Optimization Algorithm *
          </label>
          <select
            value={formData.algorithmType}
            onChange={(e) => handleInputChange('algorithmType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Algorithm</option>
            {algorithms && algorithms.length > 0 ? (
              algorithms.map(alg => (
                <option key={alg.name} value={alg.name}>
                  {alg.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))
            ) : (
              <option value="" disabled>No algorithms available</option>
            )}
          </select>
          {selectedAlgorithm && (
            <p className="text-sm text-gray-600 mt-1">{selectedAlgorithm.description}</p>
          )}
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-500 mt-1">
              Debug: {algorithms.length} algorithms loaded
            </p>
          )}
        </div>

        {/* Algorithm Parameters */}
        {selectedAlgorithm && formData.algorithmParameters && Object.keys(formData.algorithmParameters).length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Algorithm Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.algorithmParameters).map(([key, value]) => {
                const paramInfo = selectedAlgorithm.configurableParameters?.[key];
                const isNumber = paramInfo?.type === 'java.lang.Integer' || paramInfo?.type === 'java.lang.Double';
                const step = paramInfo?.type === 'java.lang.Double' ? '0.01' : '1';
                
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {paramInfo?.description || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    <input
                      type={isNumber ? 'number' : 'text'}
                      value={value as string | number}
                      onChange={(e) => handleParameterChange(key, 
                        isNumber ? (paramInfo?.type === 'java.lang.Integer' ? parseInt(e.target.value) : parseFloat(e.target.value)) : e.target.value
                      )}
                      min={paramInfo?.minValue}
                      max={paramInfo?.maxValue}
                      step={step}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {paramInfo && (
                      <p className="text-xs text-gray-500 mt-1">
                        {paramInfo.minValue !== undefined && paramInfo.maxValue !== undefined 
                          ? `Range: ${paramInfo.minValue} - ${paramInfo.maxValue}`
                          : `Default: ${paramInfo.defaultValue}`
                        }
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Execution Settings */}
        {selectedAlgorithm && (
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Execution Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Execution Time (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.maxExecutionTimeMinutes}
                  onChange={(e) => handleInputChange('maxExecutionTimeMinutes', parseInt(e.target.value) || 10)}
                  min={1}
                  max={60}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum time allowed for optimization (1-60 minutes)
                </p>
              </div>
              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="enableParallelProcessing"
                    checked={formData.enableParallelProcessing}
                    onChange={(e) => handleInputChange('enableParallelProcessing', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="enableParallelProcessing" className="font-medium text-gray-700">
                    Enable Parallel Processing
                  </label>
                  <p className="text-gray-500">Use multiple CPU cores for faster optimization</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estimated Time */}
        {formData.departmentId && formData.algorithmType && (
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleEstimateTime}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <ClockIcon className="w-4 h-4" />
              <span>Estimate Time</span>
            </button>
            {estimatedTime && (
              <span className="text-sm text-gray-600">
                Estimated time: {estimatedTime} seconds
              </span>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isGenerating || !formData.departmentId || !formData.algorithmType}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Roster'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RosterGenerator;