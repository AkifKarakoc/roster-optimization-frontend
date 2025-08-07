import React, { useState } from 'react';
import { ExcelUploadModal } from './ExcelUploadModal';
import { ExcelPreview } from './ExcelPreview';
import { ExcelProcessingResult, ExcelImportResult, excelService } from '../../services/excelService';

type ImportState = 'upload' | 'preview' | 'importing' | 'completed';

interface ExcelImportPageProps {
  onClose?: () => void;
}

export const ExcelImportPage: React.FC<ExcelImportPageProps> = ({ onClose }) => {
  const [importState, setImportState] = useState<ImportState>('upload');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [processingResult, setProcessingResult] = useState<ExcelProcessingResult | null>(null);
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileProcessed = (result: ExcelProcessingResult) => {
    setProcessingResult(result);
    setImportState('preview');
    setError(null);
  };

  const handleImport = async () => {
    if (!processingResult) return;

    setIsImporting(true);
    setError(null);

    try {
      // Collect all importable row IDs
      const selectedRowIds = processingResult.sheets
        .flatMap(sheet => sheet.rows)
        .filter(row => row.canImport)
        .map(row => row.rowId);
      
      const result = await excelService.executeImport(processingResult.sessionId, {
        selectedRowIds,
        continueOnError: true,
        validateBeforeImport: true
      });
      setImportResult(result);
      setImportState('completed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'İçe aktarım sırasında bir hata oluştu.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setProcessingResult(null);
    setImportResult(null);
    setImportState('upload');
    setError(null);
    if (onClose) {
      onClose();
    }
  };

  const handleStartNew = () => {
    setProcessingResult(null);
    setImportResult(null);
    setImportState('upload');
    setError(null);
    setShowUploadModal(true);
  };

  if (importState === 'preview' && processingResult) {
    return (
      <ExcelPreview
        data={processingResult}
        onImport={handleImport}
        onCancel={handleCancel}
        isImporting={isImporting}
      />
    );
  }

  if (importState === 'completed' && importResult) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              importResult.success ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <span className="text-3xl">
                {importResult.success ? '✅' : '❌'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {importResult.success ? 'İçe Aktarım Başarılı!' : 'İçe Aktarım Başarısız!'}
            </h1>
            <p className="text-gray-600">{importResult.message}</p>
          </div>

          {/* Import Summary */}
          {importResult.success && importResult.importedEntities && Object.keys(importResult.importedEntities).length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">İçe Aktarılan Kayıtlar</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(importResult.importedEntities).map(([entityType, count]) => (
                  <div key={entityType} className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{count}</div>
                    <div className="text-sm text-green-600 capitalize">
                      {entityType.toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed Entities */}
          {importResult.failedEntities && Object.keys(importResult.failedEntities).length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Başarısız Kayıtlar</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(importResult.failedEntities).map(([entityType, count]) => (
                  <div key={entityType} className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{count}</div>
                    <div className="text-sm text-red-600 capitalize">
                      {entityType.toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {importResult.errors && importResult.errors.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Hatalar</h2>
              <div className="space-y-2">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {importResult.warnings && importResult.warnings.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Uyarılar</h2>
              <div className="space-y-2">
                {importResult.warnings.map((warning, index) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">{warning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleStartNew}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Yeni İçe Aktarım
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Excel İçe Aktarım</h1>
        <p className="text-gray-600 mb-8">
          Excel dosyalarınızı sisteme toplu olarak aktarabilirsiniz. 
          İşlem öncesi dosyanız kontrol edilecek ve hata varsa size bildirilecektir.
        </p>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Başlamaya Hazır mısınız?</h2>
            <p className="text-gray-600 mb-6">
              Excel dosyanızı yükleyerek başlayabilirsiniz. Dosyanız işlendikten sonra 
              önizleme ekranında tüm detayları görebileceksiniz.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-8 py-3 text-lg font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Excel Dosyası Yükle
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Otomatik Doğrulama</h3>
            <p className="text-sm text-gray-600">
              Dosyanız yüklendikten sonra tüm veriler otomatik olarak kontrol edilir.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">👁️</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Detaylı Önizleme</h3>
            <p className="text-sm text-gray-600">
              İçe aktarmadan önce tüm verileri ve potansiyel hataları görebilirsiniz.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Güvenli İşlem</h3>
            <p className="text-sm text-gray-600">
              Sadece hatasız veriler içe aktarılır, sistem bütünlüğü korunur.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <ExcelUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onProcessed={handleFileProcessed}
      />
    </div>
  );
};