import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import WorkingPeriodList from '../components/entities/working-period/WorkingPeriodList';
import WorkingPeriodForm from '../components/entities/working-period/WorkingPeriodForm';
import ExcelUploadModal from '../components/excel/ExcelUploadModal';
import { WorkingPeriodDTO } from '../types/entities';

const WorkingPeriodPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedWorkingPeriod, setSelectedWorkingPeriod] = useState<WorkingPeriodDTO | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (workingPeriod: WorkingPeriodDTO) => {
    setSelectedWorkingPeriod(workingPeriod);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedWorkingPeriod(undefined);
    setIsFormOpen(true);
  };

  const handleExcelUpload = () => {
    setIsExcelModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedWorkingPeriod(undefined);
  };

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExcelSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout>
      <WorkingPeriodList 
        key={refreshTrigger} 
        onEdit={handleEdit} 
        onAdd={handleAdd}
        onExcelUpload={handleExcelUpload}
      />
      
      <WorkingPeriodForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        workingPeriod={selectedWorkingPeriod}
      />

      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={handleExcelSuccess}
        entityType="working-periods"
        entityName="Working Periods"
      />
    </Layout>
  );
};

export default WorkingPeriodPage;