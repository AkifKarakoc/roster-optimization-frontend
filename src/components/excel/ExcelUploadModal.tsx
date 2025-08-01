import React, { useState, useRef } from 'react';
import { 
  XMarkIcon, 
  DocumentArrowUpIcon, 
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { excelService, ExcelPreviewDTO, ImportResultDTO } from '../../services/excelService';
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
  const [preview, setPreview] = useState<ExcelPreviewDTO | null>(null);
  const [result, setResult] = useState<ImportResultDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetModal = () => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
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
      setStep('preview');
      setError(null);
      const previewData = await excelService.uploadAndPreview(file, entityType);
      setPreview(previewData);
    } catch (err) {
      setError('Failed to process Excel file');
      setStep('upload');
    }
  };

  const handleApply = async () => {
    if (!preview) return;

    try {
      setStep('processing');
      setError(null);
      const resultData = await excelService.applyChanges(preview.sessionId);
      setResult(resultData);
      setStep('result');
      
      if (resultData.success) {
        onSuccess();
      }
    } catch (err) {
      setError('Failed to apply changes');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
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

        <div className="p-6">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-6">
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
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Process File
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && preview && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Import Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Rows:</span>
                    <span className="ml-2 font-medium">{preview.totalRows}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Valid:</span>
                    <span className="ml-2 font-medium text-green-600">{preview.validRows}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Errors:</span>
                    <span className="ml-2 font-medium text-red-600">{preview.errorRows}</span>
                  </div>
                </div>
              </div>

              {preview.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                    Validation Errors
                  </h4>
                  <div className="max-h-32 overflow-y-auto">
                    {preview.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">
                        Row {error.row}: {error.message}
                      </div>
                    ))}
                    {preview.errors.length > 10 && (
                      <div className="text-sm text-red-600 mt-2">
                        ... and {preview.errors.length - 10} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleApply}
                  disabled={preview.validRows === 0}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Import {preview.validRows} Records
                </button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="py-12">
              <LoadingSpinner size="lg" message="Processing your data..." />
            </div>
          )}

          {/* Result Step */}
          {step === 'result' && result && (
            <div className="space-y-6">
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
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 font-medium text-green-600">{result.createdCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Updated:</span>
                      <span className="ml-2 font-medium text-blue-600">{result.updatedCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Errors:</span>
                      <span className="ml-2 font-medium text-red-600">{result.errorCount}</span>
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