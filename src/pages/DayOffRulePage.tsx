import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import DayOffRuleList from '../components/entities/day-off-rule/DayOffRuleList';
import DayOffRuleForm from '../components/entities/day-off-rule/DayOffRuleForm';
import ExcelUploadModal from '../components/excel/ExcelUploadModal';
import { DayOffRuleDTO } from '../types/entities';

const DayOffRulePage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<DayOffRuleDTO | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (rule: DayOffRuleDTO) => {
    setSelectedRule(rule);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedRule(undefined);
    setIsFormOpen(true);
  };

  const handleExcelUpload = () => {
    setIsExcelModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedRule(undefined);
  };

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExcelSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout>
      <DayOffRuleList 
        key={refreshTrigger} 
        onEdit={handleEdit} 
        onAdd={handleAdd}
        onExcelUpload={handleExcelUpload}
      />
      
      <DayOffRuleForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        rule={selectedRule}
      />

      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={handleExcelSuccess}
        entityType="day-off-rules"
        entityName="Day Off Rules"
      />
    </Layout>
  );
};

export default DayOffRulePage;