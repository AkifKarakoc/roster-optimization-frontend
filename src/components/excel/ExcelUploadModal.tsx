import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  XMarkIcon, 
  DocumentArrowUpIcon, 
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  excelService, 
  ExcelPreviewResponseEnhanced, 
  ImportSelectedResult,
  ExcelRow,
  CellDetail
} from '../../services/excelService';
import LoadingSpinner from '../common/LoadingSpinner';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entityType: string;
  entityName: string;
}

type UploadStep = 'upload' | 'preview' | 'processing' | 'result';

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  entityType,
  entityName
}) => {
  const [step, setStep] = useState<UploadStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ExcelPreviewResponseEnhanced | null>(null);
  const [result, setResult] = useState<ImportSelectedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [columnHeaders, setColumnHeaders] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract column headers from first row
  useEffect(() => {
    if (preview && preview.rows.length > 0) {
      const headers = Object.keys(preview.rows[0].cellDetails);
      setColumnHeaders(headers);
    }
  }, [preview]);

  const resetModal = () => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setLoading(false);
    setColumnHeaders([]);
  };

  const handleClose = async () => {
    if (preview?.sessionId) {
      try {
        await excelService.deleteSession(preview.sessionId);
      } catch (err) {
        console.warn('Failed to delete session:', err);
      }
    }
    resetModal();
    onClose();
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      setError('Please select an Excel file (.xlsx or .xls)');
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setStep('preview');
      setError(null);
      const previewData = await excelService.uploadAndPreview(file, entityType);
      setPreview(previewData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process Excel file');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelection = useCallback(async (rowNumber: number, selected: boolean) => {
    if (!preview) return;

    const updatedRows = preview.rows.map(row =>
      row.rowNumber === rowNumber ? { ...row, selected } : row
    );

    const selectedRowNumbers = updatedRows.filter(row => row.selected).map(row => row.rowNumber);

    try {
      await excelService.updateSelection(preview.sessionId, selectedRowNumbers);
      
      const updatedPreview = {
        ...preview,
        rows: updatedRows,
        statistics: {
          ...preview.statistics,
          selectedRows: selectedRowNumbers.length
        }
      };
      
      setPreview(updatedPreview);
    } catch (err) {
      setError('Failed to update selection');
    }
  }, [preview]);

  const handleSelectAll = useCallback(async (selectAll: boolean) => {
    if (!preview) return;

    const updatedRows = preview.rows.map(row => ({ ...row, selected: selectAll }));
    const selectedRowNumbers = selectAll ? updatedRows.map(row => row.rowNumber) : [];

    try {
      await excelService.updateSelection(preview.sessionId, selectedRowNumbers);
      
      const updatedPreview = {
        ...preview,
        rows: updatedRows,
        statistics: {
          ...preview.statistics,
          selectedRows: selectedRowNumbers.length
        }
      };
      
      setPreview(updatedPreview);
    } catch (err) {
      setError('Failed to update selection');
    }
  }, [preview]);

  const handleAutoCorrect = useCallback(async (rowNumber?: number) => {
    if (!preview) return;

    try {
      setLoading(true);
      const correctedData = await excelService.autoCorrect(
        preview.sessionId, 
        rowNumber ? [rowNumber] : undefined
      );
      setPreview(correctedData);
    } catch (err) {
      setError('Failed to apply auto-corrections');
    } finally {
      setLoading(false);
    }
  }, [preview]);

  const handleImport = async () => {
    if (!preview) return;

    const selectedRows = preview.rows.filter(row => row.selected);
    if (selectedRows.length === 0) {
      setError('Please select at least one row to import');
      return;
    }

    try {
      setStep('processing');
      setError(null);
      const selectedRowNumbers = selectedRows.map(row => row.rowNumber);
      const resultData = await excelService.importSelected(
        preview.sessionId, 
        selectedRowNumbers, 
        true
      );
      
      setResult(resultData);
      setStep('result');
      
      if (resultData.success) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to import data');
      setStep('preview');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await excelService.downloadTemplate(entityType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entityName}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download template');
    }
  };

  // Helper functions
  const getCellClassName = (cellDetail: CellDetail): string => {
    const baseClasses = 'px-3 py-2 text-sm border-r border-gray-200';
    
    switch (cellDetail.status) {
      case 'VALID':
        return `${baseClasses} bg-green-50 border-green-200`;
      case 'WARNING':
        return `${baseClasses} bg-yellow-50 border-yellow-200`;
      case 'ERROR':
        return `${baseClasses} bg-red-50 border-red-200`;
      case 'INFO':
        return `${baseClasses} bg-blue-50 border-blue-200`;
      default:
        return baseClasses;
    }
  };

  const getRowClassName = (row: ExcelRow): string => {
    const baseClasses = 'border-b border-gray-200 hover:bg-gray-50';
    
    if (row.importStatus === 'IMPORTED') {
      return `${baseClasses} bg-green-100 border-l-4 border-l-green-500`;
    }
    
    switch (row.rowStatus) {
      case 'valid':
        return `${baseClasses} bg-green-50`;
      case 'warning':
        return `${baseClasses} bg-yellow-50`;
      case 'error':
        return `${baseClasses} bg-red-50`;
      default:
        return baseClasses;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      case 'IMPORTED':
        return <div className="w-4 h-4 bg-green-500 rounded-full"></div>;
      default:
        return <InformationCircleIcon className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (row: ExcelRow) => {
    if (row.importStatus === 'IMPORTED') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          🟢 Imported
        </span>
      );
    }

    switch (row.rowStatus) {
      case 'valid':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Valid
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⚠️ Warning
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ Error
          </span>
        );
      default:
        return null;
    }
  };

  const hasErrors = (row: ExcelRow): boolean => {
    return Object.values(row.cellDetails).some(cell => cell.status === 'ERROR');
  };

  const allSelected = preview?.rows.every(row => row.selected) || false;
  const someSelected = preview?.rows.some(row => row.selected) || false;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-4 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            Excel Import - {entityName}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Need a template?</h3>
                <p className="text-blue-700 text-sm mb-3">
                  Download the Excel template to ensure your data is formatted correctly.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  <span>Download {entityName} Template</span>
                </button>
              </div>

              {/* File Upload */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {file ? file.name : 'Choose Excel file to upload'}
                </p>
                <p className="text-gray-500">
                  Click to select or drag and drop your Excel file here
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {file && (
                <div className="flex justify-end">
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    <span>Process File</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && preview && (
            <div className="flex flex-col h-full">
              {/* Statistics Panel */}
              <div className="p-4 bg-gray-50 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Preview Summary</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleAutoCorrect()}
                      disabled={loading || preview.statistics.errorRows === 0}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 disabled:opacity-50 text-sm font-medium"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      <span>Auto-Fix All Errors</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-4 mt-3 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">{preview.statistics.totalRows}</div>
                    <div className="text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{preview.statistics.validRows}</div>
                    <div className="text-gray-500">Valid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{preview.statistics.warningRows}</div>
                    <div className="text-gray-500">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{preview.statistics.errorRows}</div>
                    <div className="text-gray-500">Errors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{preview.statistics.selectedRows}</div>
                    <div className="text-gray-500">Selected</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${preview.statistics.canProceed ? 'text-green-600' : 'text-red-600'}`}>
                      {preview.statistics.canProceed ? '✓' : '✗'}
                    </div>
                    <div className="text-gray-500">Can Import</div>
                  </div>
                </div>
              </div>

              {/* Table Container */}
              <div className="flex-1 overflow-auto min-h-0">
                <table className="w-full border-collapse bg-white">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someSelected && !allSelected;
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Row
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Status
                      </th>
                      {columnHeaders.map((header) => (
                        <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                          {header}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row) => (
                      <tr key={row.rowNumber} className={getRowClassName(row)}>
                        <td className="px-3 py-2 border-r border-gray-200">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={(e) => handleRowSelection(row.rowNumber, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm font-medium border-r border-gray-200">
                          {row.rowNumber}
                        </td>
                        <td className="px-3 py-2 border-r border-gray-200">
                          {getStatusBadge(row)}
                        </td>
                        {columnHeaders.map((header) => {
                          const cellDetail = row.cellDetails[header];
                          return (
                            <td
                              key={header}
                              className={getCellClassName(cellDetail)}
                              title={cellDetail.message || undefined}
                            >
                              <div className="flex items-center space-x-1">
                                <span className="truncate">{cellDetail.value || '-'}</span>
                                {cellDetail.status !== 'VALID' && (
                                  <div className="flex-shrink-0">
                                    {getStatusIcon(cellDetail.status)}
                                  </div>
                                )}
                              </div>
                              {cellDetail.suggestions && cellDetail.suggestions.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Suggest: {cellDetail.suggestions[0].suggestion}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2">
                          {hasErrors(row) && (
                            <button
                              onClick={() => handleAutoCorrect(row.rowNumber)}
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium disabled:opacity-50"
                            >
                              Auto Fix
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 border-t flex justify-between flex-shrink-0">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={!preview.statistics.canProceed || preview.statistics.selectedRows === 0}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Import Selected ({preview.statistics.selectedRows}) Records
                </button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="p-6 flex items-center justify-center h-full">
              <LoadingSpinner size="lg" message="Importing your data..." />
            </div>
          )}

          {/* Result Step */}
          {step === 'result' && result && (
            <div className="p-6 space-y-6">
              <div className={`rounded-lg p-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className={`font-medium mb-2 flex items-center ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                  <CheckCircleIcon className={`w-5 h-5 mr-2 ${result.success ? 'text-green-600' : 'text-red-600'}`} />
                  {result.success ? 'Import Completed Successfully!' : 'Import Failed'}
                </h3>
                <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                  {result.message}
                </p>
              </div>

              {result.success && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{result.successfulImports}</div>
                      <div className="text-gray-500">Imported</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{result.failedImports}</div>
                      <div className="text-gray-500">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700">{result.totalProcessed}</div>
                      <div className="text-gray-500">Total Processed</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadModal;