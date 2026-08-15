# Dashboard UI Redesign — Level 2 & Level 3 Users (Child Protection & Counseling Tabs)

## Scope & Constraints

This is primarily a **UI redesign**. The following rules apply:

- **Role-permission and access-control logic must not change.** Level 2 users see only their assigned school's cases; Level 3 users see all schools. That behaviour must remain exactly as it is today.
- **Data fetching may be added or modified** as needed to support new UI components (e.g. fetching top users, subcategory breakdowns, cases-by-gender). Any new or modified fetches must still respect the existing role-permission and access-control rules — Level 2 queries must be scoped to the user's assigned school just as existing queries are.
- **The Report List page styling may be updated** to match the new global CSS tokens defined in Section 1. Do not change its routing, filtering logic, or data fetching unless a dashboard navigation action explicitly requires a new filter parameter to be passed in.

Reference images (already in the project):
- `NewDashImage1` — target layout for page 1
- `NewDashImage2` — target layout for page 2

---

## 1. Global CSS / Design Tokens

Update the global CSS file with the following token set. Do not leave any old conflicting values in place.

### Sidebar / Navigation
| Token | Value |
|---|---|
| Sidebar gradient top | `#123A97` |
| Sidebar gradient middle | `#0A2D80` (at 35%) |
| Sidebar gradient bottom | `#081F5C` |
| Active menu background | `#1E4FB8` |
| Active menu hover background | `rgba(255,255,255,0.08)` |
| Active menu border-radius | `14px` |
| Active icon & text | `#FFFFFF` |
| Inactive icon | `rgba(232,238,249,0.85)` |
| Inactive text | `#FFFFFF` |
| Divider lines | `rgba(255,255,255,0.08)` |
| Bottom user card background | `#15398F` |
| Notification badge | `#2563EB` |
| Sidebar box-shadow | `rgba(8,31,92,0.25)` |

Apply the sidebar gradient as:
```css
background: linear-gradient(180deg, #123A97 0%, #0A2D80 35%, #081F5C 100%);
```

### Main App
| Token | Value |
|---|---|
| Page background | `#F5F4FF` |
| Card background | `#FFFFFF` |
| Primary | `#0A2D80` |
| Primary hover | `#123A97` |
| Border | `#E5E7F3` |
| Text primary | `#1F2937` |
| Text secondary | `#6B7280` |

Card shadow:
```css
box-shadow: 0px 4px 16px rgba(10,45,128,0.08);
```

Dashboard content area background — use a subtle gradient:
```css
background: linear-gradient(180deg, #123A97 0%, #0A2D80 35%, #081F5C 100%);
```
> Apply this only to the main content background wrapper, not to individual cards.

### Accent / Status Colors
| Meaning | Hex |
|---|---|
| Success / Resolved | `#22C55E` |
| Warning / On Hold | `#F59E0B` |
| High Priority / High Severity | `#EF4444` |
| Info / In Progress | `#3B82F6` |
| Purple accent (optional) | `#7C3AED` |

---

## 2. Shared Header (Both Pages)

Apply the following header layout to **both** page 1 and page 2 of the dashboard.

**Left side:**
- Greeting: `Good morning, <username>! 👋` — large, bold
- Subtext: `Here's what's happening with student safety and wellbeing today.` — small, muted

**Right side (aligned to top-right corner):**
- School filter dropdown (existing — keep its current data logic)
- **"+ New Case" button** — visible for **Level 2 users only**. Level 3 users do not see this button. The existing role-check that controls this must not be modified; just ensure the button renders here and not elsewhere.
- Remove the date-range filter entirely — it will not be used.

---

## 3. Tab Bar (Below Header, Both Pages)

Replace the current tab implementation with two styled tabs. Keep existing tab-switching logic; only update the visual presentation.

| | Tab 1 | Tab 2 |
|---|---|---|
| **Label** | Child Protection | Counseling |
| **Iconify icon** | `fluent:shield-person-20-regular` | `picon:protect` |
| **Subtext** | Safety & risk management | Wellbeing & support |

Active tab: underline indicator + primary color text. Inactive tab: muted text, no underline.

---

## 4. Dashboard Page 1 — Layout & Components

> Reference: `NewDashImage1`

Keep the left/right arrow pagination that navigates between page 1 and page 2.

### 4.1 Stat Cards Row

Replace the current stacked line-chart stats block (Reported Cases / Resolved Cases / Open Cases with sparklines) with **four horizontal stat cards** in a single row:

```
[Total Cases] [Open Cases] [Resolved Cases] [High Severity]
```

Each card structure:
- Small label text at top (e.g. "Total Cases")
- Large number below
- Small colored helper text at the bottom

Card-specific details:

| Card | Accent Color (soften — use tinted bg + colored text, not full saturation) | Bottom Text |
|---|---|---|
| Total Cases | Blue (`#3B82F6`) | ↑ N from last week |
| Open Cases | Purple (`#7C3AED`) | ↑ N from last week |
| Resolved Cases | Green (`#22C55E`) | ↑ N from last week |
| High Severity | Red (`#EF4444`) | "View high priority cases →" (link) |

Click behaviour (navigate within the same case-type tab, applying filters):
- **Total Cases** → Report List, no extra filter
- **Resolved Cases** → Report List, filter `status = resolved`
- **High Severity** → Report List, filter `severity = high`

Do not add click navigation to the Open Cases card unless it already exists.

---

### 4.2 Middle Row

```
[Recent Reported Cases — wide left]  [Top Reported Categories — right panel]
```

#### Recent Reported Cases Table

- Columns: Student (avatar icon + name), School, Category, Severity, Status, Reported Date
- Remove the Case ID column and the Actions (⋮) column from this dashboard preview table (they remain in the full Report List)
- Sort: most recent first; show top 5 rows
- Keep existing table CSS (borders, row hover, fonts) but add colored status badges:
  - In Progress → purple (`#7C3AED` background tinted)
  - On Hold → orange/amber (`#F59E0B` background tinted)
  - Resolved → green (`#22C55E` background tinted)
  - New → blue (`#3B82F6` background tinted)
- Footer link: `View all cases →` — navigates to Report List sorted by most recent

#### Top Reported — Categories / Subcategories Card

- Card title: "Top Reported"
- Two inner tabs: **Category** | **Subcategory** (switch between them; data changes, card height stays fixed)
- For each item: name on the left, a colored progress bar (use the primary dark blue `#0A2D80`), percentage on the right
- No icons next to items
- Show top 5 items; the 6th entry is always labelled **"Others"** and shows the summed remaining percentage
- "Others" is **clickable** — clicking it expands to show the remaining items. Do not grow the card height; make the card body scrollable instead. A second click on "Others" (or a "Show less" control) collapses it back.
- Remove the "View all" link

---

### 4.3 Bottom Row

```
[Cases Over Time — left]  [Overview of Cases by School — center]  [Cases by: Status/Gender/Severity — right]
```

#### Cases Over Time Chart

- Title (left): "Cases Over Time"
- Filter dropdown (right): Week / Month / Year
- Stacked area-line chart:
  - Solid line with shaded area beneath for **Total Cases**
  - Dashed line (no fill) for **Resolved Cases**
- Use primary blue palette; area fill should be semi-transparent

#### Overview of Cases by School (Bar Chart)

- Title: "Overview of Cases"
- Dropdown filter (right): All (default) / In Progress / On Hold / Resolved — filters the bar chart data
- Bar chart per school (ABA, ABS, ACIS, BCIS, UCIS)
- Bars: current color but with **rounded top corners** (border-radius on top only)
- Show the **numeric value above each bar**
- Horizontal grid lines only — remove vertical grid lines
- No y-axis title

#### Cases by: (Tabbed Chart Card)

- Card title: "Cases by:"
- Three inner tabs: **Status** | **Gender** | **Severity**
- Render the appropriate chart for the selected tab (use the existing chart data and chart type for each)
- Replace the current three separate chart cards (`Reported Cases By Status`, `Reported Cases By Severity`, `Reported Cases By Gender`) with this single tabbed card

---

### 4.4 Alert Footer Strip (Bottom of Page 1)

A full-width footer bar pinned to the bottom of the page content (not the browser viewport — just below the last content row):

**Left section:**
- Icon: `mingcute:alert-line` (Iconify)
- Bold text: `{N} cases need your attention`
- Subtext: `High priority cases`
- Clicking this section navigates to Report List filtered by `severity = high`

**Right section:**
- Icon: `fluent:alert-16-regular` (Iconify)
- Bold text: `Stay informed`
- Subtext: `View all alerts and updates`
- Right-facing chevron / arrow

Separator between left and right sections. This replaces/updates the existing alert strip.

---

## 5. Dashboard Page 2 — Layout & Components

> Reference: `NewDashImage2`

Keep the left/right arrow pagination. There are **no stat cards** on page 2.

Layout:
```
[In Progress Cases — wide left]       [Reports by Category — right panel]
[On Hold Cases — wide left]           [Top Users Reporting Cases — right panel]
```

---

### 5.1 In Progress Cases Table

- Section title: **"In Progress Cases"** (not "Recent Reported Cases")
- Columns: Student (avatar + name), School, Category, Severity, Reported Date
- Show top 5 most recent in-progress cases
- Footer link: `View all cases →` — navigates to Report List for the current case-type tab, filtered by `status = in progress`

---

### 5.2 On Hold Cases Table

- Section title: **"On Hold Cases"**
- Columns: Student (avatar + name), School, Category, Severity, On Hold Since, Reason
- Show top 5 most recent on-hold cases
- Footer link: `View all cases →` — navigates to Report List for the current case-type tab, filtered by `status = on hold`

Apply the same colored status badge styles from section 4.2 to Severity badges in both tables.

---

### 5.3 Reports by Category (Donut Chart)

- Section title: **"Reports by Category"** (rename from "Report Activity by School")
- Donut chart showing case distribution by **category** (not by school)
- Display the **total case count** as a number centered inside the donut
- Color each segment distinctly; include a legend below the chart
- No "Showing % of total cases" footnote needed, but percentage labels on segments are fine

---

### 5.4 Top Users Reporting Cases

- Section title: **"Top Users Reporting Cases"**
- Show **top 5** users (not all users)
- Table columns: User (avatar icon + name), School, Cases Reported
- Below the table: **"View more users"** text link — clicking it does **not** navigate away; instead it expands the list within the card. The card height stays fixed — make the card body scrollable.
- Remove the "View all users" link/navigation entirely

---

### 5.5 Alert Footer Strip (Bottom of Page 2)

Full-width footer bar:

**Left section:**
- Icon: `fluent:alert-16-regular` (Iconify)
- Bold text: `{N} cases need your attention`
- Subtext: `High priority cases`

**Right section:**
- A solid **blue button** (`#0A2D80` or primary) with text **"Review Now →"**
- Button click navigates to Report List for the current case-type tab, filtered by `severity = high`

---

## 6. What to Leave Unchanged

- All role-permission and access-control logic
- The left/right arrow dashboard pagination mechanism
- The school filter dropdown data logic (charts and tables must still update when the school filter changes, and must respect role-scoping)
- Sidebar navigation items and routing
