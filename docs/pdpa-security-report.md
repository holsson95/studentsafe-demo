# StudentSafe — Data Security & PDPA Compliance Report

**Prepared for:** School Leadership & Administration
**Date:** June 2026
**Status:** Pre-Launch (Currently in Development)

---

## What Is StudentSafe?

StudentSafe is a secure, internal case management system designed for school counselors and coordinators to document and track student welfare cases. It replaces paper-based and informal digital processes (such as email or shared spreadsheets) with a structured, access-controlled system that keeps sensitive student information protected.

The system is used by:
- **Guidance Counselors** — file and manage cases for students in their building
- **School Coordinators (CPOs)** — review and oversee cases across their school
- **District Administrators** — view data and trends across all schools
- **Teachers/Reporters** — report a concern; can only see cases they personally filed

Student records are pulled from the school's existing student information system, **Alma**, so no student data is manually entered or duplicated by staff.

---

## How the System Protects Data

### Who Can See What

Every person who uses the system is given a specific access level when their account is created. This determines exactly what data they can see and what actions they can take.

| Role | What They Can Access |
|---|---|
| Guidance Counselor | Only cases and students within their own building |
| School Coordinator | All cases and students within their school |
| District Administrator | Cases and students across all schools |
| Teacher / Reporter | Only cases they personally filed |
| App Administrator | System settings only — cannot see any student or case data |

This means a counselor at one building **cannot** see cases filed at another building, and a teacher can only ever see the specific cases they submitted. Access is enforced by the system, not by trust.

### Identity Verification — Google Sign-In

Staff log in using their school Google account. The system does not manage or store passwords. Google verifies the user's identity, and only accounts with a valid, approved school email address can access the system. This removes the risk of weak passwords and means staff never need to remember a separate login.

### Passwords (Where Still Used)

For any accounts that do not use Google Sign-In, passwords are stored using **bcrypt**, a one-way encryption method. This means even if the database were ever accessed without authorization, passwords could not be read or reversed.

### Secure Session Tokens

When a user logs in, the system issues a secure digital token that acts as a temporary pass for that session. This token expires after **24 hours**, meaning sessions do not stay open indefinitely. The system validates this token on every request — if it is missing, expired, or invalid, access is denied immediately.

### Data From Alma

Student records (names, year group, building) are retrieved from Alma, the school's student information system, using a secure authenticated connection. The system only stores the information it needs for case management. Sensitive personal fields — including identification numbers, home addresses, phone numbers, medical records, and emergency contacts — are **never stored** in StudentSafe.

Every time student records are synced from Alma, the system logs the date, time, and who initiated the sync, creating a clear record of data imports.

### File Attachments

Counselors can attach supporting documents or media to a case (e.g. written statements, photographs). The system restricts uploaded files to specific safe file types (documents, images, and video) and enforces a maximum file size. Files are stored securely and tied to the case record.

---

## How Case Sharing Works

Cases can be shared between staff members when collaboration is needed. Sharing is intentional — a counselor must explicitly choose to share a case with another staff member. Recipients are notified within the system. A case is never automatically visible to other users outside the access rules described above.

---

## PDPA Compliance — Thailand Personal Data Protection Act

Thailand's Personal Data Protection Act (PDPA) establishes the rights of individuals over their personal data and the obligations of organisations that collect and use it. StudentSafe has been designed with PDPA in mind and is being built to comply fully before launch.

### What the PDPA Requires

The PDPA gives individuals (in this case, students and their families) the following rights over their personal data:

- The right to know what data is held about them
- The right to access a copy of their data
- The right to correct inaccurate data
- The right to request deletion of their data
- The right to object to how their data is being used

It also requires organisations to:

- Only collect data that is necessary for a stated purpose
- Not retain data longer than needed
- Protect data with appropriate security measures
- Keep a record of who has accessed or changed personal data
- Notify relevant authorities and affected individuals if a data breach occurs

---

## Current Compliance Status

### Already in Place

- **Access controls** — strict role-based permissions ensure only authorised staff can access student data
- **Secure login** — Google Sign-In with school email verification
- **Password protection** — bcrypt hashing for any password-based accounts
- **Minimal data storage** — sensitive Alma fields (SSN, address, medical) are never stored
- **Secure data transfer** — all communication between the system and Alma uses authenticated, encrypted connections
- **Sync audit log** — every import of student data from Alma is recorded with timestamp and user
- **File type restrictions** — upload filters reduce the risk of malicious files being introduced to the system

---

### To Be Completed Before Launch

The following features are planned and will be implemented before the system goes live with real student data. Each addresses a specific PDPA obligation or security requirement.

#### 1. Audit Trail for Case Access and Changes
Every time a staff member views, edits, shares, or deletes a case, the system will record who performed the action and when. This creates a complete history that can be reviewed for compliance purposes or investigated in the event of a concern.

**Why it matters:** The PDPA requires organisations to be able to demonstrate that data is being handled correctly. Without an audit trail, this cannot be proven.

#### 2. Soft Deletion of Records
Currently, when a case or user record is deleted, it is permanently removed. Before launch, deletions will instead be marked as archived with a timestamp, preserving the record for audit purposes while removing it from active use.

**Why it matters:** Permanent deletion makes it impossible to reconstruct what happened. Archived records can be reviewed if questions arise about past decisions.

#### 3. Data Retention Policy
A defined policy will be set for how long different types of records are kept. Cases that are older than the defined retention period will be automatically archived or flagged for review. No personal data will be kept indefinitely.

**Why it matters:** The PDPA requires that data is not held for longer than necessary for the purpose it was collected.

#### 4. Data Subject Rights Endpoints
The system will include tools that allow an administrator to:
- Export all data held about a specific student
- Mark a student's data for deletion or restriction upon request
- Correct inaccurate information

**Why it matters:** These are legal obligations under the PDPA. If a student or parent requests access to or deletion of their data, the school must be able to respond.

#### 5. Security Headers and HTTPS Enforcement
Before the system is deployed on a live server, it will be configured to enforce encrypted connections (HTTPS) at all times and include industry-standard browser security headers to protect against common web-based attacks.

**Why it matters:** The PDPA requires appropriate technical security measures. HTTPS and security headers are baseline requirements for any system handling personal data.

#### 6. Removal of Diagnostic Logging
During development, the system writes certain diagnostic messages to internal logs to help developers identify issues. Some of these may include personal data (such as names appearing in case records). Before launch, all such logging will be removed or replaced with anonymised identifiers.

**Why it matters:** Personal data should only exist where it needs to. Internal logs are not an appropriate place for student data.

#### 7. Authenticated File Access
Currently, file attachments are accessible via a direct link. Before launch, all file access will require the same authentication and access-level checks as the rest of the system.

**Why it matters:** A case attachment (e.g. a written statement) is sensitive personal data and must be protected with the same controls as the case itself.

#### 8. Data Processing Agreements with Third Parties
The system integrates with two external services: Alma (student data) and an email notification service. Formal Data Processing Agreements will be confirmed with both providers before launch.

**Why it matters:** The PDPA requires that organisations document their relationships with any third party that handles personal data on their behalf.

---

## What Is Not Yet Started (Future Roadmap)

The following are not required for initial launch but represent a mature and complete PDPA posture over time:

- **Consent tracking** — recording formal consent for processing specific categories of student data
- **Breach notification workflow** — an internal process and template for notifying relevant parties in the event of a data incident
- **Encryption of database fields** — encrypting stored PII fields (names, emails) at the database level, providing an additional layer of protection

---

## Summary

| Area | Status |
|---|---|
| Access controls and role-based permissions | ✅ Complete |
| Secure login via Google | ✅ Complete |
| Encrypted passwords | ✅ Complete |
| Minimal PII storage (Alma fields stripped) | ✅ Complete |
| Sync audit log | ✅ Complete |
| File type and size restrictions | ✅ Complete |
| Audit trail for case access and changes | 🔄 Planned before launch |
| Soft deletion / record archiving | 🔄 Planned before launch |
| Data retention policy | 🔄 Planned before launch |
| Data subject rights (export, delete, correct) | 🔄 Planned before launch |
| HTTPS and security headers | 🔄 Planned before launch (at deployment) |
| Authenticated file access | 🔄 Planned before launch |
| Removal of diagnostic logging | 🔄 Planned before launch |
| Third-party Data Processing Agreements | 🔄 Planned before launch |
| Consent tracking | 📋 Future roadmap |
| Breach notification workflow | 📋 Future roadmap |
| Database field encryption | 📋 Future roadmap |

---

*This report reflects the system's status as of June 2026. StudentSafe is under active development and is not yet deployed with live student data. All planned items will be addressed before the system moves to production.*
