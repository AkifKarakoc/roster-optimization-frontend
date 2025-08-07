import React, { useState } from 'react';
import { ExcelProcessingResult, ExcelSheet } from '../../services/excelService';
import { SheetDetail } from './SheetDetail';

interface ExcelPreviewProps {
  data: ExcelProcessingResult;
  onImport: () => void;
  onCancel: () => void;
  isImporting: boolean;
}

export const ExcelPreview: React.FC<ExcelPreviewProps> = ({
  data,
  onImport,
  onCancel,
  isImporting,
}) => {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [expandedSummary, setExpandedSummary] = useState(true);


  const getStatusIcon = (sheet: ExcelSheet) => {
    if (sheet.errorRows > 0) {
      return <span className="text-red-500">❌</span>;
    } else if (sheet.warningRows > 0) {
      return <span className="text-yellow-500">⚠️</span>;
    } else {
      return <span className="text-green-500">✅</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Excel İçe Aktarım Önizleme</h1>
            <p className="text-gray-600">{data.fileName}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              disabled={isImporting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              İptal
            </button>
            <button
              onClick={onImport}
              disabled={data.hasBlockingErrors || isImporting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İçe Aktarılıyor...
                </>
              ) : (
                'İçe Aktar'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div 
          className="p-4 cursor-pointer flex items-center justify-between"
          onClick={() => setExpandedSummary(!expandedSummary)}
        >
          <h2 className="text-lg font-semibold text-gray-900">Genel Özet</h2>
          <svg
            className={`h-5 w-5 text-gray-500 transition-transform ${
              expandedSummary ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {expandedSummary && (
          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{data.totalSheets}</div>
                <div className="text-sm text-blue-600">Toplam Sayfa</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{data.totalRows}</div>
                <div className="text-sm text-gray-600">Toplam Satır</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{data.importableRows}</div>
                <div className="text-sm text-green-600">İçe Aktarılabilir</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{data.errorRows}</div>
                <div className="text-sm text-red-600">Hatalı Satır</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">İşlem Özeti</h3>
                <p className="text-sm text-gray-600 mb-1">
                  Başarı Oranı: <span className="font-medium">{data.successRate.toFixed(1)}%</span>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  İşlem Süresi: <span className="font-medium">{data.processingTimeMs}ms</span>
                </p>
                <p className="text-sm text-gray-600">
                  İşlem Durumu: <span className="font-medium">{data.importReadinessSummary}</span>
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Varlık Türleri</h3>
                <div className="space-y-1">
                  {Object.entries(data.entityTypeCounts).map(([entityType, count]) => (
                    <div key={entityType} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{entityType.toLowerCase()}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {data.hasBlockingErrors && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Kritik hatalar bulundu. İçe aktarım yapılmadan önce bu hataların düzeltilmesi gerekiyor.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sheet Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex overflow-x-auto">
            {data.sheets.map((sheet, index) => (
              <button
                key={index}
                onClick={() => setActiveSheetIndex(index)}
                className={`py-2 px-4 text-sm font-medium border-b-2 whitespace-nowrap flex items-center space-x-2 ${
                  activeSheetIndex === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getStatusIcon(sheet)}
                <span>{sheet.sheetName}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {sheet.importableRows}/{sheet.totalRows}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Active Sheet Content */}
        <div className="p-6">
          <SheetDetail sheet={data.sheets[activeSheetIndex]} />
        </div>
      </div>
    </div>
  );
};