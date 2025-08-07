// Excel format validation utilities for new format

export interface EntityHeaderMapping {
  [entityType: string]: string[];
}

// New format header mappings based on required fields (correct order)
export const ENTITY_HEADERS: EntityHeaderMapping = {
  department: ['Department ID', 'Name', 'Description', 'Active'],
  DEPARTMENT: ['Department ID', 'Name', 'Description', 'Active'],
  qualification: ['Qualification ID', 'Name', 'Description', 'Active'],
  QUALIFICATION: ['Qualification ID', 'Name', 'Description', 'Active'],
  workingPeriod: ['Period ID', 'Name', 'Start Time', 'End Time', 'Active', 'Description'],
  WORKING_PERIOD: ['Period ID', 'Name', 'Start Time', 'End Time', 'Active', 'Description'],
  squadWorkingPattern: ['Pattern ID', 'Name', 'Pattern', 'Description', 'Active', 'Cycle Length'],
  SQUAD_WORKING_PATTERN: ['Pattern ID', 'Name', 'Pattern', 'Description', 'Active', 'Cycle Length'],
  squad: ['Squad ID', 'Name', 'Pattern ID', 'Start Date', 'Active', 'Description'],
  SQUAD: ['Squad ID', 'Name', 'Pattern ID', 'Start Date', 'Active', 'Description'],
  shift: ['Shift ID', 'Name', 'Description', 'Start Time', 'End Time', 'Working Period ID', 'Fixed', 'Active'],
  SHIFT: ['Shift ID', 'Name', 'Description', 'Start Time', 'End Time', 'Working Period ID', 'Fixed', 'Active'],
  staff: ['Staff ID', 'Name', 'Surname', 'Registration Code', 'Email', 'Phone', 'Department ID', 'Squad ID', 'Qualification Ids', 'Active'],
  STAFF: ['Staff ID', 'Name', 'Surname', 'Registration Code', 'Email', 'Phone', 'Department ID', 'Squad ID', 'Qualification Ids', 'Active'],
  task: ['Task ID', 'Name', 'Description', 'Department ID', 'Priority', 'Start Time', 'End Time', 'Require Qualification Ids', 'Active'],
  TASK: ['Task ID', 'Name', 'Description', 'Department ID', 'Priority', 'Start Time', 'End Time', 'Require Qualification Ids', 'Active'],
  dayOffRule: ['Rule ID', 'Max Working Days', 'Min Days Off', 'Preferred Day Off', 'Staff Employee Number'],
  constraintOverride: ['Override ID', 'Value', 'Staff Employee Number', 'Constraint Name']
};

// Validate ID format (Entity_1, Entity_2, etc.)
export const validateIdFormat = (value: string, entityType: string): boolean => {
  if (!value) return true; // Empty is allowed for new records
  
  const entityName = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  const pattern = new RegExp(`^${entityName}_\\d+$`);
  return pattern.test(value);
};

// Validate boolean format (DOĞRU/YANLIŞ)
export const validateBooleanFormat = (value: string): boolean => {
  if (!value) return true; // Empty is allowed, defaults to true
  
  const normalizedValue = value.toString().toUpperCase();
  return ['DOĞRU', 'YANLIŞ', 'TRUE', 'FALSE'].includes(normalizedValue);
};

// Convert boolean values to display format
export const formatBooleanForDisplay = (value: boolean | string): string => {
  if (typeof value === 'boolean') {
    return value ? 'DOĞRU' : 'YANLIŞ';
  }
  
  const normalizedValue = value.toString().toUpperCase();
  if (normalizedValue === 'TRUE' || normalizedValue === 'DOĞRU') {
    return 'DOĞRU';
  }
  if (normalizedValue === 'FALSE' || normalizedValue === 'YANLIŞ') {
    return 'YANLIŞ';
  }
  
  return 'DOĞRU'; // Default to true
};

// Validate Excel headers match expected format
export const validateExcelHeaders = (headers: string[], entityType: string): {
  isValid: boolean;
  missingHeaders: string[];
  extraHeaders: string[];
} => {
  const expectedHeaders = ENTITY_HEADERS[entityType] || [];
  const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
  const extraHeaders = headers.filter(header => !expectedHeaders.includes(header));
  
  return {
    isValid: missingHeaders.length === 0,
    missingHeaders,
    extraHeaders
  };
};

// Generate sample ID for entity type
export const generateSampleId = (entityType: string, index: number = 1): string => {
  const entityName = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  return `${entityName}_${index}`;
};

// Validate time format (HH:mm)
export const validateTimeFormat = (value: string): boolean => {
  if (!value) return true;
  
  const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timePattern.test(value);
};

// Validate date format (YYYY-MM-DD)
export const validateDateFormat = (value: string): boolean => {
  if (!value) return true;
  
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(value)) return false;
  
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
};

// Validate email format
export const validateEmailFormat = (value: string): boolean => {
  if (!value) return true;
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value);
};

// Validate phone format
export const validatePhoneFormat = (value: string): boolean => {
  if (!value) return true;
  
  const phonePattern = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phonePattern.test(value);
};

// Validate numeric value
export const validateNumericFormat = (value: string): boolean => {
  if (!value) return true;
  
  return !isNaN(Number(value)) && isFinite(Number(value));
};

// Validate multiple IDs (comma-separated)
export const validateMultipleIds = (value: string, entityType: string): boolean => {
  if (!value) return true;
  
  const ids = value.split(',').map(id => id.trim());
  return ids.every(id => validateIdFormat(id, entityType));
};

// Required fields mapping for each entity
export const REQUIRED_FIELDS: { [entityType: string]: string[] } = {
  department: ['Department ID', 'Name', 'Description', 'Active'],
  qualification: ['Qualification ID', 'Name', 'Description', 'Active'],
  workingPeriod: ['Period ID', 'Name', 'Start Time', 'End Time', 'Active', 'Description'],
  squadWorkingPattern: ['Pattern ID', 'Name', 'Pattern', 'Description', 'Active', 'Cycle Length'],
  squad: ['Squad ID', 'Name', 'Pattern ID', 'Start Date', 'Active', 'Description'],
  shift: ['Shift ID', 'Name', 'Description', 'Start Time', 'End Time', 'Working Period ID', 'Fixed', 'Active'],
  staff: ['Staff ID', 'Name', 'Surname', 'Registration Code', 'Email', 'Phone', 'Department ID', 'Squad ID', 'Qualification Ids', 'Active'],
  task: ['Task ID', 'Name', 'Description', 'Department ID', 'Priority', 'Start Time', 'End Time', 'Require Qualification Ids', 'Active']
};

// Get field validation info
export const getFieldValidationInfo = (fieldName: string, entityType?: string): {
  type: 'id' | 'boolean' | 'time' | 'date' | 'text' | 'number' | 'email' | 'phone';
  required: boolean;
  description: string;
} => {
  const fieldLower = fieldName.toLowerCase();
  const isRequired = entityType ? (REQUIRED_FIELDS[entityType] || []).includes(fieldName) : false;
  
  if (fieldLower.includes('id')) {
    return {
      type: 'id',
      required: isRequired,
      description: 'Format: EntityName_Number (e.g., Department_1) or comma-separated for multiple IDs'
    };
  }
  
  if (fieldLower === 'active' || fieldLower === 'fixed') {
    return {
      type: 'boolean',
      required: isRequired,
      description: 'Use DOĞRU (true) or YANLIŞ (false)'
    };
  }
  
  if (fieldLower.includes('time')) {
    return {
      type: 'time',
      required: isRequired,
      description: 'Format: HH:mm (e.g., 08:30)'
    };
  }
  
  if (fieldLower.includes('date')) {
    return {
      type: 'date',
      required: isRequired,
      description: 'Format: YYYY-MM-DD (e.g., 2025-08-01)'
    };
  }
  
  if (fieldLower.includes('email')) {
    return {
      type: 'email',
      required: isRequired,
      description: 'Valid email address'
    };
  }
  
  if (fieldLower.includes('phone')) {
    return {
      type: 'phone',
      required: isRequired,
      description: 'Phone number'
    };
  }
  
  if (fieldLower.includes('count') || fieldLower.includes('length') || fieldLower === 'priority') {
    return {
      type: 'number',
      required: isRequired,
      description: 'Numeric value'
    };
  }
  
  return {
    type: 'text',
    required: isRequired,
    description: 'Text value'
  };
};

// Check if field is required for given entity
export const isFieldRequired = (fieldName: string, entityType: string): boolean => {
  return (REQUIRED_FIELDS[entityType] || []).includes(fieldName);
};
