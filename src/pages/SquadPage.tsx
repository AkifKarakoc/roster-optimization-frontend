import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import SquadList from '../components/entities/squad/SquadList';
import SquadForm from '../components/entities/squad/SquadForm';
import { ExcelUploadModal } from '../components/excel';
import { SquadDTO } from '../types/entities';

const SquadPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState<SquadDTO | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (squad: SquadDTO) => {
    setSelectedSquad(squad);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedSquad(undefined);
    setIsFormOpen(true);
  };

  const handleExcelUpload = () => {
    setIsExcelModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedSquad(undefined);
  };

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };


  return (
    <Layout>
      <SquadList 
        key={refreshTrigger} 
        onEdit={handleEdit} 
        onAdd={handleAdd}
        onExcelUpload={handleExcelUpload}
      />
      
      <SquadForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        squad={selectedSquad}
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

export default SquadPage;