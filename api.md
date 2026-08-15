# ALMA SIS API Integration Plan

## Overview
Fetch Active/Locked students from ALMA API to populate a searchable dropdown in FileReport.vue.

---

## Backend Steps

### 1. Install Dependencies
```bash
cd server && npm install axios
```

### 2. Environment Setup
**File:** `server/.env`
```
ALMA_KEY=your_alma_api_key
ALMA_SECRET=your_alma_api_secret
```

### 3. Create Config File
**New file:** `server/config.js`

```javascript
require('dotenv').config();

module.exports = {
  alma: {
    key: process.env.ALMA_KEY,
    secret: process.env.ALMA_SECRET,
  },
};
```

### 4. Create ALMA Service
**New file:** `server/services/almaService.js`

```javascript
const axios = require('axios');
const crypto = require('crypto');
const pool = require('../db');
const config = require('../config');

// Get ALMA App ID from database (JOIN with alma_school_app_id table)
async function getAlmaAppId(buildingId) {
  const result = await pool.query(
    `SELECT a.school_app_id
     FROM buildings b
     JOIN alma_school_app_id a ON b.alma_app_school_id = a.id
     WHERE b.id = $1`,
    [buildingId]
  );
  return result.rows[0]?.school_app_id || null;
}

// In-memory cache (15 min TTL)
const cache = { data: {}, TTL: 15 * 60 * 1000 };

// Sensitive fields to strip
const SENSITIVE_FIELDS = ['ssn', 'dob', 'dateOfBirth', 'address', 'phone',
  'emergencyContact', 'medicalRecords', 'parentEmail', 'parentPhone'];

// HTTP Digest Auth helper
async function digestRequest(url, apiKey, apiSecret) {
  // Initial request to get nonce
  const authResponse = await axios.get(url, { validateStatus: () => true });
  const wwwAuth = authResponse.headers['www-authenticate'];

  if (!wwwAuth || authResponse.status !== 401) {
    throw new Error('Expected 401 with WWW-Authenticate header');
  }

  // Parse digest challenge
  const realm = wwwAuth.match(/realm="([^"]+)"/)?.[1];
  const nonce = wwwAuth.match(/nonce="([^"]+)"/)?.[1];
  const qop = wwwAuth.match(/qop="([^"]+)"/)?.[1] || 'auth';

  const nc = '00000001';
  const cnonce = crypto.randomBytes(8).toString('hex');
  const ha1 = crypto.createHash('md5').update(`${apiKey}:${realm}:${apiSecret}`).digest('hex');
  const ha2 = crypto.createHash('md5').update(`GET:${new URL(url).pathname}`).digest('hex');
  const response = crypto.createHash('md5')
    .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`).digest('hex');

  const authHeader = `Digest username="${apiKey}", realm="${realm}", nonce="${nonce}", ` +
    `uri="${new URL(url).pathname}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}"`;

  return axios.get(url, {
    headers: {
      Authorization: authHeader,
      'Accept': 'application/json, application/problem+json',
      'Content-Type': 'application/json'
    }
  });
}

function sanitize(student) {
  const clean = { ...student };
  SENSITIVE_FIELDS.forEach(f => delete clean[f]);
  return clean;
}

function transform(students) {
  return students.map(s => ({
    id: s.id || s.studentId,
    displayName: `${s.lastName || s.last_name}, ${s.firstName || s.first_name}`,
    firstName: s.firstName || s.first_name,
    lastName: s.lastName || s.last_name,
    nickname: s.nickname || null,
    gradeLevel: s.gradeLevel || s.grade_level || null
  }));
}

async function getStudentsByBuilding(buildingId) {
  const appId = await getAlmaAppId(buildingId);
  if (!appId) return [];

  // Check cache
  const cached = cache.data[appId];
  if (cached && Date.now() - cached.ts < cache.TTL) {
    return cached.students;
  }

  const url = `https://${appId}.api.getalma.com/v2/${appId}/students?status[]=Active&status[]=Locked`;
  const res = await digestRequest(url, config.alma.key, config.alma.secret);

  const students = transform((res.data.response || res.data || []).map(sanitize));
  cache.data[appId] = { students, ts: Date.now() };

  return students;
}

module.exports = { getStudentsByBuilding };
```

### 5. Add Controller Function
**File:** `server/controllers/dropdownController.js`

Add at top:
```javascript
const almaService = require('../services/almaService');
```

Add function (follow getCohorts pattern):
```javascript
const getAlmaStudents = async (req, res) => {
  try {
    const { access_level, building_id: userBuildingId } = req.user;
    let buildingId;

    if (access_level === 1) {
      buildingId = userBuildingId;
    } else if ([2, 3, 4].includes(access_level)) {
      buildingId = req.query.buildingId || userBuildingId;
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!buildingId) {
      return res.status(400).json({ message: 'No building specified' });
    }

    const students = await almaService.getStudentsByBuilding(buildingId);
    res.json(students);
  } catch (err) {
    console.error('[ALMA] Error:', err.message);
    res.json([]); // Return empty on error - allow manual entry fallback
  }
};
```

Export it in module.exports.

### 6. Add Route
**File:** `server/routes/dropdownRoute.js`

```javascript
router.get('/alma-students', authenticate, dropdownController.getAlmaStudents);
```

---

## Database Schema

### Table: `alma_school_app_id`
Stores the ALMA app ID strings for each school.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-increment ID (1, 2, 3, etc.) |
| `school_app_id` | VARCHAR | ALMA app ID string (e.g., 'ucisbuildinga') |

### Table: `buildings` (updated)
Added foreign key column to reference alma_school_app_id.

| Column | Type | Description |
|--------|------|-------------|
| `alma_app_school_id` | INTEGER (FK) | References `alma_school_app_id.id`, NULL for schools not using ALMA |

**Note:** Buildings with IDs 1, 2, and 3 have `alma_app_school_id = NULL` because they do not use the ALMA form.

### Migration SQL (already applied)

```sql
-- Create lookup table for ALMA app IDs
CREATE TABLE alma_school_app_id (
  id SERIAL PRIMARY KEY,
  school_app_id VARCHAR(50) NOT NULL
);

-- Insert ALMA app IDs
INSERT INTO alma_school_app_id (school_app_id) VALUES
  ('ucisbuildinga'),
  ('ucisbuildingb'),
  ('ucisbuildingc'),
  ('ucisbuildingd'),
  ('acis'),
  ('bcis');

-- Add FK column to buildings table
ALTER TABLE buildings ADD COLUMN alma_app_school_id INTEGER REFERENCES alma_school_app_id(id);

-- Update buildings with their ALMA app ID references
-- (Buildings 1, 2, 3 remain NULL - they don't use ALMA)
UPDATE buildings SET alma_app_school_id = 1 WHERE name LIKE '%Building A%';
UPDATE buildings SET alma_app_school_id = 2 WHERE name LIKE '%Building B%';
-- etc.
```

---

## Frontend Steps

### 1. TypeScript Interface
**Add to:** `client/src/views/FileReport.vue` (top of script)

```typescript
interface AlmaStudent {
  id: string | number;
  displayName: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  gradeLevel: string | null;
}
```

### 2. Add Refs and Fetch Logic
```typescript
const almaStudents = ref<AlmaStudent[]>([]);
const selectedAlmaStudent = ref<AlmaStudent | null>(null);
const isLoadingStudents = ref(false);
const almaError = ref<string | null>(null);

const fetchAlmaStudents = async (buildingId: number | string) => {
  if (!buildingId) { almaStudents.value = []; return; }

  isLoadingStudents.value = true;
  almaError.value = null;

  try {
    const { data } = await api.get(`/dropdown/alma-students?buildingId=${buildingId}`);
    almaStudents.value = data;
  } catch (err) {
    console.error('Failed to fetch ALMA students:', err);
    almaError.value = 'Could not load students. Enter details manually.';
    almaStudents.value = [];
  } finally {
    isLoadingStudents.value = false;
  }
};

// Add to existing selectedBuilding watch
watch(selectedBuilding, (id) => {
  if (id) {
    fetchAlmaStudents(id);
    fetchCohorts(id);
  }
});

// Auto-fill form on selection
watch(selectedAlmaStudent, (student) => {
  if (student) {
    firstName.value = student.firstName;
    lastName.value = student.lastName;
    nickname.value = student.nickname || '';
  }
});
```

### 3. Add Dropdown to Template
In Personal Details section, before First Name:

```vue
<div class="input-group">
  <label>Select Student (from SIS)</label>
  <multiselect
    v-model="selectedAlmaStudent"
    :options="almaStudents"
    :searchable="true"
    :loading="isLoadingStudents"
    placeholder="Search by name..."
    label="displayName"
    track-by="id"
    :allow-empty="true"
  >
    <template #noResult>No students found</template>
    <template #noOptions>{{ almaError || 'Select a school first' }}</template>
  </multiselect>
  <small v-if="almaError" class="error-hint">{{ almaError }}</small>
</div>
```

---

## Data Handling

**Approach:** In-memory cache with 15-min TTL

**Reasoning:**
- Student data rarely changes mid-day
- Reduces API load on ALMA
- Fast response for dropdown population
- Simple implementation (no Redis needed)
- Cache auto-expires; fresh data on server restart

---

## Security Notes

| Concern | Solution |
|---------|----------|
| Credentials exposure | Stored in .env, accessed via config.js, never sent to frontend |
| Sensitive student data | Strip SSN, DOB, address, phone, medical, emergency contacts in almaService.js |
| Access control | Uses existing JWT auth + access_level checks |
| Logging | Log errors only, never log raw student data |

---

## Testing Checklist

### Unit Tests
- [ ] `almaService.getStudentsByBuilding()` returns formatted array
- [ ] Sensitive fields stripped from response
- [ ] Invalid building ID returns empty array
- [ ] Cache returns same data within TTL

### Mock ALMA API
```javascript
// In tests, mock axios
jest.mock('axios');
axios.get.mockResolvedValue({
  data: { response: [{ id: 1, firstName: 'Test', lastName: 'Student' }] }
});
```

### Integration Tests
- [ ] `GET /dropdown/alma-students?buildingId=1` returns students
- [ ] Unauthorized request returns 401
- [ ] Level 1 user can only access own building

### Manual E2E
1. Login -> File Report -> Select School
2. Verify dropdown populates with students
3. Search for student name -> results filter
4. Select student -> form auto-fills
5. Submit report -> verify data saved

---

## Files to Modify

| File | Action |
|------|--------|
| `server/.env` | Add ALMA_KEY and ALMA_SECRET |
| `server/package.json` | Add axios dependency |
| `server/config.js` | Create new - centralizes ALMA credentials |
| `server/services/almaService.js` | Create new - uses JOIN query for alma_school_app_id table |
| `server/controllers/dropdownController.js` | Add getAlmaStudents |
| `server/routes/dropdownRoute.js` | Add route |
| `client/src/views/FileReport.vue` | Add dropdown + logic |
| Database | `alma_school_app_id` table and `buildings.alma_app_school_id` FK (already applied) |

---

## ALMA API Reference

### URL Structure

**Pattern:**
```
https://{application}.api.getalma.com/v2/{application}/{endpoint}
```

**`{application}`** = School app ID from `alma_school_app_id` table:
- `ucisbuildinga`, `ucisbuildingb`, `ucisbuildingc`, `ucisbuildingd`, `acis`, `bcis`

**Examples:**
```
# Students for Building A
https://ucisbuildinga.api.getalma.com/v2/ucisbuildinga/students

# Cohorts for Building A
https://ucisbuildinga.api.getalma.com/v2/ucisbuildinga/cohorts

# Specific student's cohorts
https://ucisbuildinga.api.getalma.com/v2/ucisbuildinga/students/{studentId}/cohorts
```

### Required Headers

All requests must include:
```javascript
headers: {
  'Accept': 'application/json, application/problem+json',
  'Content-Type': 'application/json'
}
```

### Authentication

HTTP Digest Auth with API Key and Secret (stored in `.env`):
```bash
curl -X GET \
  --digest --user '<API_KEY>:<API_SECRET>' \
  https://ucisbuildinga.api.getalma.com/v2/ucisbuildinga/students \
  -H 'Accept: application/json, application/problem+json'
```

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /students` | List all students (supports `?status[]=Active&status[]=Locked`) |
| `GET /students/{id}` | Get single student |
| `GET /students/{id}/cohorts` | Get cohorts for a student |
| `GET /cohorts` | List all cohorts |
| `GET /cohorts/{id}` | Get single cohort |
| `GET /grade-levels` | List all grade levels |

### Production vs Development

- **Production:** `https://{app}.api.getalma.com/v2/...` (use this)
- **Development:** `https://dev.api.getalma.com/v2/...` (separate credentials)

### Test Script

Create `server/test-alma.js` to verify API connectivity and see data structure:

```javascript
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const config = {
  key: process.env.ALMA_KEY,
  secret: process.env.ALMA_SECRET
};

// Change this to test different schools
const appId = 'ucisbuildinga';

async function digestRequest(url, apiKey, apiSecret) {
  // Initial request to get nonce
  const authResponse = await axios.get(url, {
    validateStatus: () => true,
    headers: {
      'Accept': 'application/json, application/problem+json',
      'Content-Type': 'application/json'
    }
  });

  const wwwAuth = authResponse.headers['www-authenticate'];
  if (!wwwAuth || authResponse.status !== 401) {
    console.log('Response status:', authResponse.status);
    console.log('Response headers:', authResponse.headers);
    throw new Error('Expected 401 with WWW-Authenticate header');
  }

  // Parse digest challenge
  const realm = wwwAuth.match(/realm="([^"]+)"/)?.[1];
  const nonce = wwwAuth.match(/nonce="([^"]+)"/)?.[1];
  const qop = wwwAuth.match(/qop="([^"]+)"/)?.[1] || 'auth';

  const nc = '00000001';
  const cnonce = crypto.randomBytes(8).toString('hex');
  const ha1 = crypto.createHash('md5').update(`${apiKey}:${realm}:${apiSecret}`).digest('hex');
  const ha2 = crypto.createHash('md5').update(`GET:${new URL(url).pathname}`).digest('hex');
  const response = crypto.createHash('md5')
    .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`).digest('hex');

  const authHeader = `Digest username="${apiKey}", realm="${realm}", nonce="${nonce}", ` +
    `uri="${new URL(url).pathname}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}"`;

  return axios.get(url, {
    headers: {
      Authorization: authHeader,
      'Accept': 'application/json, application/problem+json',
      'Content-Type': 'application/json'
    }
  });
}

async function test() {
  try {
    // Test cohorts
    console.log('\n=== COHORTS ===');
    const cohortsUrl = `https://${appId}.api.getalma.com/v2/${appId}/cohorts`;
    console.log('URL:', cohortsUrl);
    const cohortsRes = await digestRequest(cohortsUrl, config.key, config.secret);
    console.log(JSON.stringify(cohortsRes.data, null, 2));

    // Test students (limit to 2)
    console.log('\n=== STUDENTS (first 2) ===');
    const studentsUrl = `https://${appId}.api.getalma.com/v2/${appId}/students?status[]=Active&limit=2`;
    console.log('URL:', studentsUrl);
    const studentsRes = await digestRequest(studentsUrl, config.key, config.secret);
    console.log(JSON.stringify(studentsRes.data, null, 2));

    // If we got students, test cohort lookup for first student
    const students = studentsRes.data.response || [];
    if (students.length > 0) {
      console.log('\n=== STUDENT COHORT (first student) ===');
      const studentCohortUrl = `https://${appId}.api.getalma.com/v2/${appId}/students/${students[0].id}/cohorts`;
      console.log('URL:', studentCohortUrl);
      const cohortRes = await digestRequest(studentCohortUrl, config.key, config.secret);
      console.log(JSON.stringify(cohortRes.data, null, 2));
    }

  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.status, err.response.data);
    }
  }
}

test();
```

Run with: `cd server && node test-alma.js`

---

## Phase 2: Student-Cohort Integration

### Problem Statement

- ALMA Students API returns students **without cohort info** in the response
- Getting a student's cohort requires calling `/students/{id}/cohorts` per student
- Cohorts are sub-groupings within grades (e.g., 12A, 12B, 12C)
- FileReport needs to show only students from selected building AND cohort

### Approach: On-Demand Sync with Database Cache

Fetch students from ALMA, batch-fetch their cohorts, merge into local `students` table with 30-min cache.

---

### Database Schema Updates

```sql
-- Add ALMA ID to cohorts table
ALTER TABLE cohorts ADD COLUMN alma_id VARCHAR(50) UNIQUE;

-- Add ALMA columns to existing students table
ALTER TABLE students ADD COLUMN alma_id VARCHAR(50) UNIQUE;
ALTER TABLE students ADD COLUMN alma_cohort_id VARCHAR(50);
ALTER TABLE students ADD COLUMN alma_synced_at TIMESTAMP;

-- Index for cohort filtering
CREATE INDEX idx_students_building_alma_cohort
  ON students(building_id, alma_cohort_id);
```

---

### almaService.js Updates

Add new methods to `server/services/almaService.js`:

```javascript
// 1. Sync cohorts from ALMA to local cohorts table
async function syncCohortsFromAlma(buildingId) {
  const appId = await getAlmaAppId(buildingId);
  const url = `https://${appId}.api.getalma.com/v2/${appId}/cohorts`;
  const res = await digestRequest(url, config.alma.key, config.alma.secret);

  for (const cohort of res.data.response.cohorts) {
    await pool.query(
      `INSERT INTO cohorts (name, building_id, alma_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (alma_id) DO UPDATE SET name = $1`,
      [cohort.name, buildingId, cohort.id]
    );
  }
}

// 2. Get a student's cohort from ALMA
async function getStudentCohort(appId, studentId) {
  const url = `https://${appId}.api.getalma.com/v2/${appId}/students/${studentId}/cohorts`;
  const res = await digestRequest(url, config.alma.key, config.alma.secret);
  return res.data.response?.[0]?.id || null;  // Return first cohort ID
}

// 3. Sync students with cohorts (main function)
async function syncStudentsWithCohorts(buildingId, forceRefresh = false) {
  // Check if sync needed (last sync > 30 min ago)
  const lastSync = await pool.query(
    `SELECT MAX(alma_synced_at) as last_sync FROM students WHERE building_id = $1`,
    [buildingId]
  );

  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  if (!forceRefresh && lastSync.rows[0]?.last_sync > thirtyMinAgo) {
    return; // Cache is fresh
  }

  const appId = await getAlmaAppId(buildingId);

  // Fetch all students from ALMA
  const students = await getStudentsByBuilding(buildingId);

  // Batch fetch cohorts with concurrency limit
  const pLimit = require('p-limit');
  const limit = pLimit(10);

  const studentsWithCohorts = await Promise.all(
    students.map(student =>
      limit(async () => {
        const cohortId = await getStudentCohort(appId, student.id);
        return { ...student, alma_cohort_id: cohortId };
      })
    )
  );

  // Upsert students into database
  for (const s of studentsWithCohorts) {
    await pool.query(
      `INSERT INTO students (first_name, last_name, nickname, building_id, alma_id, alma_cohort_id, alma_synced_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (alma_id) DO UPDATE SET
         first_name = $1, last_name = $2, nickname = $3,
         alma_cohort_id = $6, alma_synced_at = NOW()`,
      [s.firstName, s.lastName, s.nickname, buildingId, s.id, s.alma_cohort_id]
    );
  }
}

// 4. Get students filtered by building and cohort
async function getStudentsByBuildingAndCohort(buildingId, cohortId) {
  // Ensure data is synced
  await syncStudentsWithCohorts(buildingId);

  // Get alma_id for the cohort
  const cohort = await pool.query(
    'SELECT alma_id FROM cohorts WHERE id = $1',
    [cohortId]
  );
  const almaCohortId = cohort.rows[0]?.alma_id;

  // Query local students table
  const result = await pool.query(
    `SELECT id, first_name, last_name, nickname,
            CONCAT(last_name, ', ', first_name) as display_name
     FROM students
     WHERE building_id = $1 AND alma_cohort_id = $2`,
    [buildingId, almaCohortId]
  );

  return result.rows;
}

module.exports = {
  getStudentsByBuilding,
  syncCohortsFromAlma,
  syncStudentsWithCohorts,
  getStudentsByBuildingAndCohort
};
```

---

### dropdownController.js Updates

Update `getAlmaStudents` in `server/controllers/dropdownController.js`:

```javascript
const getAlmaStudents = async (req, res) => {
  try {
    const { access_level, building_id: userBuildingId } = req.user;
    const { buildingId: queryBuildingId, cohortId } = req.query;

    // Determine building based on access level
    let buildingId;
    if (access_level === 1) {
      buildingId = userBuildingId;
    } else if ([2, 3, 4].includes(access_level)) {
      buildingId = queryBuildingId || userBuildingId;
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!buildingId) {
      return res.status(400).json({ message: 'No building specified' });
    }

    let students;
    if (cohortId) {
      // Filter by cohort
      students = await almaService.getStudentsByBuildingAndCohort(buildingId, cohortId);
    } else {
      // All students for building
      await almaService.syncStudentsWithCohorts(buildingId);
      const result = await pool.query(
        'SELECT id, first_name, last_name, nickname FROM students WHERE building_id = $1',
        [buildingId]
      );
      students = result.rows;
    }

    res.json(students);
  } catch (err) {
    console.error('[ALMA] Error:', err.message);
    res.json([]);
  }
};
```

---

### FileReport.vue Updates

Update `searchStudents` in `client/src/views/FileReport.vue`:

```javascript
import { debounce } from 'lodash-es';

// Update searchStudents to require cohort selection
const searchStudents = async () => {
  if (fullNameSearch.value.length >= 2 && selectedBuilding.value && cohort.value) {
    try {
      const res = await api.get('/dropdown/alma-students', {
        params: {
          buildingId: selectedBuilding.value,
          cohortId: cohort.value
        }
      });

      // Filter locally by search text
      studentSearchResults.value = res.data
        .filter(s => {
          const name = `${s.first_name} ${s.last_name}`.toLowerCase();
          return name.includes(fullNameSearch.value.toLowerCase());
        })
        .map(s => ({
          id: s.id,
          name: `${s.last_name}, ${s.first_name}`,
          firstName: s.first_name,
          lastName: s.last_name,
          nickname: s.nickname
        }));

      showStudentDropdown.value = true;
    } catch (err) {
      console.error('Failed to fetch students', err);
      studentSearchResults.value = [];
    }
  } else {
    showStudentDropdown.value = false;
    studentSearchResults.value = [];
  }
};

// Debounce the search to avoid excessive API calls
const debouncedSearch = debounce(searchStudents, 300);
```

Update template to use debounced search:
```vue
<input
  type="text"
  v-model="fullNameSearch"
  @input="debouncedSearch"
  placeholder="Input text"
/>
```

---

### Install Dependency

```bash
cd server && npm install p-limit
```

---

### Data Flow Diagram

```
1. User selects Building
   └─→ fetchCohorts() → Local DB (cohorts synced from ALMA)

2. User selects Cohort
   └─→ (No action yet)

3. User types student name (2+ chars)
   └─→ GET /dropdown/alma-students?buildingId=X&cohortId=Y
       └─→ syncStudentsWithCohorts(buildingId)
           ├─→ Cache fresh (< 30 min)? Return from local DB
           └─→ Cache stale? Fetch ALMA → batch cohort lookups → upsert DB
       └─→ Query: SELECT * FROM students WHERE building_id=X AND alma_cohort_id=Y
       └─→ Return filtered students

4. User selects student from dropdown
   └─→ Auto-fill name, nickname, gender fields
```

---

### Phase 2 Files to Modify

| File | Changes |
|------|---------|
| Database migration | Add `alma_id`, `alma_cohort_id`, `alma_synced_at` to students; `alma_id` to cohorts |
| `server/services/almaService.js` | Add sync functions |
| `server/controllers/dropdownController.js` | Update `getAlmaStudents` to accept cohortId |
| `client/src/views/FileReport.vue` | Update `searchStudents` to pass cohortId, add debounce |
| `server/package.json` | Add `p-limit` dependency |

---

### Phase 2 Testing Checklist

- [ ] Run migration to add new columns
- [ ] Install p-limit: `cd server && npm install p-limit`
- [ ] Test cohort sync: Call `/dropdown/cohorts?buildingId=X` and verify `alma_id` populated
- [ ] Test student sync: Call `/dropdown/alma-students?buildingId=X&cohortId=Y`
- [ ] Verify students table has `alma_id` and `alma_cohort_id` populated
- [ ] Test FileReport end-to-end:
  - Select building → cohorts load
  - Select cohort → type name → matching students appear
  - Select student → fields auto-fill
- [ ] Test cache: Second search should be instant (no ALMA API calls in logs)

---

### Important Assumptions

- **All students come from ALMA** - there is no manual student entry in this system
- The `students` table is purely a cache of ALMA data
- `alma_id` is the authoritative identifier for all students
- On sync, students can be safely upserted without worrying about manual entries

### Performance Notes

- **First load will be slow** (~10-30 seconds for 100+ students due to cohort lookups)
- **Subsequent loads are fast** (30-min cache in database)
- **p-limit** controls concurrency (10 parallel requests max to avoid overwhelming ALMA API)
