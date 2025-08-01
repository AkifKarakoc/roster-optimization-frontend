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