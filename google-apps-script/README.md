## Current Deployment

- Updated: Mar 7, 2026, 7:41 PM
- Version: 2
- Deployment ID: `AKfycbwnnslglzr0I9xYVWPM3RVi8D_u3dYEZiCdvRnFJkQ26KnSdaBwdhsUjqpusyJ_OecUkg`
- Web app URL: `https://script.google.com/macros/s/AKfycbwnnslglzr0I9xYVWPM3RVi8D_u3dYEZiCdvRnFJkQ26KnSdaBwdhsUjqpusyJ_OecUkg/exec`

A sophisticated task management system using **Google Sheets as the only database** with cell-level locking and date-based access control.

## 🎯 Key Features

### Database
- ✅ **Google Sheets only** - No external database (Firebase, MySQL, etc.)
- ✅ Each row = one developer's daily task entry
- ✅ Hidden `_LOCKS` sheet tracks cell-level permissions

### Cell-Level Locking System
- 🔒 A developer can edit a cell only once
- 🔒 Once edited, it's locked but the same user can continue editing **on the same day**
- 🔒 Other users **cannot edit** that locked cell
- 🔒 Next day: all previously edited cells become **read-only**
- 👑 Admin can edit **anything, anytime**

### Access Control
- **Admin** (hard-coded Gmail): Full access to all records
- **Developers**: Can only edit their own tasks on the same day

### Data Fields
- Date, Developer Email, Developer Name
- Morning Planned Tasks, Task Category, Priority
- Estimated Time (Hours), Actual Work Done (EOD)
- Completion Status (%), Task Level
- Blockers / Issues, Manager Remarks (Admin only)

---

## 🚀 Setup Instructions

### Step 1: Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: **"Developer Task Tracker"**

### Step 2: Open Apps Script Editor

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. This opens the Apps Script editor

### Step 3: Add the Backend Code

1. Delete any existing code in `Code.gs`
2. Copy the entire content from `/google-apps-script/Code.gs`
3. Paste it into the Apps Script editor
4. **Important**: Change line 9:
   ```javascript
   const ADMIN_EMAIL = "youradmin@gmail.com";
   ```
   Replace with your actual admin email address

### Step 4: Add the Frontend HTML

1. In Apps Script editor, click the **+** button next to "Files"
2. Select **HTML**
3. Name it: `Index`
4. Delete any existing content
5. Copy the entire content from `/google-apps-script/Index.html`
6. Paste it into the HTML file

### Step 5: Save and Deploy

1. Click the **Save** icon (💾) or press `Ctrl+S` / `Cmd+S`
2. Click **Deploy** → **New deployment**
3. Click the gear icon ⚙️ next to "Select type"
4. Choose **Web app**
5. Fill in the deployment settings:
   - **Description**: "Task Tracker v1"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone with Google account" (or "Anyone" for public)
6. Click **Deploy**
7. Copy the **Web app URL** (you'll use this to access the app)

### Step 6: Authorize the Script

1. When you first deploy, Google will ask for permissions
2. Click **Authorize access**
3. Select your Google account
4. Click **Advanced** → **Go to [Project Name] (unsafe)**
5. Click **Allow**

### Step 7: Initialize the Sheets

**Option A - Using Custom Menu:**
1. Go back to your Google Sheet
2. Refresh the page
3. You'll see a new menu: **Task Tracker**
4. Click **Task Tracker** → **Initialize Sheets**

**Option B - Run from Apps Script:**
1. In Apps Script editor
2. Select function: `initializeSheets`
3. Click **Run** (▶️)

This creates:
- **Tasks** sheet with proper headers
- **_LOCKS** sheet (hidden) to track cell permissions

### Step 8: Access the Web App

1. Use the Web app URL from Step 5
2. Or click **Task Tracker** → **Open Dashboard** in your Google Sheet

---

## 📖 How to Use

### For Developers

1. **Sign In**: Open the web app - it automatically detects your Google email
2. **Add Task**: Click "Add Daily Task" button
   - Date is auto-set to TODAY (cannot be changed)
   - Fill in all required fields
   - Click "Submit Task"
3. **Edit Task**: Click "Edit" button on any task
   - You can only edit tasks created TODAY
   - Once a cell is edited, it's locked to you
   - Tomorrow, all your edits become read-only
4. **View Tasks**: See all your submitted tasks in the table

### For Admin

1. **Sign In**: Open the web app with the admin email
2. **View All Tasks**: See tasks from all developers
3. **Edit Any Task**: Click "Edit" on any task - no date restrictions
4. **Add Manager Remarks**: Special admin-only field in edit form
5. **Export CSV**: Click "Export CSV" button to download all data
6. **Unlock Cells**: Use custom menu options in Google Sheet

---

## 🔐 Locking Rules (Technical Details)

### How Cell Locking Works

1. **First Edit**: When a developer edits a cell, an entry is created in `_LOCKS`:
   ```
   CellKey: Tasks_5_3
   UserEmail: developer@gmail.com
   LockDate: 2024-03-04
   Timestamp: 2024-03-04 14:30:00
   ```

2. **Same Day Edit**: If the same developer tries to edit again on the same day:
   - ✅ **Allowed** - Lock is updated
   - Logic: `lockDate === today AND lockOwner === currentUser`

3. **Same Day, Different User**:
   - ❌ **Blocked** - "This cell is locked by another user"
   - Logic: `lockDate === today AND lockOwner !== currentUser`

4. **Next Day Edit**:
   - ❌ **Blocked** - "This cell was edited on a previous day"
   - Logic: `lockDate !== today`

5. **Admin Override**:
   - ✅ **Always Allowed**
   - Logic: `userEmail === ADMIN_EMAIL`

### Lock Storage Format

The `_LOCKS` sheet stores:
```
| CellKey        | UserEmail               | LockDate   | Timestamp           |
|----------------|-------------------------|------------|---------------------|
| Tasks_2_4      | dev1@gmail.com          | 2024-03-04 | 2024-03-04 09:15:00 |
| Tasks_2_5      | dev1@gmail.com          | 2024-03-04 | 2024-03-04 09:16:00 |
| Tasks_3_4      | dev2@gmail.com          | 2024-03-04 | 2024-03-04 10:30:00 |
```

---

## 🛠️ Admin Tools

### Custom Menu Options

In your Google Sheet, the **Task Tracker** menu provides:

1. **Open Dashboard**: Opens the web interface
2. **Initialize Sheets**: Creates/resets the Tasks and _LOCKS sheets
3. **Export CSV (Admin Only)**: Exports all task data
4. **View Locks**: Shows the hidden _LOCKS sheet

### Unlocking Cells (Admin Only)

If you need to unlock a cell manually:

1. Go to Google Sheet
2. Click **Task Tracker** → **View Locks**
3. Find the row with the cell you want to unlock
4. Delete that row
5. The cell is now unlocked

Or use Apps Script functions:
```javascript
unlockCell(row, column)          // Unlock specific cell
unlockAllCellsForRow(row)        // Unlock entire row
```

---

## 📊 Data Schema

### Tasks Sheet Columns

| Column | Type   | Description                |
|--------|--------|----------------------------|
| A      | Date   | Task date (YYYY-MM-DD)     |
| B      | Email  | Developer's email          |
| C      | Text   | Developer's name           |
| D      | Text   | Morning planned tasks      |
| E      | Select | Category (Dev/Research/Test/Support) |
| F      | Select | Priority (High/Medium/Low) |
| G      | Number | Estimated time (hours)     |
| H      | Text   | Actual work done (EOD)     |
| I      | Number | Completion status (0-100%) |
| J      | Select | Task level (Easy/Medium/Hard) |
| K      | Text   | Blockers / Issues          |
| L      | Text   | Manager remarks (Admin)    |

### _LOCKS Sheet Columns

| Column | Type      | Description              |
|--------|-----------|--------------------------|
| A      | Text      | Cell key (Sheet_Row_Col) |
| B      | Email     | Lock owner email         |
| C      | Date      | Lock date (YYYY-MM-DD)   |
| D      | Timestamp | Lock timestamp           |

---

## 🔧 Customization

### Change Admin Email

Edit line 9 in `Code.gs`:
```javascript
const ADMIN_EMAIL = "your-new-admin@gmail.com";
```

### Add More Dropdown Options

Edit the HTML file, find the `<select>` elements:
```html
<!-- Example: Add new category -->
<select id="category" class="form-select" required>
  <option value="Dev">Dev</option>
  <option value="Research">Research</option>
  <option value="Test">Test</option>
  <option value="Support">Support</option>
  <option value="Meeting">Meeting</option> <!-- NEW -->
</select>
```

### Modify Columns

1. Update `COLUMNS` object in `Code.gs`
2. Update table headers in `Index.html`
3. Update form fields in `Index.html`
4. Update data mapping in JavaScript functions

---

## 🐛 Troubleshooting

### "Script function not found" Error
- Make sure you saved the Apps Script file
- Refresh the Google Sheet
- Re-run the initialization

### "Authorization required" Error
- You need to authorize the script
- Follow Step 6 in Setup Instructions

### Tasks not loading
- Check the browser console for errors (F12)
- Make sure the `Tasks` sheet exists
- Run `initializeSheets()` from Apps Script

### Cells not locking properly
- Check if `_LOCKS` sheet exists
- View the _LOCKS sheet to debug
- Make sure dates are in YYYY-MM-DD format

### CSV Export not working
- Only admin can export CSV
- Check that you're logged in with admin email
- Check browser's download settings

---

## 📝 API Reference

### Google Apps Script Functions

#### User Functions
```javascript
getCurrentUser()
// Returns: { email, name, isAdmin }
```

#### Task Functions
```javascript
getAllTasks(userEmail)
// Returns: Array of all tasks with permissions

getMyTasks()
// Returns: Array of tasks for current user

createTask(taskData)
// Creates new task, returns: { success, message, row }

updateTask(row, taskData)
// Updates task, returns: { success, message, results }
```

#### Lock Functions
```javascript
canEditCell(row, col, userEmail, isAdmin)
// Returns: { canEdit, reason }

isRecordLocked(record, userEmail)
// Returns: boolean

setLock(cellKey, userEmail)
// Creates or updates lock

getLockInfo(cellKey)
// Returns: { cellKey, userEmail, lockDate, timestamp } or null
```

#### Admin Functions
```javascript
unlockCell(row, column)
// Removes lock, returns: { success, message }

unlockAllCellsForRow(row)
// Removes all locks for a row, returns: { success, message }

exportToCSV()
// Returns: { success, message, csv }
```

---

## 🔒 Security Notes

- **No external database**: All data stays in your Google Sheet
- **Google OAuth**: Authentication handled by Google
- **Apps Script permissions**: Script runs as you (owner)
- **Access control**: Set in deployment settings
- **Admin email**: Hard-coded, cannot be changed via UI
- **Cell-level security**: Enforced by `_LOCKS` sheet

---

## 📦 File Structure

```
/google-apps-script/
  ├── Code.gs          # Backend logic (Google Apps Script)
  └── Index.html       # Frontend UI (HTML + CSS + JavaScript)
```

---

## 🎨 UI Features

- ✨ Modern gradient design
- 📱 Responsive layout
- 🎯 Real-time stats dashboard
- 🔔 Alert notifications
- 🔒 Visual lock indicators
- 📊 Sortable table view
- 🎨 Priority color coding
- 🌓 Clean modal dialogs

---

## 📄 License

This project is open source. Feel free to modify and use as needed.

---

## 💡 Tips

1. **Backup regularly**: Export CSV copies of your data
2. **Monitor locks**: Check `_LOCKS` sheet periodically
3. **Clear old locks**: Admin can manually delete old lock entries
4. **Test first**: Try with test accounts before production
5. **Version control**: Use Apps Script's version management

---

## 🤝 Support

For issues or questions:
1. Check the Troubleshooting section
2. View the _LOCKS sheet to debug locking issues
3. Check Apps Script execution logs
4. Review browser console for frontend errors

---

**Built with Google Apps Script, Google Sheets, HTML, CSS, and JavaScript**

No external dependencies • No backend server • No database setup required

