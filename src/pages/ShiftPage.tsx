import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import ShiftList from '../components/entities/shift/ShiftList';
import ShiftForm from '../components/entities/shift/ShiftForm';
import ExcelUploadModal from '../components/excel/ExcelUploadModal';
import { ShiftDTO } from '../types/entities';

const ShiftPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftDTO | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (shift: ShiftDTO) => {
    setSelectedShift(shift);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedShift(undefined);
    setIsFormOpen(true);
  };

  const handleExcelUpload = () => {
    setIsExcelModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedShift(undefined);
  };

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExcelSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout>
      <ShiftList 
        key={refreshTrigger} 
        onEdit={handleEdit} 
        onAdd={handleAdd}
        onExcelUpload={handleExcelUpload}
      />
      
      <ShiftForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        shift={selectedShift}
      />

      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={handleExcelSuccess}
        entityType="shifts"
        entityName="Shifts"
      />
    </Layout>
  );
};

export default ShiftPage;