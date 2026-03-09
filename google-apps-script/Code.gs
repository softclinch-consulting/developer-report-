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

/*************************************************
GET API
*************************************************/

function doGet(e) {

  const action = e.parameter.action;

  if (action === "listTasks") {
    return jsonResponse(listTasks(e.parameter.userEmail, e.parameter.userRole));
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
    const action = data.action;

    if (action === "createTask") {
      return jsonResponse(createTask(data));
    }

    if (action === "updateTask") {
      return jsonResponse(updateTask(data));
    }

    if (action === "deleteTask") {
      return jsonResponse(deleteTask(data));
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
  const task = data.taskData;

  const id = Utilities.getUuid();

  const row = [

    id,
    task.date || new Date(),
    data.userEmail,
    task.developerName,
    task.plannedTasks,
    task.category,
    task.priority,
    task.estimatedTime,
    task.actualWork,
    task.completion,
    task.taskLevel,
    task.blockers,
    "",
    new Date()

  ];

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
  const task = data.taskData;
  const id = data.id;

  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {

    if (rows[i][0] === id) {

      const row = i + 1;

      sheet.getRange(row, 5).setValue(task.plannedTasks);
      sheet.getRange(row, 6).setValue(task.category);
      sheet.getRange(row, 7).setValue(task.priority);
      sheet.getRange(row, 8).setValue(task.estimatedTime);
      sheet.getRange(row, 9).setValue(task.actualWork);
      sheet.getRange(row, 10).setValue(task.completion);
      sheet.getRange(row, 11).setValue(task.taskLevel);
      sheet.getRange(row, 12).setValue(task.blockers);
      sheet.getRange(row, 13).setValue(task.managerRemarks);

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
  const id = String(data.id || "");
  const userEmail = normalize(data.userEmail);

  if (!id) {
    return {
      success: false,
      message: "Task id is required"
    };
  }

  const rows = sheet.getDataRange().getValues();
  const todayKey = formatDateKey(new Date());
  const isAdmin = userEmail === normalize(ADMIN_EMAIL);

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) !== id) continue;

    const ownerEmail = normalize(rows[i][2]);
    const taskDateKey = formatDateKey(rows[i][1]);

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
