export interface Record {
  id: string;
  assignedEmail: string;
  date: string;
  developerName: string;
  morningPlannedTasks: string;
  taskCategory: 'Dev' | 'Research' | 'Test' | 'Support' | 'Internal Meeting';
  priority: 'High' | 'Medium' | 'Low';
  estimatedTime: number;
  estimatedDays: number;
  workModule: string;
  actualWorkDone: string;
  completionStatus: number;
  taskLevel: 'Easy' | 'Medium' | 'Hard';
  blockers: string;
  blockerOwner: string;
  resolutionAction: '' | 'Resolve' | 'Need Help' | 'Alternative';
  managerRemarks: string;
  createdTimestamp: string;
}

export type UserRole = 'admin' | 'developer';

export interface User {
  email: string;
  role: UserRole;
}
