import { api } from './api';

export interface ExcelPreviewDTO {
  sessionId: string;
  entityType: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: ExcelError[];
  previewData: any[];
}

export interface ExcelError {
  row: number;
  column?: string;
  message: string;
  value?: string;
}

export interface ImportResultDTO {
  success: boolean;
  message: string;
  processedRows: number;
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  errors: ExcelError[];
}

export const excelService = {
  // Upload and preview Excel file
  uploadAndPreview: async (file: File, entityType: string): Promise<ExcelPreviewDTO> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);

    const response = await api.post('/excel/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Apply previewed changes
  applyChanges: async (sessionId: string): Promise<ImportResultDTO> => {
    const response = await api.post(`/excel/apply/${sessionId}`);
    return response.data;
  },

  // Download template
  downloadTemplate: async (entityType: string): Promise<Blob> => {
    const response = await api.get(`/excel/template/${entityType}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export data to Excel
  exportToExcel: async (entityType: string): Promise<Blob> => {
    const response = await api.get(`/excel/export/${entityType}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};