import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import ConstraintList from '../components/entities/contraint/ConstraintList';
import ConstraintForm from '../components/entities/contraint/ConstraintForm';
import { ExcelUploadModal } from '../components/excel';
import { ConstraintDTO } from '../types/entities';

const ConstraintPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedConstraint, setSelectedConstraint] = useState<ConstraintDTO | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (constraint: ConstraintDTO) => {
    setSelectedConstraint(constraint);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedConstraint(undefined);
    setIsFormOpen(true);
  };

  const handleExcelUpload = () => {
    setIsExcelModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedConstraint(undefined);
  };

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };


  return (
    <Layout>
      <ConstraintList 
        key={refreshTrigger} 
        onEdit={handleEdit} 
        onAdd={handleAdd}
        onExcelUpload={handleExcelUpload}
      />
      
      <ConstraintForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        constraint={selectedConstraint}
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

export default ConstraintPage;