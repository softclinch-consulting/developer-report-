import { Record } from '../types/record';
import { ADMIN_EMAIL } from '../config/constants';

const STORAGE_KEY = 'developer_task_tracker_records';

export const getRecords = (): Record[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveRecords = (records: Record[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const generateId = (): string => {
  return `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getTodayDate = (): string => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`; // Local YYYY-MM-DD
};

const toLocalDateKey = (value: string): string | null => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  // US style M/D/YYYY or MM/DD/YYYY
  const usMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const mm = String(Number(usMatch[1])).padStart(2, '0');
    const dd = String(Number(usMatch[2])).padStart(2, '0');
    const yyyy = usMatch[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // Datetime or other parseable formats
  const dt = new Date(raw);
  if (!Number.isNaN(dt.getTime())) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
};

export const isToday = (dateString: string): boolean => {
  const recordDate = toLocalDateKey(dateString);
  if (!recordDate) return false;
  return recordDate === getTodayDate();
};

export const createRecord = (
  assignedEmail: string,
  developerName: string,
  data: {
    date: string;
    morningPlannedTasks: string;
    taskCategory: 'Dev' | 'Research' | 'Test' | 'Support';
    priority: 'High' | 'Medium' | 'Low';
    estimatedTime: number;
    estimatedDays: number;
    actualWorkDone: string;
    completionStatus: number;
    taskLevel: 'Easy' | 'Medium' | 'Hard';
    blockers: string;
    blockerOwner: string;
  }
): Record => {
  return {
    id: generateId(),
    assignedEmail,
    developerName,
    ...data,
    managerRemarks: '',
    createdTimestamp: new Date().toISOString(),
  };
};

export const canEditRecord = (
  record: Record,
  userEmail: string,
  isAdmin: boolean
): boolean => {
  // Admin can always edit
  if (isAdmin) return true;
  
  // Developer can only edit their own tasks created today
  const recordDate = record.date;
  const isOwnRecord = record.assignedEmail === userEmail;
  const isCreatedToday = isToday(recordDate);
  
  return isOwnRecord && isCreatedToday;
};

export const isRecordLocked = (
  record: Record,
  userEmail: string
): boolean => {
  // Check if user is admin
  const isAdmin = userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  
  // Admin can always edit (not locked)
  if (isAdmin) return false;
  
  // Developer's record is locked if it's not created today
  const isOwnRecord = record.assignedEmail === userEmail;
  const isCreatedToday = isToday(record.date);
  
  return isOwnRecord && !isCreatedToday;
};

export const exportToCSV = (records: Record[]): string => {
  const headers = [
    'Date',
    'Developer Name',
    'Morning Planned Tasks',
    'Task Category',
    'Priority',
    'Estimated Time (Hours)',
    'Estimated Days',
    'Actual Work Done (EOD)',
    'Completion Status (%)',
    'Task Level',
    'Blockers / Issues',
    'Blocker/Error Owner',
    'Manager Remarks',
    'Assigned Email',
    'Created Timestamp'
  ];
  
  const rows = records.map(record => [
    record.date,
    record.developerName,
    record.morningPlannedTasks,
    record.taskCategory,
    record.priority,
    record.estimatedTime.toString(),
    record.estimatedDays.toString(),
    record.actualWorkDone,
    record.completionStatus.toString(),
    record.taskLevel,
    record.blockers,
    record.blockerOwner,
    record.managerRemarks,
    record.assignedEmail,
    new Date(record.createdTimestamp).toLocaleString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (records: Record[]): void => {
  const csv = exportToCSV(records);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `developer-tasks-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
