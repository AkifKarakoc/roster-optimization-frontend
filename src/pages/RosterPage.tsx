import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import RosterList from '../components/entities/roster/RosterList';
import RosterForm from '../components/entities/roster/RosterForm';
import { ExcelUploadModal } from '../components/excel';
import { RosterPlan } from '../types/entities';

const RosterPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedRoster, setSelectedRoster] = useState<RosterPlan | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (roster: RosterPlan) => {
    setSelectedRoster(roster);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedRoster(undefined);
    setIsFormOpen(true);
  };

  const handleExcelUpload = () => {
    setIsExcelModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedRoster(undefined);
  };

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };


  return (
    <Layout>
      <RosterList 
        key={refreshTrigger} 
        onEdit={handleEdit} 
        onAdd={handleAdd}
        onExcelUpload={handleExcelUpload}
      />
      
      <RosterForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        roster={selectedRoster}
      />

      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onProcessed={() => {
          setIsExcelModalOpen(false);
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </Layout>
  );
};

export default RosterPage;