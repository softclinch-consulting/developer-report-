export interface Record {
  id: string;
  assignedEmail: string;
  date: string;
  developerName: string;
  morningPlannedTasks: string;
  taskCategory: 'Dev' | 'Research' | 'Test' | 'Support';
  priority: 'High' | 'Medium' | 'Low';
  estimatedTime: number;
  actualWorkDone: string;
  completionStatus: number;
  taskLevel: 'Easy' | 'Medium' | 'Hard';
  blockers: string;
  managerRemarks: string;
  createdTimestamp: string;
}

export type UserRole = 'admin' | 'developer';

export interface User {
  email: string;
  role: UserRole;
}
