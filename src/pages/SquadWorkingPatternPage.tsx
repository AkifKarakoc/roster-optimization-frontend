import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import SquadWorkingPatternList from '../components/entities/squad-working-pattern/SquadWorkingPatternList';
import SquadWorkingPatternForm from '../components/entities/squad-working-pattern/SquadWorkingPatternForm';
import { ExcelUploadModal } from '../components/excel';
import { SquadWorkingPatternDTO } from '../types/entities';

const SquadWorkingPatternPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<SquadWorkingPatternDTO | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (pattern: SquadWorkingPatternDTO) => {
    setSelectedPattern(pattern);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedPattern(undefined);
    setIsFormOpen(true);
  };

  const handleExcelUpload = () => {
    setIsExcelModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedPattern(undefined);
  };

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };


  return (
    <Layout>
      <SquadWorkingPatternList 
        key={refreshTrigger} 
        onEdit={handleEdit} 
        onAdd={handleAdd}
        onExcelUpload={handleExcelUpload}
      />
      
      <SquadWorkingPatternForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        pattern={selectedPattern}
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

export default SquadWorkingPatternPage;