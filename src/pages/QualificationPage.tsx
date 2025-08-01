import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import QualificationList from '../components/entities/qualification/QualificationList';
import QualificationForm from '../components/entities/qualification/QualificationForm';
import ExcelUploadModal from '../components/excel/ExcelUploadModal';
import { QualificationDTO } from '../types/entities';

const QualificationPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState<QualificationDTO | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (qualification: QualificationDTO) => {
    setSelectedQualification(qualification);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedQualification(undefined);
    setIsFormOpen(true);
  };

  const handleExcelUpload = () => {
    setIsExcelModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedQualification(undefined);
  };

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExcelSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout>
      <QualificationList 
        key={refreshTrigger} 
        onEdit={handleEdit} 
        onAdd={handleAdd}
        onExcelUpload={handleExcelUpload}
      />
      
      <QualificationForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        qualification={selectedQualification}
      />

      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={handleExcelSuccess}
        entityType="qualifications"
        entityName="Qualifications"
      />
    </Layout>
  );
};

export default QualificationPage;