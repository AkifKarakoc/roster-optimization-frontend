import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import TaskList from '../components/entities/task/TaskList';
import TaskForm from '../components/entities/task/TaskForm';
import ExcelUploadModal from '../components/excel/ExcelUploadModal';
import { TaskDTO } from '../types/entities';

const TaskPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDTO | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (task: TaskDTO) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedTask(undefined);
    setIsFormOpen(true);
  };

  const handleExcelUpload = () => {
    setIsExcelModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTask(undefined);
  };

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExcelSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout>
      <TaskList 
        key={refreshTrigger} 
        onEdit={handleEdit} 
        onAdd={handleAdd}
        onExcelUpload={handleExcelUpload}
      />
      
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        task={selectedTask}
      />

      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={handleExcelSuccess}
        entityType="tasks"
        entityName="Tasks"
      />
    </Layout>
  );
};

export default TaskPage;