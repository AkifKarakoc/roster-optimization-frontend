import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import DepartmentList from '../components/entities/department/DepartmentList';
import DepartmentForm from '../components/entities/department/DepartmentForm';
import ExcelUploadModal from '../components/excel/ExcelUploadModal';
import { DepartmentDTO } from '../types/entities';

const DepartmentPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentDTO | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (department: DepartmentDTO) => {
    setSelectedDepartment(department);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedDepartment(undefined);
    setIsFormOpen(true);
  };

  const handleExcelUpload = () => {
    setIsExcelModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedDepartment(undefined);
  };

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExcelSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout>
      <DepartmentList 
        key={refreshTrigger} 
        onEdit={handleEdit} 
        onAdd={handleAdd}
        onExcelUpload={handleExcelUpload}
      />
      
      <DepartmentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        department={selectedDepartment}
      />

      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={handleExcelSuccess}
        entityType="departments"
        entityName="Departments"
      />
    </Layout>
  );
};

export default DepartmentPage;