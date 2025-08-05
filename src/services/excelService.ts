import { api } from './api';

export interface CellSuggestion {
  type: 'CORRECTION' | 'WARNING' | 'INFO';
  suggestion: string;
  confidence: number;
}

export interface CellDetail {
  value: string;
  status: 'VALID' | 'WARNING' | 'ERROR' | 'INFO';
  message?: string;
  suggestions?: CellSuggestion[];
}

export interface ExcelRow {
  rowNumber: number;
  selected: boolean;
  rowStatus: 'valid' | 'warning' | 'error';
  importStatus: 'NOT_PROCESSED' | 'IMPORTED' | 'FAILED' | 'SKIPPED';
  cellDetails: { [key: string]: CellDetail };
}

export interface ExcelStatistics {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  selectedRows: number;
  canProceed: boolean;
}

export interface ExcelPreviewResponseEnhanced {
  sessionId: string;
  entityType: string;
  canProceed: boolean;
  rows: ExcelRow[];
  statistics: ExcelStatistics;
}

export interface BulkExcelPreviewResponse {
  sessionId: string;
  sheets: { [entityType: string]: ExcelPreviewResponseEnhanced };
}

export interface ImportSelectedResult {
  sessionId: string;
  success: boolean;
  message: string;
  totalProcessed: number;
  successfulImports: number;
  failedImports: number;
  importedRows: number[];
}

export interface ColumnInfo {
  name: string;
  displayName: string;
  required: boolean;
  type: string;
  description?: string;
}

export const excelService = {
  // Single entity upload and preview (Enhanced API)
  uploadAndPreview: async (file: File, entityType: string): Promise<ExcelPreviewResponseEnhanced> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/excel/preview/${entityType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Bulk upload and preview
  uploadBulkAndPreview: async (file: File): Promise<BulkExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/excel/preview/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Get enhanced session data
  getEnhancedSession: async (sessionId: string): Promise<ExcelPreviewResponseEnhanced> => {
    const response = await api.get(`/excel/session/${sessionId}/enhanced`);
    return response.data;
  },

  // Update row selection
  updateSelection: async (sessionId: string, selectedRowNumbers: number[]): Promise<void> => {
    await api.put(`/excel/session/${sessionId}/selection`, { selectedRowNumbers });
  },

  // Auto-correct errors
  autoCorrect: async (sessionId: string, rowNumbers?: number[]): Promise<ExcelPreviewResponseEnhanced> => {
    const body = rowNumbers ? { rowNumbers } : {};
    const response = await api.post(`/excel/session/${sessionId}/auto-correct`, body);
    return response.data;
  },

  // Import selected rows
  importSelected: async (
    sessionId: string, 
    selectedRowNumbers: number[], 
    applyCorrections: boolean = true
  ): Promise<ImportSelectedResult> => {
    const response = await api.post(`/excel/import/${sessionId}`, {
      selectedRowNumbers,
      applyCorrections
    });
    return response.data;
  },

  // Delete session
  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/excel/session/${sessionId}`);
  },

  // Get column information for entity type
  getColumnInfo: async (entityType: string): Promise<ColumnInfo[]> => {
    const response = await api.get(`/excel/column-info/${entityType}`);
    return response.data;
  },

  // Download single entity template
  downloadTemplate: async (entityType: string): Promise<Blob> => {
    const response = await api.get(`/excel/template/${entityType}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Download bulk template
  downloadBulkTemplate: async (): Promise<Blob> => {
    const response = await api.get('/excel/template/bulk', {
      responseType: 'blob',
    });
    return response.data;
  },
};