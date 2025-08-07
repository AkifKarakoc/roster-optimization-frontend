import React, { useState } from 'react';
import { ExcelSheet, ExcelRow } from '../../services/excelService';

interface SheetDetailProps {
  sheet: ExcelSheet;
}

export const SheetDetail: React.FC<SheetDetailProps> = ({ sheet }) => {
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredRows = showOnlyErrors 
    ? sheet.rows.filter(row => row.errors.length > 0)
    : sheet.rows;

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const getSeverityIcon = (severity: 'ERROR' | 'WARNING' | 'INFO') => {
    switch (severity) {
      case 'ERROR':
        return '🔴';
      case 'WARNING':
        return '🟡';
      case 'INFO':
        return '🔵';
      default:
        return '⚪';
    }
  };

  const getSeverityColor = (severity: 'ERROR' | 'WARNING' | 'INFO') => {
    switch (severity) {
      case 'ERROR':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'WARNING':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'INFO':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'ADD':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRowStatus = (row: ExcelRow) => {
    if (!row.canImport) {
      return { text: 'İçe Aktarılamaz', color: 'bg-red-100 text-red-800' };
    } else if (row.errors.some(e => e.severity === 'WARNING')) {
      return { text: 'Uyarı ile İçe Aktarılabilir', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'İçe Aktarılabilir', color: 'bg-green-100 text-green-800' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Sheet Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Sayfa: </span>
            <span className="text-gray-900">{sheet.sheetName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Varlık Türü: </span>
            <span className="text-gray-900">{sheet.entityType}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Toplam Satır: </span>
            <span className="text-gray-900">{sheet.totalRows}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Geçerli Satır: </span>
            <span className="text-gray-900">{sheet.validRows}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Hatalı Satır: </span>
            <span className="text-red-600">{sheet.errorRows}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Uyarılı Satır: </span>
            <span className="text-yellow-600">{sheet.warningRows}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">İçe Aktarılabilir: </span>
            <span className="text-green-600">{sheet.importableRows}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Ana ID Sütunu: </span>
            <span className="text-gray-900">{sheet.mainIdColumn}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showOnlyErrors}
              onChange={(e) => setShowOnlyErrors(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Sadece hataları göster ({sheet.rows.filter(r => r.errors.length > 0).length})
            </span>
          </label>
        </div>
        <div className="text-sm text-gray-500">
          {filteredRows.length} satır gösteriliyor
        </div>
      </div>

      {/* Headers */}
      <div className="bg-gray-100 p-3 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Sütun Başlıkları</h3>
        <div className="flex flex-wrap gap-2">
          {sheet.headers.map((header, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm ${
                header === sheet.mainIdColumn
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {header}
              {header === sheet.mainIdColumn && ' (Ana ID)'}
            </span>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-4">
        {filteredRows.map((row) => {
          const isExpanded = expandedRows.has(row.rowId);
          const status = getRowStatus(row);
          
          return (
            <div key={row.rowId} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Row Header */}
              <div 
                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleRowExpansion(row.rowId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <svg
                        className={`h-4 w-4 text-gray-500 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="font-medium text-gray-900">Satır {row.rowNumber}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOperationColor(row.operation)}`}>
                      {row.operation}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {row.errors.length > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        {row.errors.length} hata/uyarı
                      </span>
                    )}
                    {row.mainEntityId && (
                      <span className="text-sm text-gray-600">
                        ID: {row.mainEntityId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Row Details */}
              {isExpanded && (
                <div className="p-4 border-t border-gray-200">
                  {/* Cell Values */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Hücre Değerleri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(row.cellValues).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-medium text-gray-600 w-32 flex-shrink-0">
                            {key}:
                          </span>
                          <span className="text-gray-900 break-all">{value || '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Errors */}
                  {row.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Hatalar ve Uyarılar ({row.errors.length})
                      </h4>
                      <div className="space-y-2">
                        {row.errors.map((error, errorIndex) => (
                          <div
                            key={errorIndex}
                            className={`p-3 border rounded-lg ${getSeverityColor(error.severity)}`}
                          >
                            <div className="flex items-start space-x-2">
                              <span className="text-sm">{getSeverityIcon(error.severity)}</span>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{error.fieldName}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                    error.severity === 'ERROR' ? 'bg-red-200 text-red-800' :
                                    error.severity === 'WARNING' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-blue-200 text-blue-800'
                                  }`}>
                                    {error.severity}
                                  </span>
                                  {error.blocking && (
                                    <span className="px-1.5 py-0.5 bg-red-200 text-red-800 rounded text-xs font-medium">
                                      ENGELLEYİCİ
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm mb-1">{error.errorMessage}</p>
                                {error.currentValue && (
                                  <p className="text-xs text-gray-600">
                                    Mevcut Değer: <span className="font-mono">{error.currentValue}</span>
                                  </p>
                                )}
                                {error.expectedFormat && (
                                  <p className="text-xs text-gray-600">
                                    Beklenen Format: <span className="font-mono">{error.expectedFormat}</span>
                                  </p>
                                )}
                                {error.suggestedFix && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    💡 Önerilen Çözüm: {error.suggestedFix}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Satır ID: </span>
                        <span className="text-gray-900 font-mono text-xs">{row.rowId}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Varlık ID: </span>
                        <span className="text-gray-900">{row.entityId || 'Yeni'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Hata Özeti: </span>
                        <span className="text-gray-900">{row.errorSummary || 'Hata yok'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredRows.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {showOnlyErrors ? 'Hata bulunan satır yok.' : 'Satır bulunamadı.'}
        </div>
      )}
    </div>
  );
};