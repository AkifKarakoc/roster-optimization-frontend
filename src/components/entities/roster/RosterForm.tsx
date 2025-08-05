import React, { useState } from 'react';
import { RosterPlan } from '../../../types/entities';
import RosterGenerator from './RosterGenerator';
import RosterViewer from './RosterViewer';

interface RosterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  roster?: RosterPlan;
}

const RosterForm: React.FC<RosterFormProps> = ({ isOpen, onClose, onSave, roster }) => {
  const [currentRoster, setCurrentRoster] = useState<RosterPlan | null>(roster || null);

  if (!isOpen) return null;

  const handleRosterGenerated = (newRoster: RosterPlan) => {
    setCurrentRoster(newRoster);
    onSave();
  };

  const handleValidateRoster = async () => {
    if (!currentRoster) return;
    
    try {
      const { rosterService } = await import('../../../services/rosterService');
      const validation = await rosterService.validateRosterPlan(currentRoster);
      alert(`Validation Result: ${validation.isValid ? 'Valid' : 'Invalid'}\nScore: ${validation.score}\nViolations: ${validation.violations.length}`);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleNewRoster = () => {
    setCurrentRoster(null);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {roster ? 'View Roster' : 'Generate New Roster'}
            </h3>
            <p className="text-sm text-gray-600">
              {roster ? 'View and validate existing roster' : 'Generate a new staff roster using optimization algorithms'}
            </p>
          </div>
          <div className="flex space-x-3">
            {currentRoster && (
              <>
                <button
                  onClick={handleValidateRoster}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Validate Plan
                </button>
                <button
                  onClick={handleNewRoster}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Generate New
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {!currentRoster ? (
            <RosterGenerator onRosterGenerated={handleRosterGenerated} />
          ) : (
            <RosterViewer rosterPlan={currentRoster} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RosterForm;
