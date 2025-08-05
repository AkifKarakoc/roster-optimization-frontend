// DTO Type Definitions - Backend'den gelen data yapıları

export interface DepartmentDTO {
  id?: number;
  name: string;
  description?: string;
  active?: boolean;
  staffCount?: number;
  taskCount?: number;
}

export interface QualificationDTO {
  id?: number;
  name: string; 
  description?: string;
  active?: boolean;
  staffCount?: number;
  taskCount?: number;
}

export interface LocalTime {
  hour: number;
  minute: number;
  second?: number;
  nano?: number;
}

export interface WorkingPeriodDTO {
  id?: number;
  name: string;
  startTime: LocalTime;
  endTime: LocalTime;
  description?: string;
  active?: boolean;
  shiftCount?: number;
  durationHours?: number;
  isNightPeriod?: boolean;
}

export interface ShiftDTO {
  id?: number;
  name: string;
  startTime: LocalTime;
  endTime: LocalTime;
  isNightShift?: boolean;
  fixed?: boolean;
  description?: string;
  active?: boolean;
  workingPeriodId: number;
  workingPeriod?: WorkingPeriodDTO;
  durationHours?: number;
  crossesMidnight?: boolean;
}

export interface SquadWorkingPatternDTO {
  id?: number;
  name: string;
  shiftPattern: string;
  description?: string;
  cycleLength: number;
  active?: boolean;
  squadCount?: number;
  patternItems?: string[];
  workingDaysInCycle?: number;
  dayOffCount?: number;
  workingDaysPercentage?: number;
  isValidPattern?: boolean;
  patternErrors?: string[];
}

export interface SquadDTO {
  id?: number;
  name: string;
  startDate: string; // LocalDate as string
  description?: string;
  active?: boolean;
  squadWorkingPatternId: number;
  squadWorkingPattern?: SquadWorkingPatternDTO;
  staffCount?: number;
  daysSinceStart?: number;
  currentCycleDay?: number;
  currentCyclePosition?: number;
  isNewSquad?: boolean;
}

export interface StaffDTO {
  id?: number;
  name: string;
  surname: string;
  registrationCode: string;
  email?: string;
  phone?: string;
  active?: boolean;
  departmentId: number;
  squadId: number;
  qualificationIds?: number[];
  department?: DepartmentDTO;
  squad?: SquadDTO;
  qualifications?: QualificationDTO[];
  dayOffRule?: DayOffRuleDTO;
  constraintOverrides?: ConstraintOverrideDTO[];
  fullName?: string;
  displayName?: string;
  qualificationCount?: number;
  hasDayOffRule?: boolean;
  hasConstraintOverrides?: boolean;
  currentCyclePosition?: number;
}

export interface TaskDTO {
  id?: number;
  name: string;
  startTime: string; // LocalDateTime as string
  endTime: string;
  priority: number;
  description?: string;
  active?: boolean;
  departmentId: number;
  requiredQualificationIds?: number[];
  department?: DepartmentDTO;
  requiredQualifications?: QualificationDTO[];
  durationHours?: number;
  durationMinutes?: number;
  priorityLevel?: string;
  status?: string;
  requiredQualificationCount?: number;
  crossesMidnight?: boolean;
  dateDisplay?: string;
  timeDisplay?: string;
}

export interface DayOffRuleDTO {
  id?: number;
  workingDays: number;
  offDays: number;
  fixedOffDays?: string;
  staffId: number;
  staff?: StaffDTO;
  ruleType?: string;
  fixedOffDaysList?: string[];
  totalCycleDays?: number;
  workRatio?: number;
  hasFixedDays?: boolean;
  ruleDescription?: string;
}

export interface ConstraintDTO {
  id?: number;
  name: string;
  type: 'HARD' | 'SOFT';
  defaultValue: string;
  description?: string;
  active?: boolean;
  overrideCount?: number;
  staffWithOverridesCount?: number;
  typeDisplay?: string;
  valueType?: string;
  isNumeric?: boolean;
  isBoolean?: boolean;
}

export interface ConstraintOverrideDTO {
  id?: number;
  overrideValue: string;
  staffId: number;
  constraintId: number;
  staff?: StaffDTO;
  constraint?: ConstraintDTO;
  staffDisplayName?: string;
  staffRegistrationCode?: string;
  constraintName?: string;
  constraintType?: string;
  defaultValue?: string;
  isDifferent?: boolean;
}

// Add these types to the end of your existing entities.ts file

export interface RosterGenerationRequest {
  departmentId: number;
  startDate: string;
  endDate: string;
  algorithmType: string;
  algorithmParameters: { [key: string]: any };
  maxExecutionTimeMinutes: number;
  enableParallelProcessing: boolean;
}

export interface AlgorithmParameterInfo {
  name: string;
  description: string;
  type: string;
  defaultValue: any;
  minValue?: any;
  maxValue?: any;
}

export interface AlgorithmInfo {
  name: string;
  description: string;
  supportsParallelProcessing: boolean;
  defaultParameters: { [key: string]: any };
  configurableParameters: { [key: string]: AlgorithmParameterInfo };
}

export interface RosterPlan {
  id?: number;
  planId?: string;
  departmentId?: number;
  weekStartDate?: string;
  weekEndDate?: string;
  startDate?: string;
  endDate?: string;
  algorithmUsed: string;
  executionTime?: number;
  executionTimeMs?: number;
  score?: number;
  fitnessScore?: number;
  hardConstraintViolations?: number;
  softConstraintViolations?: number;
  feasible?: boolean;
  totalAssignments?: number;
  uniqueStaffCount?: number;
  taskCoverageRate?: number;
  staffUtilizationRate?: number;
  assignments: RosterAssignment[];
  unassignedTasks: TaskDTO[];
  underutilizedStaff?: any[];
  statistics?: RosterStatistics;
  algorithmMetadata?: any;
  generatedAt?: string;
  createdAt?: string;
}

export interface RosterAssignment {
  staff: {
    id: number;
    name: string;
    surname: string;
    registrationCode: string;
    title?: string;
  };
  shift: {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    type: string;
  };
  task: {
    id: number;
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    priority: string;
    requiredStaffCount?: number;
  };
  date: string;
  durationHours: number;
}

// Keep old interface for backward compatibility
export interface StaffAssignment {
  staffId: number;
  staffName: string;
  date: string;
  shiftId?: number;
  shiftName?: string;
  taskIds: number[];
  totalHours: number;
  isRestDay: boolean;
}

export interface RosterStatistics {
  totalStaff: number;
  totalShifts: number;
  totalTasks: number;
  assignedTasks: number;
  unassignedTasks: number;
  taskCoverageRate: number;
  averageWorkingHours: number;
  maxWorkingHours: number;
  minWorkingHours: number;
  patternComplianceRate: number;
  constraintViolations: ConstraintViolation[];
}

export interface ConstraintViolation {
  type: string;
  staffId?: number;
  staffName?: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface RosterValidationResult {
  isValid: boolean;
  violations: ConstraintViolation[];
  score: number;
  recommendations: string[];
}

// entities.ts dosyasının sonuna ekle:

// Backend ApiResponse wrapper type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}