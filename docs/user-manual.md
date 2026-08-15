# StudentSafe — Detailed User Manual

**System:** StudentSafe — Safeguarding System for the Example School District
**Version:** Current (June 2026)

---

## Table of Contents

1. [Logging In](#1-logging-in)
2. [App Admin (Level 0)](#2-app-admin-level-0)
3. [Guidance Counselor (Level 1)](#3-guidance-counselor-level-1)
4. [School Coordinator / CPO (Level 2)](#4-school-coordinator--cpo-level-2)
5. [District Admin (Level 3)](#5-district-admin-level-3)
6. [Teacher / Reporter (Level 4)](#6-teacher--reporter-level-4)
7. [Who Can View What — Full Reference](#7-who-can-view-what--full-reference)
8. [Severity Levels — Definitions and Examples](#8-severity-levels--definitions-and-examples)

---

## 1. Logging In

Open the application in a browser. The **StudentSafe** splash screen appears, followed by a sign-in panel sliding in from the right.

> **[SCREENSHOT: Full login page — title on the left, sign-in panel on the right]**

### Sign-in Options

**Email and Password**
1. Enter your assigned email address.
2. Enter your password.
3. Click **Sign In**.

**Google Sign-In**
1. Click the Google button below the divider.
2. Select your school Google account.
3. The system authenticates automatically.

If your credentials are wrong, an error banner appears at the top of the form. The email and password fields clear so you can try again. If you have forgotten your password, contact your App Admin to reset it — the "Forgot password?" link is not yet active.

### Where You Land After Login

The system redirects you automatically based on your role. You do not choose a destination:

| Access Level | Role | Lands On |
|---|---|---|
| 0 | App Admin | `/admin` — Admin Panel |
| 1 | Guidance Counselor | `/dashboard` — Personal Dashboard |
| 2 | School Coordinator | `/dashCPO` — Analytics Dashboard |
| 3 | District Admin | `/dashCPO` — Analytics Dashboard |
| 4 | Teacher / Reporter | `/file-report` — File Report Form |

---

## 2. App Admin (Level 0)

The App Admin is responsible for system configuration and user account management. This role has **no access to any case records, student safeguarding data, or school dashboards** — it is a purely administrative function.

After login the App Admin is taken directly to `/admin`.

> **[SCREENSHOT: Admin panel — top of page with three tab buttons: Users, Students, Configuration]**

---

### 2.1 Users Tab

The Users tab is the primary tool for managing who has access to the system.

> **[SCREENSHOT: Users tab — sortable table with columns: Name, Email, School, Role, Access Level. Edit icons on each row]**

#### Viewing Users

The table shows every registered account. Click any column header to sort ascending or descending. An arrow indicator shows the current sort column and direction.

**Columns:**
- **Name** — the user's display name
- **Email** — login email
- **School** — which school the account belongs to
- **Role** — the label shown in the UI (e.g., "Guidance Counselor", "Teacher")
- **Access Level** — the numeric level (Level 1–4) that controls what the user can see and do

#### Adding a Single User

1. Scroll to the **Add User** form below the table (or click the Add button if present).
2. Fill in: Name, Email, School, Role, and Access Level.
3. Click **Submit**.

> **[SCREENSHOT: Add User form with all fields visible]**

**Access Level options available in the UI:**

| Option | Who it creates |
|---|---|
| Level 1 | Guidance Counselor — sees own building only |
| Level 2 | School Coordinator / CPO — sees entire school |
| Level 3 | District Admin — sees all schools |
| Level 4 | Teacher / Reporter — can only submit reports |

> **Note:** Level 0 (App Admin) cannot be set from the UI. It is assigned directly in the database to prevent accidental privilege escalation.

#### Editing a User

Click the edit icon on any row. The form pre-fills with that user's current values. Change the fields you need and save. You can update any field including the access level, which takes effect on the user's next login.

#### Importing Users via CSV

For bulk onboarding at the start of a school year:

1. Prepare a CSV file with the following columns (exact header names required):

   ```
   name, email, school, role, access_level
   ```
   Optional column: `building`

2. Upload the file using the CSV import section.
3. The system previews the rows before importing. Review the table — it shows all columns including Access Level — and confirm.

> **[SCREENSHOT: CSV preview table showing parsed rows before import]**

Rows with missing required columns are flagged with an error and skipped. Valid rows are imported.

---

### 2.2 Students Tab

The Students tab manages the student roster, which is synced from **Alma** (the school's student information system). The case filing system searches this roster when a counselor or teacher looks up a student.

> **[SCREENSHOT: Students tab showing the Sync button, current sync status, and paginated student list]**

#### Viewing Synced Students

A paginated list shows all students currently in the system, organized by building. The data comes directly from the last successful Alma sync.

#### Triggering a Sync

Press the **Sync** button to pull fresh student data from Alma. The system:
1. Fetches all students from all configured Alma app IDs.
2. Writes everything to the database in a single transaction.
3. Students no longer in Alma are **deactivated** (not deleted) — their historical case data is preserved.

Only one sync can run at a time. If a sync is already running, the button is disabled.

After the sync completes, a success or error message appears.

> **[SCREENSHOT: Sync in progress — button disabled, progress indicator visible]**

#### Viewing Sync Logs

The last 10 sync attempts are listed below the sync controls. Each log entry shows:
- Timestamp of the attempt
- Status: success or failure
- Error message (if failed)
- Number of students added, updated, or deactivated

> **[SCREENSHOT: Sync logs table with timestamp, status, and record count columns]**

---

### 2.3 Configuration Tab

The Configuration tab lets you manage the dropdown options that appear across the case filing form — categories, subcategories (specifications), and other system-wide lists.

> **[SCREENSHOT: Configuration tab showing editable category list]**

Changes here affect what every user sees in the Category and Specification dropdowns when filing a report. Add, rename, or deactivate options as the school's safeguarding categories evolve.

---

## 3. Guidance Counselor (Level 1)

Guidance Counselors are the primary users of StudentSafe. They file, manage, and monitor child protection cases for students in their assigned building. They **cannot see data from other buildings**.

After login, the counselor is taken to `/dashboard`.

---

### 3.1 The Sidebar

The sidebar is always visible on the left side of the screen. It contains the navigation, a search bar, and the user profile card at the bottom.

> **[SCREENSHOT: Full sidebar — logo at top, search bar, nav items, user info card at bottom]**

**What Guidance Counselors see in the sidebar:**

| Item | Purpose |
|---|---|
| Search bar | Live search across cases and students in the building |
| Dashboard | Returns to the main dashboard |
| **Case Management** | — |
| File Report | Opens the case filing form |
| Report List | List of all cases in the building |
| Student History | Browse all students in the building |
| **System** | — |
| Notifications | Stale-case reminders and system alerts |
| Settings | Personal account settings |

The user info card at the bottom shows your name and role. Click the logout icon on the right to sign out.

---

### 3.2 Dashboard

> **[SCREENSHOT: Dashboard — stat cards panel on the left, notification preview panel on the right]**

The dashboard is split into two sections side by side:

**Stat Cards (left panel)**

Shows summary counts for the **current month** in your building:
- Total cases reported
- Cases by status (In Progress, On Hold, Resolved)
- Other key metrics

These cards give a quick read on workload without opening the full Report List.

**Notification Preview (right panel)**

Shows the 5 most recent notifications. Notifications are generated automatically by the system for cases that have stayed in the same status for too long (stale-case reminders).

- Click any notification to go to the Notifications page with that notification highlighted.
- Click **Expand** to go to the full Notifications page.

---

### 3.3 Filing a Case — Step-by-Step Guide

The case filing form is at `/file-report`. Navigate there via **File Report** in the sidebar.

> **[SCREENSHOT: Top of the File Report form — Case Type radio buttons on the left, Status dropdown on the right, Share With field below]**

---

#### Step 1: Select Case Type

At the very top of the form, select the **Case Type** using the radio buttons. This determines which categories appear later in the Report Details tab.

Available case types are configured by your App Admin and typically include options such as Child Protection Concern and Counselling Concern.

> You **must** select a Case Type before you can select a Category on the next tab.

---

#### Step 2: Set Initial Status

Next to the Case Type, set the **Status** from the dropdown. The default is **In Progress**.

| Status | When to use |
|---|---|
| **In Progress** | The case is active and being worked on. This is the correct starting status for most new reports. |
| **On Hold** | The case is paused — for example, waiting for information from a parent or external agency. |
| **Resolved** | The concern has been addressed and no further action is required. You can also set this after submission. |

---

#### Step 3: Share With Other Counselors

Below the Case Type and Status is the **Share With** field.

> **[SCREENSHOT: Share With multiselect field — showing a list of available counselors]**

This controls which other Guidance Counselors can see this case. By default, a newly filed case is only visible to you (the person filing it) and your school's CPOs.

**When to share:**
- Share when another counselor is already involved with the student and needs visibility.
- Share when you are filing on behalf of a colleague or the student is transitioning between counselors.
- Share when the school's protocol requires a second counselor to be aware of the case type being filed.
- Share if you are going on leave and another counselor needs to handle follow-up.

**When not to share:**
- Do not share with every counselor by default. Only share with people who have a direct role in this specific case.
- Avoid sharing sensitive personal safety cases unless necessary — limit access to those directly responsible.

**How it works:**
- Click inside the Share With field and type a name, or scroll the dropdown.
- Click a counselor's name to add them. Multiple counselors can be selected.
- Selected names appear as chips in the field. Click the X on a chip to remove them.
- The case is also automatically visible to your building's CPO and school-level CPO regardless of this setting.

> **Note for Teachers (Level 4):** The Share With field is disabled for Teacher accounts. The system handles sharing automatically with the appropriate CPOs.

---

#### Step 4: Personal Information Tab

> **[SCREENSHOT: Personal Information tab — Building dropdown, Cohort dropdown, student name search field, auto-filled Preferred Name and Sex fields below]**

Fill in the student's details. These fields link the case to the correct student record from Alma.

**School** *(read-only)*
Pre-filled from your account. You cannot change this.

**Building**
Select the building where the student is enrolled. The cohort list and student search will not activate until this is selected.

**Cohort**
Select the year group (grade level). Available cohorts update based on the building selected. The student search will not activate until a cohort is selected.

**Full Name**
Type at least 2 characters of the student's first or last name. A dropdown of matching students from Alma appears. Results are filtered by the building and cohort you selected.

> **[SCREENSHOT: Name search showing autocomplete dropdown with student names, preferred names in parentheses, and cohort tags]**

Click a student in the dropdown to select them. The following fields auto-fill from the Alma student record and become read-only:

| Field | Source |
|---|---|
| **Preferred Name / Nickname** | Alma student record |
| **Sex** | Alma student record |
| **Nationality** | Alma student record |
| **Student Status** | Alma student record (enrollment duration) |

If no student is found, check that you have the correct building and cohort selected, and that the spelling matches the student's legal name as it appears in Alma. Contact your App Admin if a student is missing from the system (they may need to trigger a sync).

To clear a selected student and search again, click the **✕** button that appears on the name field.

Click **Next** to proceed to the Report Details tab.

---

#### Step 5: Report Details Tab

> **[SCREENSHOT: Report Details tab — Category dropdown, Severity buttons (High/Medium/Low), Specifications multiselect, Reason textarea, file upload field]**

**Category**
Select the category that best describes the type of concern. Categories depend on which Case Type you selected in Step 1. If the dropdown is empty, go back and confirm a Case Type is selected.

**Severity**
Choose one of three buttons: **High Risk**, **Medium Risk**, or **Low Risk**.

A hint appears below the buttons after you select one, describing what each level means (see [Section 8](#8-severity-levels--definitions-and-examples) for full definitions and examples).

**Specification (Tags)**
Optional but recommended. Once you select a Category, a list of subcategory tags appears. Select all that apply to describe the concern more precisely. You can also type to add a custom tag.

**Reason**
Write a clear, factual description of the concern. Include:
- What happened or was observed
- When it was observed or reported
- Who reported it (if not the counselor directly)
- Any immediate action already taken

Keep language objective and factual. Avoid conclusions or diagnoses in the reason field — record what was observed or said.

**Upload Media & Documentation**
Attach supporting evidence: photos, documents, referral letters, consent forms, etc. Multiple files can be uploaded at once. Supported file types include images (JPG, PNG, GIF), videos (MP4), and documents.

---

#### Step 6: Submit

Review your entries, then click **Submit**. A confirmation message appears. The case is saved and immediately visible to you and anyone you shared it with.

If any required field is missing, an error list appears at the bottom of the form showing exactly which fields are incomplete. Correct them and submit again.

**Required fields:**
- Building
- Cohort
- Full Name (student selected from Alma)
- Category
- Severity
- Reason

**Optional fields:**
- Specification tags
- Shared counselors
- Uploaded files
- Student Status (sourced from Alma — currently pending Alma endpoint confirmation)

---

### 3.4 Report List

> **[SCREENSHOT: Report List page — header with Filters button, table of cases below showing student name, category, severity badge, status badge, and date]**

The Report List shows all cases in your building. The most recent cases appear first by default.

#### Reading the Case Table

Each row shows:
- **Student Name** — the student the case is filed for
- **Category** — the concern type
- **Severity** — colour-coded badge (High, Medium, Low)
- **Status** — current status (In Progress, On Hold, Resolved)
- **Date** — when the case was filed

Click any row to open that case's **Case Details** page.

#### Filtering Cases

Click the **Filter** button (funnel icon) in the top-right corner to open the filter panel.

> **[SCREENSHOT: Filter panel open — Period, Severity, and Category dropdowns visible]**

Available filters for Guidance Counselors:

| Filter | Options |
|---|---|
| **Period** | Last 7 days / Last 30 days |
| **Severity** | High / Medium / Low |
| **Category** | All categories present in the current list |

Click **RESET** to clear all active filters and return to the full list.

---

### 3.5 Case Details

Opening a case from the Report List takes you to its Case Details page.

> **[SCREENSHOT: Case Details page — case type indicator at top-left, View Student History link and Status dropdown at top-right, Shared With chips below, then Personal Information and Report Details tabs]**

#### Header Row

**Case Type** (top-left): Shows which case type this report is. The relevant type is pre-selected (read-only) — it is shown for reference.

**View Student History** (top-right): A link that takes you directly to this student's full history page, showing all cases, medical records, and session notes linked to them.

**Status** (top-right): A dropdown that lets you update the case status at any time. Changes save immediately.

> **[SCREENSHOT: Status dropdown open showing In Progress, On Hold, Resolved options]**

#### Shared With

Below the header, a row of name chips shows every person who can view this case. If no counselors were added during filing, this shows empty (the case is still visible to CPOs).

#### Personal Information Tab

Shows the student's details as they were at the time of filing:
- School
- Student Status — Duration of Stay
- Full Name and Nickname
- Nationality and Cohort

These details are a **snapshot** taken when the report was filed. If the student's Alma record changes after filing, the case record is not updated — this preserves the historical accuracy of the report.

#### Report Details Tab

Shows the full report content:
- **Category** — the concern type
- **Severity** — highlighted badge (High / Medium / Low)
- **Specifications** — the subcategory tags selected when filing
- **Reason** — the written description of the concern
- **Media & Documentation** — image thumbnails, video previews, and document icons for all uploaded files. Click a thumbnail to view it.

#### View as Report / Print

Click **View as Report** at the top of the page to switch to a print-ready A4 layout that combines all information onto a single formatted page.

> **[SCREENSHOT: "View as Report" A4 layout showing all case information formatted for printing]**

Once in Report view, click **Print / Save as PDF** to open the browser's print dialog. Choose "Save as PDF" in the destination to export a PDF copy of the record.

Click **< Back to Tabs** to return to the normal view.

---

### 3.6 Student History

Navigate to **Student History** in the sidebar to see a list of all students in your building.

> **[SCREENSHOT: Student History page — list/grid of students with name, cohort, and nationality visible]**

Click a student to open their individual record. This page consolidates everything on file for that student.

> **[SCREENSHOT: Individual student page — three tabs at the top: Case Reports, Medical Records, Session Notes]**

#### Case Reports Tab

A table of all cases linked to this student. Columns show category, severity, status, and date filed. Click a row to open that Case Details page.

#### Medical Records Tab

Medical records on file for the student. Sortable by date, title, and who created the record.

#### Session Notes Tab

A record of all counseling session notes linked to this student. Each row shows the session date, note title, and the counselor who created it. Click a row to open the Session Notes Details page.

#### Creating a Treatment Plan

From the student page, click **Add Treatment Plan** (or the equivalent button) to open the Treatment Plan form for that student.

The Treatment Plan form has four tabs:

1. **Overview** — Student Overview (free text) and Identified Concerns (tag list)
2. **Goals** — Short Term Goals and Long Term Goals (tag lists)
3. **Strategies & Interventions** — Emotional Support, Parental Involvement, Skill Development, Peer Interaction, Academic Support, Follow-up (tag lists)
4. **Metrics for Success & Notes** — Metrics (tag list) and free-text Notes

Work through the tabs in order using **Next** and **Previous**. Submit on the final tab.

> **[SCREENSHOT: Treatment Plan form — showing the Strategies & Interventions tab with the six tag-input fields in a grid]**

#### Creating Session Notes

From the student page, click **Add Session Notes** to open the Session Notes form.

The Session Notes form has four tabs:

1. **Overview** — Concern Overview (free text) and People Present (names and roles of everyone in the session)
2. **Session Notes** — Observation Notes (free text), Actions Taken (tag list), Outcome (tag list), Future Actions (tag list)
3. **Media & Documentation** — file upload with drag-and-drop support
4. **Follow-Up** — Date of follow-up session and follow-up notes

> **[SCREENSHOT: Session Notes form — showing the Session Notes tab with Observation Notes and the three tag-input fields below]**

---

### 3.7 Search

The search bar at the top of the sidebar is available to Guidance Counselors, School Coordinators, and District Admins. Type any text and results appear after a short delay.

> **[SCREENSHOT: Search Results page — Students section above, Cases section below, each shown as clickable cards]**

Search results are split into two sections:

**Students**
Each student card shows: full name, preferred name, nationality, cohort, and school. Click a card to go directly to that student's history page.

**Cases**
Each case card shows: category, severity badge, status badge, student name, preferred name, nationality, cohort, and date filed. Click a card to open that Case Details page.

If no results are found for your query, a "No results found" message appears.

Click **Load more** under either section to retrieve additional results.

---

### 3.8 Notifications

> **[SCREENSHOT: Notifications page — three sections: Today, Last 7 Days, Earlier, each with a list of notification cards]**

The Notifications page shows reminders generated automatically by the system. Notifications are grouped into three time periods:

- **Today**
- **Last 7 days**
- **Earlier**

Each notification says which case has been in a given status for too long (e.g., "Case has been In Progress for more than 14 days"). Click the notification to go directly to that case.

Click **Mark all as read** in the top-right corner to clear the unread indicator from all notifications.

Click **Load More** at the bottom of each section to see older notifications.

**When are notifications sent?**
The system checks for stale cases automatically every day at 9:00 AM Bangkok time. It also checks on startup. A reminder is only sent once per case per day.

---

### 3.9 Settings

> **[SCREENSHOT: Settings page — profile section at the top, Account Settings and Notification Settings sections below]**

#### Profile Section

The top of the Settings page shows your profile photo, name, role, and school/building.

- Click the camera icon on the avatar to upload a new profile photo.
- Click the edit (pencil) icon next to your name to update your display name.

#### Account Settings

| Setting | Action |
|---|---|
| **Change Password** | Click **Change** to open the password change dialog |
| **Two-Factor Authentication** | Toggle the checkbox to enable or disable 2FA for your account |

#### Notification Settings

| Setting | What it does |
|---|---|
| **Send via Email** | If checked, stale-case reminders are also sent to your email address |
| **Notify when new reports are added** | If checked, you receive a notification when a new case is filed in your building |

---

## 4. School Coordinator / CPO (Level 2)

School Coordinators (CPOs) oversee safeguarding across the **entire school**. They can see cases and students from all buildings, access analytics, and generate summary reports.

After login, they land on `/dashCPO`.

---

### 4.1 CPO Dashboard

> **[SCREENSHOT: CPO Dashboard — concern-type tabs across the top, analytics charts filling the main area]**

The CPO Dashboard shows analytical charts broken down by concern type. Tabs at the top represent different case categories. Clicking a tab updates the charts to show data for that category only.

All data on this dashboard is scoped to the School Coordinator's school.

---

### 4.2 Sidebar Navigation

School Coordinators see everything Guidance Counselors see, plus one additional section:

> **[SCREENSHOT: Sidebar — CPO view showing the Analytics section with Report Summary link]**

| Section | Item | Available to |
|---|---|---|
| *(top)* | Search bar | ✓ |
| *(top)* | Dashboard | ✓ (goes to CPO dashboard) |
| Case Management | File Report | ✓ |
| Case Management | Report List | ✓ (all buildings) |
| Case Management | Student History | ✓ (all buildings) |
| **Analytics** | **Report Summary** | ✓ CPO only |
| System | Notifications | ✓ |
| System | Settings | ✓ |

---

### 4.3 Report List — Building Filter

School Coordinators see two additional controls on the Report List page compared to Guidance Counselors:

1. A **student name search bar** in the page header (searches across all buildings)
2. A **Building filter** in the filter panel

> **[SCREENSHOT: Report List filter panel for CPO — Period, Severity, Category, and Building filters visible]**

Use the Building filter to narrow the case list to a single building. This is useful when reviewing a specific building's caseload before a meeting.

---

### 4.4 Case Details — Full Access

School Coordinators have full access to every case in their school:
- View all personal information and report details
- Change case status using the status dropdown
- Open the **View Student History** link to see the student's full record

---

### 4.5 Student History — School-Wide View

The Student History page shows all students across all buildings in the school (not just one building). The same tabs (Case Reports, Medical Records, Session Notes) are available, and CPOs can create Treatment Plans and Session Notes for any student.

---

### 4.6 Report Summary (PDF Export)

Navigate to **Report Summary** in the Analytics section of the sidebar.

> **[SCREENSHOT: Report Summary page — filter and date range controls at the top, generated summary below]**

This page generates a structured summary of cases across the school for a selected period. Use it to:
- Prepare for safeguarding meetings
- Provide data to school leadership
- Submit required reporting to external bodies

Select your filters and date range, then generate the report. When the report is ready, a formatted summary is displayed. Use the **Download** or **Print / Save as PDF** option to export it.

> **[SCREENSHOT: Generated Report Summary — totals by category, severity breakdown, and case list]**

---

## 5. District Admin (Level 3)

District Admins have the broadest visibility in the system — they can see data across **all schools in the district**. Their experience is identical to a School Coordinator's, with the addition of cross-school controls.

After login, they land on `/dashCPO`.

---

### 5.1 CPO Dashboard — School Selector

> **[SCREENSHOT: CPO Dashboard with the school selector dropdown visible at the top of the main area]**

District Admins see a **school selector dropdown** at the top of the CPO Dashboard. Switching schools re-fetches and re-renders all analytics charts for the chosen school.

This dropdown is **only visible to District Admins**. School Coordinators do not see it — their dashboard is automatically scoped to their own school.

---

### 5.2 Report List — School and Building Filters

District Admins see two additional filters that are not available to School Coordinators:

> **[SCREENSHOT: Report List filter panel for District Admin — Period, Severity, Category, School, and Building filters all visible]**

| Filter | Available to |
|---|---|
| Period | All roles (Level 1+) |
| Severity | All roles (Level 1+) |
| Category | All roles (Level 1+) |
| Building | Level 2 and 3 only |
| **School** | **Level 3 only** |

Use the School filter to narrow to one school, then use the Building filter within that school to drill down further.

---

### 5.3 Student History — District-Wide View

The Student History page shows students from all schools and all buildings. The same student record view (Case Reports, Medical Records, Session Notes) is available for any student district-wide.

---

### 5.4 All Other Features

Every feature available to School Coordinators is also available to District Admins, scoped to whichever school is currently selected.

---

## 6. Teacher / Reporter (Level 4)

Teachers and Reporters are limited-access users who can submit incident reports and view their own submissions only. They have **no access to dashboards, analytics, student history, or other users' cases**.

After login, they land directly on `/file-report`.

---

### 6.1 Sidebar Navigation

> **[SCREENSHOT: Sidebar for Teacher — only Case Management items and the user info card are visible. No search bar, no Dashboard link, no Student History, no Notifications, no Settings]**

Teachers see a stripped-down sidebar:

| Item | Available |
|---|---|
| Search bar | ✗ Not visible |
| Dashboard | ✗ Not visible |
| File Report | ✓ |
| Report List | ✓ (own cases only) |
| Student History | ✗ Not visible |
| Notifications | ✗ Not visible |
| Settings | ✗ Not visible |

The user info card at the bottom shows your name, role, and a logout icon.

---

### 6.2 Filing a Case

The filing form for Teachers works the same as for Guidance Counselors (see [Section 3.3](#33-filing-a-case--step-by-step-guide)) with the following differences:

**The Share With field is disabled.**

Teachers cannot choose who sees their report. When a Teacher submits a case:
- The case is automatically visible to the building-specific CPO and school-level CPOs.
- No other counselors are added.
- The Share With field shows a message: *"This case will be shared with building-specific CPO and school level CPOs."*

> **[SCREENSHOT: File Report form for a Teacher — Share With field greyed out with the informational message visible]**

Everything else — Case Type, Status, Building, Cohort, student search, Category, Severity, Reason, and file upload — works identically.

---

### 6.3 Report List — Own Cases Only

> **[SCREENSHOT: Teacher's Report List — table showing only cases that teacher filed, with the same columns as the full Report List]**

The Report List for a Teacher shows **only the cases they personally submitted**. Cases filed by other teachers or counselors are never visible, even for the same student.

There is no search bar at the top (unlike CPO Report List views).

Filter options are the same as for Guidance Counselors: Period, Severity, Category.

---

### 6.4 Case Details — Read-Only Status

> **[SCREENSHOT: Teacher's Case Details — status displayed as a grey pill/badge (static text), no View Student History link present]**

Teachers can open and read any of their own cases. The differences from a Counselor's view:

| Element | Counselor (Level 1) | Teacher (Level 4) |
|---|---|---|
| Status | Editable dropdown | Read-only badge (static text) |
| View Student History | Link present | Not shown |
| Shared With | Shows who the case is shared with | Shows who the case is shared with |
| View as Report / Print | Available | Available |

The **View as Report** and **Print / Save as PDF** options work exactly the same for Teachers — they can produce a printable PDF of their own cases.

---

## 7. Who Can View What — Full Reference

### Case Visibility

| Who filed the case | Who can view it |
|---|---|
| Guidance Counselor (L1) | The filing counselor + any counselors added in "Share With" + building CPO + school CPO |
| School Coordinator (L2) | The filing CPO + any users shared with + school CPO |
| District Admin (L3) | The filing admin + any users shared with + school CPO |
| Teacher (L4) | The filing teacher + building CPO + school CPO (sharing is automatic, not configurable) |

### Student Data Scope

| Role | Can see students in |
|---|---|
| Guidance Counselor (L1) | Own building only |
| School Coordinator (L2) | All buildings in own school |
| District Admin (L3) | All buildings in all schools |
| Teacher (L4) | Cannot browse students — can only search when filing a report |
| App Admin (L0) | No case/student data access at all |

### Page Access by Role

| Page | L0 Admin | L1 Counselor | L2 CPO | L3 District | L4 Teacher |
|---|:---:|:---:|:---:|:---:|:---:|
| Admin Panel | ✓ | — | — | — | — |
| Counselor Dashboard | — | ✓ | — | — | — |
| CPO Analytics Dashboard | — | — | ✓ | ✓ | — |
| File Report | — | ✓ | ✓ | ✓ | ✓ |
| Report List (all in scope) | — | ✓ | ✓ | ✓ | Own only |
| Report List — Building filter | — | — | ✓ | ✓ | — |
| Report List — School filter | — | — | — | ✓ | — |
| Case Details — change status | — | ✓ | ✓ | ✓ | — |
| Case Details — print/PDF | — | ✓ | ✓ | ✓ | ✓ |
| View Student History link | — | ✓ | ✓ | ✓ | — |
| Student History page | — | ✓ | ✓ | ✓ | — |
| Treatment Plans | — | ✓ | ✓ | ✓ | — |
| Session Notes | — | ✓ | ✓ | ✓ | — |
| Report Summary (PDF) | — | — | ✓ | ✓ | — |
| Notifications | — | ✓ | ✓ | ✓ | — |
| Settings | — | ✓ | ✓ | ✓ | — |
| Sidebar Search | — | ✓ | ✓ | ✓ | — |

---

## 8. Severity Levels — Definitions and Examples

Severity is set when filing a case and reflects the assessed risk level to the student's safety and wellbeing at the time of reporting. It affects how the case appears in lists and reports, and how urgently it should be actioned.

---

### High Risk

**System hint:** *"Immediate attention required. Possible harm, abuse, or urgent risk."*

**Definition:** There is evidence or a credible disclosure of immediate or recent harm, abuse, or serious risk. This requires same-day or urgent action. Do not wait — escalate immediately according to your school's safeguarding protocol.

**Examples:**
- A student discloses physical abuse at home, with visible injuries
- A student is found in possession of a weapon or has made a credible threat of violence
- A student makes a direct disclosure of sexual abuse or assault
- A student expresses intent to harm themselves and has a plan or means to do so
- A student is found to be living in an unsafe home environment (neglect, domestic violence in the household)
- A teacher reports witnessing a student being physically harmed on school premises

> **Action expectation:** Notify the building CPO immediately. Do not leave this case unactioned at the end of the school day. Document all steps taken in the Reason field and update the case status as the situation develops.

---

### Medium Risk

**System hint:** *"Concerning behavior. Monitor closely and consider intervention."*

**Definition:** There is a pattern of concerning behavior or an incident that warrants follow-up and possible intervention, but there is no evidence of immediate physical harm. The student's wellbeing may be at risk if the situation continues unchecked.

**Examples:**
- A student's academic performance has significantly dropped and they appear withdrawn or distressed over several weeks
- A student has been involved in repeated peer conflict or bullying (as victim or perpetrator)
- A parent has flagged emotional or behavioral changes at home that are affecting school life
- A student has made a vague or indirect reference to feeling unsafe without a specific disclosure
- A student appears malnourished or consistently arrives without adequate clothing or supplies
- A student reports ongoing parental conflict that is causing visible distress
- A student has been absent excessively with no clear or credible explanation

> **Action expectation:** Schedule a meeting with the student within a few days. Monitor the situation closely. Consider involving parents or external support services. Update the case with notes from any meetings.

---

### Low Risk

**System hint:** *"Minor concern. Record and observe behavior."*

**Definition:** An isolated incident or early-stage concern that does not yet indicate a pattern or immediate risk. The primary purpose of the report is to create a record so the situation can be tracked over time.

**Examples:**
- A single incident of unusual behavior that is out of character for the student
- A student seemed unusually sad or quiet on a particular day and was unresponsive when asked
- A minor conflict between peers that was resolved but is worth noting for future reference
- A parent reported a brief stressful period at home (e.g., a family member's illness) that may be affecting the student
- A student made an offhand comment that could be interpreted in multiple ways and does not yet constitute a disclosure
- A teacher noticed a small bruise on a student and wants to document the observation without escalating further at this stage

> **Action expectation:** No immediate action required. Check in with the student within the week. If the behavior recurs or escalates, file a new case with an updated severity level or update this case's status and reason.

---

### Choosing the Right Severity

Use these questions to guide your assessment:

1. **Is there evidence of current or recent physical harm?** → High
2. **Has the student made a specific disclosure of abuse?** → High
3. **Is the student at risk of harm to themselves or others?** → High
4. **Is there a pattern of concerning behavior over weeks or months?** → Medium
5. **Has a parent flagged a concern that requires follow-up?** → Medium
6. **Is this an isolated incident with no immediate risk?** → Low
7. **Is this primarily a documentation step to create a record?** → Low

When in doubt, rate higher rather than lower. It is easier to downgrade a case than to escalate one that has been neglected.

---

*Last updated: June 2026*
*System: StudentSafe — Safeguarding System for the Example School District*
