import { api } from './api';

export interface ExcelRow {
  rowId: string;
  rowNumber: number;
  entityType: string;
  cellValues: { [key: string]: string };
  errors: ExcelError[];
  canImport: boolean;
  operation: 'ADD' | 'UPDATE' | 'DELETE';
  entityId: string | null;
  entityName: string | null;
  operationFromCell: string;
  errorSummary: string;
  mainEntityId: string;
}

export interface ExcelError {
  fieldName: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  errorMessage: string;
  suggestedFix: string | null;
  currentValue: string | null;
  expectedFormat: string | null;
  blocking: boolean;
  fullDescription: string;
}

export interface ExcelSheet {
  sheetName: string;
  entityType: string;
  headers: string[];
  rows: ExcelRow[];
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  hasOperationColumn: boolean;
  mainIdColumn: string;
  importableRows: number;
  operationColumnName: string | null;
}

export interface ExcelProcessingResult {
  sessionId: string;
  fileName: string;
  processedAt: string;
  sheets: ExcelSheet[];
  totalSheets: number;
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  importableRows: number;
  entityTypeCounts: { [entityType: string]: number };
  processingMessages: string[];
  hasBlockingErrors: boolean;
  processingTimeMs: number;
  successRate: number;
  processingSummary: {
    fileName: string;
    processedAt: string;
    totalSheets: number;
    totalRows: number;
    successRate: number;
    importableRows: number;
    hasBlockingErrors: boolean;
    readinessSummary: string;
    processingTimeMs: number;
  };
  importReadinessSummary: string;
}

export interface ExcelImportResult {
  success: boolean;
  message: string;
  importedEntities: { [entityType: string]: number };
  failedEntities: { [entityType: string]: number };
  errors: string[];
  warnings: string[];
}

export const excelService = {
  uploadAndProcess: async (file: File): Promise<ExcelProcessingResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/excel/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  executeImport: async (sessionId: string, options?: {
    selectedRowIds?: string[];
    continueOnError?: boolean;
    validateBeforeImport?: boolean;
  }): Promise<ExcelImportResult> => {
    const requestBody = {
      selectedRowIds: options?.selectedRowIds || [],
      continueOnError: options?.continueOnError ?? true,
      validateBeforeImport: options?.validateBeforeImport ?? true,
      options: {
        useTransactions: true,
        rollbackOnError: false,
        conflictResolution: "SKIP",
        skipDuplicates: true,
        updateExisting: false,
        batchSize: 100,
        enableParallelProcessing: false,
        detailedLogging: true,
        generateReport: true
      }
    };
    
    console.log('🚀 Import Request Body:', requestBody);
    
    const response = await api.post(`/excel/import/${sessionId}`, requestBody);
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/excel/template', {
      responseType: 'blob',
    });
    return response.data;
  },

  getProcessingResult: async (sessionId: string): Promise<ExcelProcessingResult> => {
    const response = await api.get(`/excel/session/${sessionId}`);
    return response.data;
  },
};