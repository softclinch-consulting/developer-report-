/*************************************************
DEVELOPER TASK TRACKER API
*************************************************/

const SHEET_NAME = "Tasks";
const ADMIN_EMAIL = "softclinch@gmail.com";

/*************************************************
GET SHEET
*************************************************/

function getSheet() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {

    sheet = ss.insertSheet(SHEET_NAME);

    sheet.appendRow([
      "ID",
      "Date",
      "Developer Email",
      "Developer Name",
      "Planned Tasks",
      "Category",
      "Priority",
      "Estimated Time",
      "Actual Work",
      "Completion",
      "Task Level",
      "Blockers",
      "Blocker Owner",
      "Manager Remarks",
      "Created Timestamp"
    ]);

  }

  return sheet;

}

/*************************************************
JSON RESPONSE
*************************************************/

function jsonResponse(data) {

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

}

function formatDateKey(value) {
  const dt = new Date(value);
  if (isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = ("0" + (dt.getMonth() + 1)).slice(-2);
  const d = ("0" + dt.getDate()).slice(-2);
  return y + "-" + m + "-" + d;
}

function parseRequestData(e) {
  const raw = e && e.postData && e.postData.contents ? String(e.postData.contents) : "";
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (jsonErr) {
    // Support x-www-form-urlencoded payloads like action=deleteTask&id=...
    const out = {};
    const pairs = raw.split("&");
    for (let i = 0; i < pairs.length; i++) {
      if (!pairs[i]) continue;
      const kv = pairs[i].split("=");
      const key = decodeURIComponent((kv[0] || "").replace(/\+/g, " "));
      const val = decodeURIComponent((kv.slice(1).join("=") || "").replace(/\+/g, " "));
      out[key] = val;
    }
    return out;
  }
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getHeaderIndexMap(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map((h) => normalize(h));

  const map = {};
  for (let i = 0; i < headers.length; i++) {
    if (headers[i]) map[headers[i]] = i;
  }
  return map;
}

function pickValue(row, headerMap, keys, fallback) {
  for (let i = 0; i < keys.length; i++) {
    const idx = headerMap[normalize(keys[i])];
    if (idx !== undefined) {
      const v = row[idx];
      if (v !== "" && v !== null && v !== undefined) return v;
    }
  }
  return fallback;
}

function getColIndex(headerMap, keys) {
  for (let i = 0; i < keys.length; i++) {
    const idx = headerMap[normalize(keys[i])];
    if (idx !== undefined) return idx;
  }
  return -1;
}

function ensureHeaderColumn(sheet, headerName) {
  const headerMap = getHeaderIndexMap(sheet);
  const idx = headerMap[normalize(headerName)];
  if (idx !== undefined) return idx;
  const newCol = sheet.getLastColumn() + 1;
  sheet.getRange(1, newCol).setValue(headerName);
  return newCol - 1;
}

function setByAliases(row, headerMap, aliases, value) {
  const idx = getColIndex(headerMap, aliases);
  if (idx >= 0) row[idx] = value;
}

/*************************************************
GET API
*************************************************/

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const action = params.action;

  if (action === "listTasks") {
    return jsonResponse(listTasks(params.userEmail, params.userRole));
  }

  if (action === "report") {
    return jsonResponse(productivityReport());
  }

  // Fallback for Apps Script redirect flows where delete can arrive as GET.
  if (action === "deleteTask") {
    return jsonResponse(deleteTask({
      id: params.id,
      userEmail: params.userEmail
    }));
  }

  if (action === "version") {
    return jsonResponse({
      success: true,
      version: "2026-03-09-v2"
    });
  }

  return jsonResponse({
    success: false,
    message: "Unknown action"
  });

}

/*************************************************
POST API
*************************************************/

function doPost(e) {

  try {

    const data = parseRequestData(e);
    const params = (e && e.parameter) ? e.parameter : {};
    const action = data.action || params.action;

    if (action === "createTask") {
      return jsonResponse(createTask(data));
    }

    if (action === "updateTask") {
      return jsonResponse(updateTask(data));
    }

    if (action === "deleteTask") {
      return jsonResponse(deleteTask({
        id: data.id || params.id,
        userEmail: data.userEmail || params.userEmail
      }));
    }

    return jsonResponse({
      success: false,
      message: "Unknown action"
    });

  } catch (err) {

    return jsonResponse({
      success: false,
      message: err.toString()
    });

  }

}

/*************************************************
CREATE TASK
*************************************************/

function createTask(data) {

  const sheet = getSheet();
  ensureHeaderColumn(sheet, "Blocker Owner");
  const headerMap = getHeaderIndexMap(sheet);
  const lastCol = sheet.getLastColumn();
  const task = data.taskData || {};

  const id = Utilities.getUuid();
  const row = new Array(lastCol).fill("");
  setByAliases(row, headerMap, ["id"], id);
  setByAliases(row, headerMap, ["date", "start_date"], task.date || new Date());
  setByAliases(row, headerMap, ["developer email", "developer_id", "assigned_by"], data.userEmail || "");
  setByAliases(row, headerMap, ["developer name", "developer_name"], task.developerName || "");
  setByAliases(row, headerMap, ["planned tasks", "task_title"], task.plannedTasks || "");
  setByAliases(row, headerMap, ["category"], task.category || "Dev");
  setByAliases(row, headerMap, ["priority"], task.priority || "Medium");
  setByAliases(row, headerMap, ["estimated time", "estimated_hours"], task.estimatedTime || 0);
  setByAliases(row, headerMap, ["actual work", "remarks", "actual_hours"], task.actualWork || "");
  setByAliases(row, headerMap, ["completion", "status"], task.completion || 0);
  setByAliases(row, headerMap, ["task level"], task.taskLevel || "Medium");
  setByAliases(row, headerMap, ["blockers"], task.blockers || "");
  setByAliases(row, headerMap, ["blocker owner", "blocker/error owner"], task.blockerOwner || "");
  setByAliases(row, headerMap, ["manager remarks", "review_status"], "");
  setByAliases(row, headerMap, ["created timestamp", "completed_date"], new Date());

  sheet.appendRow(row);

  const rowIndex = sheet.getLastRow();

  return {
    success: true,
    data: {
      id: id,
      row: rowIndex,
      date: task.date,
      developerEmail: data.userEmail,
      developerName: task.developerName,
      plannedTasks: task.plannedTasks,
      category: task.category,
      priority: task.priority,
      estimatedTime: task.estimatedTime,
      actualWork: task.actualWork,
      completion: task.completion,
      taskLevel: task.taskLevel,
      blockers: task.blockers,
      blockerOwner: task.blockerOwner || "",
      managerRemarks: "",
      createdTimestamp: new Date()
    }
  };

}

/*************************************************
LIST TASKS
*************************************************/

function listTasks(userEmail, userRole) {

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  const headerMap = getHeaderIndexMap(sheet);
  data.shift(); // remove header row

  const normalizedUserEmail = normalize(userEmail);
  const isAdmin =
    normalize(userRole) === "admin" ||
    normalizedUserEmail === normalize(ADMIN_EMAIL);

  const tasks = data
    .filter((row) => {
      const ownerEmail = normalize(
        pickValue(row, headerMap, ["developer email", "developer_id", "assigned_by"], "")
      );
      return isAdmin || !normalizedUserEmail || ownerEmail === normalizedUserEmail;
    })
    .map((row, index) => ({

      id: String(pickValue(row, headerMap, ["id"], "")),
      row: index + 2,
      date: pickValue(row, headerMap, ["date", "start_date"], ""),
      developerEmail: String(
        pickValue(row, headerMap, ["developer email", "developer_id", "assigned_by"], "")
      ),
      developerName: String(pickValue(row, headerMap, ["developer name", "developer_name"], "")),
      plannedTasks: String(pickValue(row, headerMap, ["planned tasks", "task_title"], "")),
      category: String(pickValue(row, headerMap, ["category", "task_description"], "Dev")),
      priority: String(pickValue(row, headerMap, ["priority"], "Medium")),
      estimatedTime: toNumber(pickValue(row, headerMap, ["estimated time", "estimated_hours"], 0), 0),
      actualWork: String(pickValue(row, headerMap, ["actual work", "remarks", "actual_hours"], "")),
      completion: toNumber(pickValue(row, headerMap, ["completion", "status"], 0), 0),
      taskLevel: String(pickValue(row, headerMap, ["task level", "assigned_by"], "Medium")),
      blockers: String(pickValue(row, headerMap, ["blockers"], "")),
      blockerOwner: String(pickValue(row, headerMap, ["blocker owner", "blocker/error owner"], "")),
      managerRemarks: String(pickValue(row, headerMap, ["manager remarks", "review_status"], "")),
      createdTimestamp: pickValue(row, headerMap, ["created timestamp", "completed_date"], "")

    }));

  return {
    success: true,
    data: tasks
  };

}

/*************************************************
UPDATE TASK
*************************************************/

function updateTask(data) {

  const sheet = getSheet();
  ensureHeaderColumn(sheet, "Blocker Owner");
  const headerMap = getHeaderIndexMap(sheet);
  const task = data.taskData || {};
  const id = String(data.id || "");

  const rows = sheet.getDataRange().getValues();
  const idIdx = getColIndex(headerMap, ["id"]);
  if (idIdx < 0) {
    return {
      success: false,
      message: "ID column not found"
    };
  }

  const plannedIdx = getColIndex(headerMap, ["planned tasks", "task_title"]);
  const categoryIdx = getColIndex(headerMap, ["category"]);
  const priorityIdx = getColIndex(headerMap, ["priority"]);
  const estimatedIdx = getColIndex(headerMap, ["estimated time", "estimated_hours"]);
  const actualIdx = getColIndex(headerMap, ["actual work", "remarks", "actual_hours"]);
  const completionIdx = getColIndex(headerMap, ["completion", "status"]);
  const taskLevelIdx = getColIndex(headerMap, ["task level"]);
  const blockersIdx = getColIndex(headerMap, ["blockers"]);
  const blockerOwnerIdx = getColIndex(headerMap, ["blocker owner", "blocker/error owner"]);
  const managerIdx = getColIndex(headerMap, ["manager remarks", "review_status"]);

  for (let i = 1; i < rows.length; i++) {

    if (String(rows[i][idIdx] || "") === id) {

      const row = i + 1;
      if (plannedIdx >= 0) sheet.getRange(row, plannedIdx + 1).setValue(task.plannedTasks);
      if (categoryIdx >= 0) sheet.getRange(row, categoryIdx + 1).setValue(task.category);
      if (priorityIdx >= 0) sheet.getRange(row, priorityIdx + 1).setValue(task.priority);
      if (estimatedIdx >= 0) sheet.getRange(row, estimatedIdx + 1).setValue(task.estimatedTime);
      if (actualIdx >= 0) sheet.getRange(row, actualIdx + 1).setValue(task.actualWork);
      if (completionIdx >= 0) sheet.getRange(row, completionIdx + 1).setValue(task.completion);
      if (taskLevelIdx >= 0) sheet.getRange(row, taskLevelIdx + 1).setValue(task.taskLevel);
      if (blockersIdx >= 0) sheet.getRange(row, blockersIdx + 1).setValue(task.blockers);
      if (blockerOwnerIdx >= 0) sheet.getRange(row, blockerOwnerIdx + 1).setValue(task.blockerOwner);
      if (managerIdx >= 0) sheet.getRange(row, managerIdx + 1).setValue(task.managerRemarks);

      return {
        success: true,
        data: {
          id: id
        }
      };

    }

  }

  return {
    success: false,
    message: "Task not found"
  };

}

/*************************************************
DELETE TASK
*************************************************/

function deleteTask(data) {
  const sheet = getSheet();
  const headerMap = getHeaderIndexMap(sheet);
  const id = String(data.id || "");
  const userEmail = normalize(data.userEmail);

  if (!id) {
    return {
      success: false,
      message: "Task id is required"
    };
  }

  const rows = sheet.getDataRange().getValues();
  const idIdx = getColIndex(headerMap, ["id"]);
  const ownerIdx = getColIndex(headerMap, ["developer email", "developer_id", "assigned_by"]);
  const dateIdx = getColIndex(headerMap, ["date", "start_date"]);
  if (idIdx < 0 || ownerIdx < 0 || dateIdx < 0) {
    return {
      success: false,
      message: "Required columns are missing"
    };
  }
  const todayKey = formatDateKey(new Date());
  const isAdmin = userEmail === normalize(ADMIN_EMAIL);

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]) !== id) continue;

    const ownerEmail = normalize(rows[i][ownerIdx]);
    const taskDateKey = formatDateKey(rows[i][dateIdx]);

    if (!isAdmin) {
      if (!userEmail || ownerEmail !== userEmail) {
        return {
          success: false,
          message: "You can delete only your own tasks"
        };
      }
      if (taskDateKey !== todayKey) {
        return {
          success: false,
          message: "You can delete only today's tasks"
        };
      }
    }

    sheet.deleteRow(i + 1);
    return {
      success: true,
      message: "Task deleted"
    };
  }

  return {
    success: false,
    message: "Task not found"
  };
}

/*************************************************
PRODUCTIVITY REPORT
*************************************************/

function productivityReport() {
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();

  if (rows.length <= 1) {
    return { success: true, data: {} };
  }

  const report = {};

  for (let i = 1; i < rows.length; i++) {
    const developerName = String(rows[i][3] || "Unknown");

    if (!report[developerName]) {
      report[developerName] = {
        totalTasks: 0,
        completedTasks: 0
      };
    }

    report[developerName].totalTasks++;
    if (toNumber(rows[i][9], 0) >= 100) {
      report[developerName].completedTasks++;
    }
  }

  return {
    success: true,
    data: report
  };
}
