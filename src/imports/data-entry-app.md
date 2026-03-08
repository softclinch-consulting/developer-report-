You are a senior UX designer and full-stack developer.

GOAL:
Create a web-based DATA ENTRY & MANAGEMENT APP with Gmail-based user assignment.
Users can edit ONLY records assigned to their Gmail.
Admin can view and export all data as CSV.

AUTHENTICATION:
- Use Gmail (email) as user identity (simulate login using email input or session storage).
- No Google Sheets or external services.

USER ROLES:
1. Admin
   - Can view all records
   - Can edit all records
   - Can download CSV
2. Developer (User)
   - Can create new records
   - Can edit ONLY records assigned to their Gmail
   - Cannot view or edit other users’ records
   - Cannot delete records

DATA RULES (CRITICAL):
- Each record must contain:
  - Record ID (auto)
  - Assigned Email (gmail)
  - Name
  - Task / Data
  - Created Date
- On creation, record is assigned to the logged-in user’s Gmail.
- Record ownership is immutable unless admin changes it.
- Editing permission check must validate:
    loggedInEmail === record.assignedEmail

UI (FIGMA DESIGN):
- Clean admin-style dashboard
- Login screen (email input)
- Developer view:
  - "My Records" table (shows only assigned records)
  - Edit button only for own records
- Admin view:
  - All records table
  - CSV download button
  - Assign / reassign developer email

FRONTEND (HTML + CSS):
- Responsive layout
- Table with locked rows
- Disabled edit buttons for unauthorized users
- Clear ownership indicators (email badge)

BACKEND LOGIC (JAVASCRIPT):
- Store records in local JSON / array
- Enforce permission checks in all edit actions
- Prevent overwrite of unassigned records
- Allow multiple users to work sequentially
- Generate CSV including:
  RecordID, AssignedEmail, Name, Task, Date

SECURITY LOGIC:
- No edit UI rendered if user is not owner
- Double-check permissions before saving edits
- Admin override flag

OUTPUT:
- Figma UI design
- index.html
- style.css
- script.js
- CSV export logic

DESIGN STYLE:
- Minimal
- Professional
- Clear role separation
- No clutter

IMPORTANT:
This system must behave like a database, not a spreadsheet.
Editing must be ownership-based, not time-based.