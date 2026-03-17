You are a senior UX designer and full-stack developer.

GOAL:
Build a DAILY DEVELOPER TASK TRACKER using HTML, CSS, and JavaScript
with STRICT calendar-based locking and a SINGLE ADMIN Gmail.

--------------------------------------------------
ADMIN RULE (NON-NEGOTIABLE)
--------------------------------------------------
- ONLY the Gmail explicitly defined below is ADMIN
- No other email can ever act as admin
- Admin email (hard-coded):

    ADMIN_EMAIL = "youradmin@gmail.com"

--------------------------------------------------
AUTHENTICATION
--------------------------------------------------
- Use Gmail email input as login identity
- Determine role strictly by email match:
    if (loggedInEmail === ADMIN_EMAIL) → ADMIN
    else → DEVELOPER

--------------------------------------------------
DEVELOPER RULES
--------------------------------------------------
- Can add task ONLY for TODAY
- Can edit OWN task ONLY on SAME DAY
- From NEXT DAY onwards:
    ❌ Edit disabled
    ❌ Fields locked
    ❌ Show message:
       "Editing closed. Contact admin."
- Cannot edit other developers’ tasks
- Cannot edit past records
- Cannot change task date
- Cannot delete records

--------------------------------------------------
ADMIN RULES
--------------------------------------------------
- Can view ALL records
- Can edit ANY record on ANY date
- Can edit Manager Remarks
- Can unlock / modify any task
- Can download CSV

--------------------------------------------------
FORM FIELDS (EXACT)
--------------------------------------------------
Date (auto-set to TODAY, disabled)
Developer Name
Morning Planned Tasks
Task Category (Dev/Research/Test/Support)
Priority (High/Medium/Low)
Estimated Time (Hours)
Actual Work Done (EOD)
Completion Status (%)
Task Level (Easy/Medium/Hard)
Blockers / Issues
Manager Remarks (ADMIN ONLY)

SYSTEM FIELDS (HIDDEN)
--------------------------------------------------
Record ID
Assigned Email
Created Date (YYYY-MM-DD)
Created Timestamp

--------------------------------------------------
BUSINESS LOGIC (CRITICAL)
--------------------------------------------------
ON CREATE:
- Save assignedEmail = loggedInEmail
- Save createdDate = today

ON EDIT:
- If loggedInEmail === ADMIN_EMAIL → ALLOW
- Else if:
    assignedEmail === loggedInEmail
    AND createdDate === today
  → ALLOW
- Else → BLOCK

--------------------------------------------------
UI / UX
--------------------------------------------------
- Locked rows appear grey
- Edit buttons hidden for non-admin on past records
- Tooltip: "Locked after day end"
- Admin dashboard clearly marked

--------------------------------------------------
CSV EXPORT (ADMIN ONLY)
--------------------------------------------------
Include all fields + Assigned Email + Created Timestamp

--------------------------------------------------
IMPORTANT
--------------------------------------------------
- Do NOT provide any UI to change admin
- Do NOT allow role switching
- Admin email must be hard-coded
- Calendar date comparison must use YYYY-MM-DD