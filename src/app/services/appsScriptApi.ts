import { APPS_SCRIPT_WEB_APP_URL } from "../config/constants";
import { Record as TaskRecord, User } from "../types/record";
import { TaskFormData } from "../components/TaskDialogs";

type ApiTask = {
  id: string;
  row: number;
  date: string;
  developerEmail: string;
  developerName: string;
  plannedTasks: string;
  category: "Dev" | "Research" | "Test" | "Support";
  priority: "High" | "Medium" | "Low";
  estimatedTime: number;
  actualWork: string;
  completion: number;
  taskLevel: "Easy" | "Medium" | "Hard";
  blockers: string;
  managerRemarks: string;
  createdTimestamp: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "/apps-script"
    : APPS_SCRIPT_WEB_APP_URL;

const asRecord = (task: ApiTask): TaskRecord => ({
  id: task.id,
  date: task.date,
  assignedEmail: task.developerEmail,
  developerName: task.developerName,
  morningPlannedTasks: task.plannedTasks,
  taskCategory: task.category,
  priority: task.priority,
  estimatedTime: Number(task.estimatedTime || 0),
  actualWorkDone: task.actualWork || "",
  completionStatus: Number(task.completion || 0),
  taskLevel: task.taskLevel,
  blockers: task.blockers || "",
  managerRemarks: task.managerRemarks || "",
  createdTimestamp: task.createdTimestamp || new Date().toISOString(),
});

const parseResponse = async <T>(res: Response): Promise<ApiResponse<T>> => {
  if (res.status === 403) {
    throw new Error(
      "Apps Script returned 403 Forbidden. In Google Apps Script deployment settings, set Web app access to 'Anyone' for localhost proxy usage, redeploy a new version, and update the deployment URL/ID in this app."
    );
  }
  const text = await res.text();
  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    const sample = text.replace(/\s+/g, " ").slice(0, 140);
    throw new Error(
      `Apps Script returned non-JSON (status ${res.status}). Response starts with: ${sample}`
    );
  }
};

const postAction = async <T>(
  action: string,
  payload: { [key: string]: unknown },
  requireData: boolean = true
): Promise<T> => {
  const params = new URLSearchParams({ action });
  const body = JSON.stringify({ action, ...payload });
  const res = await fetch(`${API_BASE_URL}?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
  const parsed = await parseResponse<T>(res);
  if (!parsed.success) {
    throw new Error(parsed.message || "Request failed");
  }
  if (requireData && parsed.data === undefined) {
    throw new Error(parsed.message || "Request succeeded but no data was returned");
  }
  return parsed.data as T;
};

export const fetchTasks = async (user: User): Promise<TaskRecord[]> => {
  const params = new URLSearchParams({ action: "listTasks" });
  if (user.role === "admin") {
    params.set("userRole", "admin");
  } else {
    params.set("userEmail", user.email);
    params.set("userRole", user.role);
  }
  const res = await fetch(`${API_BASE_URL}?${params.toString()}`);
  const parsed = await parseResponse<ApiTask[]>(res);
  if (!parsed.success || !parsed.data) {
    throw new Error(parsed.message || "Failed to fetch tasks");
  }
  return parsed.data.map(asRecord);
};

export const createTask = async (
  user: User,
  data: TaskFormData
): Promise<TaskRecord> => {
  const task = await postAction<ApiTask>("createTask", {
    userEmail: user.email,
    taskData: {
      developerName: user.email.split("@")[0],
      plannedTasks: data.morningPlannedTasks,
      category: data.taskCategory,
      priority: data.priority,
      estimatedTime: data.estimatedTime,
      actualWork: data.actualWorkDone,
      completion: data.completionStatus,
      taskLevel: data.taskLevel,
      blockers: data.blockers,
    },
  }, false);
  if (!task) {
    // Some Apps Script versions return success/message without data.
    return {
      id: "",
      date: data.date,
      assignedEmail: user.email,
      developerName: user.email.split("@")[0],
      morningPlannedTasks: data.morningPlannedTasks,
      taskCategory: data.taskCategory,
      priority: data.priority,
      estimatedTime: data.estimatedTime,
      actualWorkDone: data.actualWorkDone,
      completionStatus: data.completionStatus,
      taskLevel: data.taskLevel,
      blockers: data.blockers,
      managerRemarks: "",
      createdTimestamp: new Date().toISOString(),
    };
  }
  return asRecord(task);
};

export const updateTask = async (
  user: User,
  record: TaskRecord
): Promise<TaskRecord> => {
  const task = await postAction<ApiTask>("updateTask", {
    userEmail: user.email,
    id: record.id,
    taskData: {
      plannedTasks: record.morningPlannedTasks,
      category: record.taskCategory,
      priority: record.priority,
      estimatedTime: record.estimatedTime,
      actualWork: record.actualWorkDone,
      completion: record.completionStatus,
      taskLevel: record.taskLevel,
      blockers: record.blockers,
      managerRemarks: record.managerRemarks,
    },
  }, false);
  if (!task) {
    return record;
  }
  return asRecord(task);
};
