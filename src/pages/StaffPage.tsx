import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import StaffList from '../components/entities/staff/StaffList';
import StaffForm from '../components/entities/staff/StaffForm';
import { ExcelUploadModal } from '../components/excel';
import { StaffDTO } from '../types/entities';

const StaffPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffDTO | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (staff: StaffDTO) => {
    setSelectedStaff(staff);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedStaff(undefined);
    setIsFormOpen(true);
  };

  const handleExcelUpload = () => {
    setIsExcelModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedStaff(undefined);
  };

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };


  return (
    <Layout>
      <StaffList 
        key={refreshTrigger} 
        onEdit={handleEdit} 
        onAdd={handleAdd}
        onExcelUpload={handleExcelUpload}
      />
      
      <StaffForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        staff={selectedStaff}
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

export default StaffPage;