You are a senior UX designer and full-stack developer.

GOAL:
Design and build a DAILY DEVELOPER TASK TRACKER web app.
The app must collect daily task data from multiple developers safely,
with Gmail-based ownership, admin control, and CSV download.

IMPORTANT CONSTRAINTS:
- This is NOT a spreadsheet
- Data must behave like database records
- No user should overwrite another user’s data
- No Google Sheets, Airtable, or external services

--------------------------------------------------
AUTHENTICATION & ROLES
--------------------------------------------------
- Use Gmail (email input simulation) as login identity
- Two roles:
  1. ADMIN
     - Can view all records
     - Can edit all records
     - Can add manager remarks
     - Can download CSV
  2. DEVELOPER
     - Can create new records
     - Can edit ONLY records assigned to their Gmail
     - Cannot edit other developers’ records
     - Cannot delete records

--------------------------------------------------
FORM FIELDS (MUST MATCH EXACTLY)
--------------------------------------------------
1. Date (date picker, required)
2. Developer Name (auto-filled or text)
3. Morning Planned Tasks (textarea, required)
4. Task Category (dropdown):
   - Dev
   - Research
   - Test
   - Support
5. Priority (dropdown):
   - High
   - Medium
   - Low
6. Estimated Time (Hours) (number)
7. Actual Work Done (EOD) (textarea)
8. Completion Status (%) (number 0–100)
9. Task Level (dropdown):
   - Easy
   - Medium
   - Hard
10. Blockers / Issues (textarea)
11. Manager Remarks (textarea – ADMIN ONLY)

SYSTEM FIELDS (HIDDEN):
- Record ID (auto-generated)
- Assigned Email (logged-in Gmail)
- Created Timestamp

--------------------------------------------------
BUSINESS RULES (CRITICAL)
--------------------------------------------------
- Each form submission = NEW RECORD (append only)
- Once saved, record belongs to Assigned Email
- Only the same Gmail can edit that record
- Other developers must see the record as READ-ONLY or hidden
- Admin can edit Manager Remarks anytime
- No record overwrite allowed
- Multiple developers can submit at the same time

--------------------------------------------------
UI / UX (FIGMA DESIGN)
--------------------------------------------------
- Clean professional dashboard
- Responsive (desktop + mobile)
- Pages:
  1. Login screen (email input + role selection)
  2. Developer Dashboard:
     - "Add Daily Task" form
     - "My Tasks" table (only own records)
  3. Admin Dashboard:
     - All developers’ records table
     - CSV Download button
     - Editable Manager Remarks column
- Visual indicators:
  - Owner email badge
  - Locked rows for non-owners
  - Disabled edit buttons if not owner

--------------------------------------------------
FRONTEND (HTML + CSS)
--------------------------------------------------
- index.html
- Semantic HTML
- Modern, minimal CSS
- Table layout for records
- Validation messages
- Disabled submit button during save

--------------------------------------------------
BACKEND LOGIC (PURE JAVASCRIPT)
--------------------------------------------------
- Use JavaScript array / JSON as mock database
- Store records in memory or localStorage
- Permission checks before edit:
    loggedInEmail === assignedEmail OR role === ADMIN
- Append new records only (never overwrite)
- Update allowed only for owner or admin
- Generate CSV dynamically with headers:

CSV HEADERS (EXACT):
Date,
Developer Name,
Morning Planned Tasks,
Task Category,
Priority,
Estimated Time (Hours),
Actual Work Done (EOD),
Completion Status (%),
Task Level,
Blockers / Issues,
Manager Remarks,
Assigned Email,
Created Timestamp

--------------------------------------------------
CSV EXPORT
--------------------------------------------------
- Admin-only button
- One-click CSV download
- Proper escaping for commas and line breaks

--------------------------------------------------
OUTPUT REQUIRED
--------------------------------------------------
1. Figma UI design (auto-layout, components)
2. index.html
3. style.css
4. script.js
5. CSV export function
6. Clear comments in code

DESIGN STYLE:
- Simple
- Enterprise-friendly
- Clear typography
- No clutter

IMPORTANT:
This system must enforce ownership at logic level,
not just UI hiding.