const axios = require('axios');
const crypto = require('crypto');
const pool = require('../db');
const config = require('../config');

// When true, no network calls to Alma are made anywhere in this module.
// Both getStudentsByBuilding and syncAllStudents fall back to whatever is
// already sitting in the (seeded) alma_students table instead.
const DEMO_MODE = process.env.DEMO_MODE === 'true';

// Look up Alma App ID from DB building ID
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

// In-memory cache for getStudentsByBuilding (15 min TTL)
const cache = { data: {}, TTL: 15 * 60 * 1000 };

// Fields to strip from Alma responses before caching (legacy dropdown use)
const SENSITIVE_FIELDS = [
  'ssn', 'dob', 'dateOfBirth', 'address', 'phone',
  'emergencyContact', 'medicalRecords', 'parentEmail', 'parentPhone',
];

// ---------------------------------------------------------------------------
// HTTP Digest Auth helper
// Matches the working pattern from test-alma.js:
//   - URI includes query string (pathname + search) for correct HA2
//   - opaque header included when present
//   - Accept headers sent on both requests
// ---------------------------------------------------------------------------
async function digestRequest(url, apiKey, apiSecret) {
  // Step 1: unauthenticated probe to obtain the WWW-Authenticate challenge
  const authResponse = await axios.get(url, {
    validateStatus: () => true,
    timeout: 10000,
    headers: {
      'Accept': 'application/json, application/problem+json',
      'Content-Type': 'application/json',
    },
  });

  const wwwAuth = authResponse.headers['www-authenticate'];
  if (!wwwAuth || authResponse.status !== 401) {
    throw new Error(
      `Expected 401 with WWW-Authenticate header, got ${authResponse.status}`
    );
  }

  // Step 2: Parse digest challenge fields
  const realm  = wwwAuth.match(/realm="([^"]+)"/)?.[1];
  const nonce  = wwwAuth.match(/nonce="([^"]+)"/)?.[1];
  // qop may be a comma-separated list ("auth,auth-int") — take the first value
  const qopRaw = wwwAuth.match(/qop="([^"]+)"/)?.[1] || 'auth';
  const qop    = qopRaw.split(',')[0].trim();
  const opaque = wwwAuth.match(/opaque="([^"]+)"/)?.[1];

  // Step 3: Compute digest response
  // URI must include the query string so HA2 matches what the server expects
  const urlObj = new URL(url);
  const uri    = urlObj.pathname + urlObj.search;

  const nc     = '00000001';
  const cnonce = crypto.randomBytes(8).toString('hex');
  const ha1 = crypto.createHash('md5')
    .update(`${apiKey}:${realm}:${apiSecret}`).digest('hex');
  const ha2 = crypto.createHash('md5')
    .update(`GET:${uri}`).digest('hex');
  const response = crypto.createHash('md5')
    .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`).digest('hex');

  let authHeader =
    `Digest username="${apiKey}", realm="${realm}", nonce="${nonce}", ` +
    `uri="${uri}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}"`;
  if (opaque) {
    authHeader += `, opaque="${opaque}"`;
  }

  // Step 4: Authenticated request
  return axios.get(url, {
    timeout: 10000,
    headers: {
      Authorization: authHeader,
      'Accept': 'application/json, application/problem+json',
      'Content-Type': 'application/json',
    },
  });
}

// ---------------------------------------------------------------------------
// Existing helper: used by the legacy getStudentsByBuilding dropdown endpoint
// ---------------------------------------------------------------------------
function sanitize(student) {
  const clean = { ...student };
  SENSITIVE_FIELDS.forEach((f) => delete clean[f]);
  return clean;
}

function transform(students) {
  return students.map((s) => ({
    id: s.id || s.studentId,
    displayName: `${s.lastName || s.last_name}, ${s.firstName || s.first_name}`,
    firstName: s.firstName || s.first_name,
    lastName: s.lastName || s.last_name,
    nickname: s.nickname || null,
    gradeLevel: s.gradeLevel || s.grade_level || null,
  }));
}

async function getStudentsByBuilding(buildingId) {
  if (DEMO_MODE) {
    return getStudentsByBuildingDemo(buildingId);
  }

  const appId = await getAlmaAppId(buildingId);
  if (!appId) return [];

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

// Demo-mode replacement for getStudentsByBuilding: reads the already-seeded
// alma_students table instead of calling the real Alma API. Same cache and
// response shape as the live path so callers don't need to know the difference.
async function getStudentsByBuildingDemo(buildingId) {
  const appId = await getAlmaAppId(buildingId);
  if (!appId) return [];

  const cached = cache.data[appId];
  if (cached && Date.now() - cached.ts < cache.TTL) {
    return cached.students;
  }

  const result = await pool.query(
    `SELECT alma_student_id AS id, first_name, last_name, preferred_name AS nickname, cohort AS grade_level
     FROM alma_students
     WHERE application_id = $1 AND is_active = TRUE
     ORDER BY last_name, first_name`,
    [appId]
  );

  const students = transform(result.rows.map(sanitize));
  cache.data[appId] = { students, ts: Date.now() };
  return students;
}

// ---------------------------------------------------------------------------
// Sync helpers: fetch tags and nationality for individual students
// ---------------------------------------------------------------------------
async function fetchStudentTags(appId, studentId) {
  const url = `https://${appId}.api.getalma.com/v2/${appId}/students/${studentId}/tags`;
  const res = await digestRequest(url, config.alma.key, config.alma.secret);
  const data = res.data;
  // alma-data-export.json shows the tags array lives at data.tags
  // Guard against variations: data.tags, data.response.tags, data.response (array)
  const tags = data?.tags || data?.response?.tags || data?.response || [];
  return Array.isArray(tags) ? tags : [];
}

async function fetchStudentNationality(appId, studentId) {
  const fieldId = process.env.CUSTOM_FIELD_API_NATIONALITY;
  if (!fieldId) return null;

  // TODO: Confirm exact response JSON structure for the custom-fields endpoint.
  //       Returning null gracefully until confirmed.
  const url = `https://${appId}.api.getalma.com/v2/${appId}/students/${studentId}/custom-fields/${fieldId}`;
  const res = await digestRequest(url, config.alma.key, config.alma.secret);
  const data = res.data;
  const r = data?.response || data;
  // Try common Alma API value patterns
  return r?.value ?? r?.values?.[0] ?? r?.name ?? null;
}

// Fetch all students (with tags + nationality) for one Alma application
async function fetchAllStudentsForApp(appId) {
  const url = `https://${appId}.api.getalma.com/v2/${appId}/students?status[]=Active`;
  console.log(`[Alma Sync] ${appId}: requesting student list...`);
  const res = await digestRequest(url, config.alma.key, config.alma.secret);
  const students = res.data.response || res.data || [];
  console.log(`[Alma Sync] ${appId}: ${students.length} students returned, fetching tags...`);

  const result = [];
  for (const [i, student] of students.entries()) {
    if (i > 0 && i % 10 === 0) {
      console.log(`[Alma Sync] ${appId}: processed ${i}/${students.length} students`);
    }
    // Fetch tags and nationality concurrently (2 requests per student in parallel)
    const [tags, nationality] = await Promise.all([
      fetchStudentTags(appId, student.id),
      fetchStudentNationality(appId, student.id),
    ]);

    // Cohort = first tag's name (if any)
    // Note: tags[0]["name"] — only the first tag is used; tag IDs are not stored
    const cohort = tags.length > 0 ? tags[0].name || null : null;

    // Build full_name: include middleName only when non-blank
    const middleName =
      student.middleName && student.middleName.trim() !== ''
        ? student.middleName.trim()
        : null;
    const fullName = middleName
      ? `${student.firstName} ${middleName} ${student.lastName}`
      : `${student.firstName} ${student.lastName}`;

    result.push({
      alma_student_id: student.id,
      first_name:      student.firstName  || '',
      middle_name:     middleName,
      last_name:       student.lastName   || '',
      preferred_name:  student.preferredName || null,
      gender:          student.gender     || null,
      cohort,
      nationality,
      full_name:       fullName,
    });
  }
  return result;
}

// ---------------------------------------------------------------------------
// syncAllStudents — main sync entry point
//
// Atomic rule: ALL data is fetched into memory from ALL six applications
// before any DB write occurs. If ANY fetch fails the existing table is left
// completely untouched and the sync_log is marked 'failed'.
// ---------------------------------------------------------------------------
async function syncAllStudents(triggeredBy, schoolId) {
  if (DEMO_MODE) {
    return syncAllStudentsDemo(triggeredBy, schoolId);
  }

  // Record sync attempt
  const logResult = await pool.query(
    `INSERT INTO sync_logs (triggered_by) VALUES ($1) RETURNING id`,
    [triggeredBy]
  );
  const logId = logResult.rows[0].id;

  // Load app IDs and building info for the selected school
  const appMappingResult = await pool.query(
    `SELECT a.school_app_id, b.name AS building_name, b.school_id
     FROM alma_school_app_id a
     JOIN buildings b ON b.alma_app_school_id = a.id
     WHERE b.school_id = $1`,
    [schoolId]
  );

  if (appMappingResult.rows.length === 0) {
    const safeMsg = `No Alma app IDs found for school ID ${schoolId}`;
    await pool.query(
      `UPDATE sync_logs SET completed_at = NOW(), status = 'failed', error_message = $1 WHERE id = $2`,
      [safeMsg, logId]
    );
    throw new Error(safeMsg);
  }

  const appIds = appMappingResult.rows.map((r) => r.school_app_id);
  const appMapping = {};
  for (const row of appMappingResult.rows) {
    appMapping[row.school_app_id] = {
      building_name: row.building_name,
      school_id:     row.school_id,
    };
  }
  console.log(`[Alma Sync] School ${schoolId} — app IDs:`, appIds);

  // Phase 1 — Fetch all data (abort everything on first error)
  let allStudents = [];
  try {
    for (const appId of appIds) {
      console.log(`[Alma Sync] Starting app: ${appId}`);
      const appStudents = await fetchAllStudentsForApp(appId);
      console.log(`[Alma Sync] ${appId}: done — ${appStudents.length} students ready`);
      const { building_name = null, school_id = null } = appMapping[appId] || {};
      allStudents = allStudents.concat(
        appStudents.map((s) => ({ ...s, application_id: appId, building_name, school_id }))
      );
    }
    console.log(`[Alma Sync] Phase 1 complete — ${allStudents.length} total students`);
  } catch (err) {
    // Redact stack trace from stored message; log full error server-side
    console.error('[Alma Sync] Fetch phase error:', err);
    const safeMsg = `Data collection failed: ${String(err.message).substring(0, 300)}`;
    await pool.query(
      `UPDATE sync_logs
       SET completed_at = NOW(), status = 'failed', error_message = $1
       WHERE id = $2`,
      [safeMsg, logId]
    );
    throw new Error(safeMsg);
  }

  // Phase 2 — Atomic DB write (transaction)
  console.log('[Alma Sync] Phase 2 starting — writing to DB...');
  const client = await pool.connect();
  let added = 0, updated = 0, deactivated = 0;

  try {
    await client.query('BEGIN');

    // Load existing rows for this school's apps so we can detect deactivations
    const existingResult = await client.query(
      `SELECT alma_student_id, application_id
       FROM alma_students
       WHERE application_id = ANY($1)`,
      [appIds]
    );

    // Build lookup: appId -> Set of existing alma_student_ids
    const existingByApp = {};
    for (const row of existingResult.rows) {
      if (!existingByApp[row.application_id]) {
        existingByApp[row.application_id] = new Set();
      }
      existingByApp[row.application_id].add(row.alma_student_id);
    }

    // Track which student IDs we actually saw in the API response
    const seenByApp = {};

    for (const student of allStudents) {
      const { application_id: appId, alma_student_id } = student;

      if (!seenByApp[appId]) seenByApp[appId] = new Set();
      seenByApp[appId].add(alma_student_id);

      const isExisting = existingByApp[appId]?.has(alma_student_id);

      if (isExisting) {
        await client.query(
          `UPDATE alma_students
           SET full_name      = $1,
               first_name     = $2,
               middle_name    = $3,
               last_name      = $4,
               preferred_name = $5,
               gender         = $6,
               cohort         = $7,
               nationality    = $8,
               building_name  = $9,
               school_id      = $10,
               is_active      = TRUE,
               last_synced_at = NOW()
           WHERE alma_student_id = $11 AND application_id = $12`,
          [
            student.full_name, student.first_name, student.middle_name,
            student.last_name, student.preferred_name, student.gender,
            student.cohort, student.nationality,
            student.building_name, student.school_id,
            alma_student_id, appId,
          ]
        );
        updated++;
      } else {
        await client.query(
          `INSERT INTO alma_students
             (alma_student_id, application_id, full_name, first_name, middle_name,
              last_name, preferred_name, gender, cohort, nationality,
              building_name, school_id, enrollment_date, is_active, last_synced_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NULL,TRUE,NOW())`,
          [
            alma_student_id, appId, student.full_name, student.first_name,
            student.middle_name, student.last_name, student.preferred_name,
            student.gender, student.cohort, student.nationality,
            student.building_name, student.school_id,
          ]
        );
        added++;
      }
    }

    // Deactivate students present in DB but absent from the API response
    for (const [appId, existingIds] of Object.entries(existingByApp)) {
      const seen = seenByApp[appId] || new Set();
      for (const studentId of existingIds) {
        if (!seen.has(studentId)) {
          await client.query(
            `UPDATE alma_students
             SET is_active = FALSE, last_synced_at = NOW()
             WHERE alma_student_id = $1 AND application_id = $2`,
            [studentId, appId]
          );
          deactivated++;
        }
      }
    }

    await client.query('COMMIT');
    console.log(`[Alma Sync] DB commit done — added: ${added}, updated: ${updated}, deactivated: ${deactivated}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Alma Sync] DB write error:', err);
    const safeMsg = `Database write failed: ${String(err.message).substring(0, 300)}`;
    await pool.query(
      `UPDATE sync_logs
       SET completed_at = NOW(), status = 'failed', error_message = $1
       WHERE id = $2`,
      [safeMsg, logId]
    );
    throw new Error(safeMsg);
  } finally {
    client.release();
  }

  // Mark sync as successful
  await pool.query(
    `UPDATE sync_logs
     SET completed_at     = NOW(),
         status           = 'success',
         records_added    = $1,
         records_updated  = $2,
         records_deactivated = $3
     WHERE id = $4`,
    [added, updated, deactivated, logId]
  );

  return { added, updated, deactivated, logId };
}

// Demo-mode replacement for syncAllStudents: there is no real Alma to sync
// from, so this just logs a no-op "success" against whatever is already
// seeded in alma_students, so the admin sync-log screen still works.
async function syncAllStudentsDemo(triggeredBy, schoolId) {
  const logResult = await pool.query(
    `INSERT INTO sync_logs (triggered_by) VALUES ($1) RETURNING id`,
    [triggeredBy]
  );
  const logId = logResult.rows[0].id;

  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM alma_students WHERE school_id = $1 AND is_active = TRUE`,
    [schoolId]
  );
  const count = rows[0]?.count || 0;

  await pool.query(
    `UPDATE sync_logs
     SET completed_at = NOW(),
         status = 'success',
         records_added = 0,
         records_updated = $1,
         records_deactivated = 0,
         error_message = 'Demo mode: using seeded data, no live Alma call made.'
     WHERE id = $2`,
    [count, logId]
  );

  // Also clear the getStudentsByBuilding cache so a "sync" visibly does something.
  cache.data = {};

  return { added: 0, updated: count, deactivated: 0, logId };
}

module.exports = {
  getStudentsByBuilding,
  syncAllStudents,
};
