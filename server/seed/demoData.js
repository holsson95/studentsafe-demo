// server/seed/demoData.js
//
// Wipes and repopulates the demo database with fully fictional data.
// Run manually against the demo DB only — never against production:
//
//   node server/seed/demoData.js
//
// Requires server/.env to point at the demo database.

const bcrypt = require('bcrypt');
const pool = require('../db');

const DEMO_PASSWORD = 'DemoPass123!';

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Clearing existing data...');
    // Truncate child/log tables first, then core tables, restarting identities
    // so seeded IDs are predictable. CASCADE handles FK-dependent rows.
    await client.query(`
      TRUNCATE TABLE
        notifications, audit_logs, case_status_history,
        case_files, case_subcategories, case_shares,
        tp_shares, tp_acad_support, tp_concerns, tp_emotional_support,
        tp_follow_up, tp_long_term_goals, tp_metrics, tp_parental_involvement,
        tp_peer_interaction, tp_short_term_goals, tp_skill_dev, treatment_plan,
        sn_shares, sn_actions_taken, sn_outcome, sn_future_actions,
        sn_people_present, session_notes,
        cases, students, alma_students, sync_logs,
        subcategories, categories, cohorts, nationalities,
        users, school_domains, buildings, alma_school_app_id, schools
      RESTART IDENTITY CASCADE
    `);

    console.log('Seeding schools...');
    const { rows: schools } = await client.query(`
      INSERT INTO schools (name, abbreviation) VALUES
        ('All Schools', 'ALL'),
        ('Example International School', 'EIS')
      RETURNING id
    `);
    const [allSchoolsId, schoolId] = schools.map(r => r.id);

    console.log('Seeding Alma app lookup + buildings...');
    const { rows: almaApps } = await client.query(`
      INSERT INTO alma_school_app_id (school_app_id) VALUES
        ('demobuildinga'),
        ('demobuildingb')
      RETURNING id
    `);
    const [almaAppA, almaAppB] = almaApps.map(r => r.id);

    const { rows: buildings } = await client.query(
      `INSERT INTO buildings (name, school_id, alma_app_school_id) VALUES
        ('Primary Campus', $1, $2),
        ('Secondary Campus', $1, $3)
       RETURNING id`,
      [schoolId, almaAppA, almaAppB]
    );
    const [buildingA, buildingB] = buildings.map(r => r.id);

    console.log('Seeding cohorts...');
    const { rows: cohorts } = await client.query(
      `INSERT INTO cohorts (name, building_id, alma_tag) VALUES
        ('Grade 6', $1, 'Grade 6'),
        ('Grade 7', $1, 'Grade 7'),
        ('Grade 10', $2, 'Grade 10'),
        ('Grade 11', $2, 'Grade 11')
       RETURNING id`,
      [buildingA, buildingB]
    );
    const [cohort6, cohort7, cohort10, cohort11] = cohorts.map(r => r.id);

    console.log('Seeding nationalities...');
    const { rows: nationalities } = await client.query(`
      INSERT INTO nationalities (name) VALUES
        ('American'), ('British'), ('Thai'), ('Australian'), ('Canadian')
      RETURNING id
    `);
    const [natUS, natUK, natTH, natAU, natCA] = nationalities.map(r => r.id);

    console.log('Seeding case_type, severity, sex lookups...');
    // id 3 is a catch-all sentinel used by filter queries — keep it present.
    const { rows: caseTypes } = await client.query(`
      INSERT INTO case_type (name) VALUES
        ('Academic'), ('Wellbeing'), ('General')
      RETURNING id
    `);
    const [typeAcademic, typeWellbeing, typeGeneral] = caseTypes.map(r => r.id);

    const { rows: severities } = await client.query(`
      INSERT INTO severity (name) VALUES ('LOW'), ('MEDIUM'), ('HIGH')
      RETURNING id
    `);
    const [sevLow, sevMed, sevHigh] = severities.map(r => r.id);

    await client.query(`
      INSERT INTO sex (label) VALUES ('Male'), ('Female'), ('Prefer not to say')
    `);

    console.log('Seeding categories + subcategories...');
    const { rows: categories } = await client.query(
      `INSERT INTO categories (name, case_type_id, is_active) VALUES
        ('Academic Performance', $1, true),
        ('Attendance', $1, true),
        ('Peer Relationships', $2, true),
        ('Emotional Wellbeing', $2, true)
       RETURNING id`,
      [typeAcademic, typeWellbeing]
    );
    const [catAcademic, catAttendance, catPeer, catEmotional] = categories.map(r => r.id);

    const subcategorySeed = [
      ['Falling grades', catAcademic, typeAcademic],
      ['Missed assignments', catAcademic, typeAcademic],
      ['Frequent absences', catAttendance, typeAcademic],
      ['Conflict with peers', catPeer, typeWellbeing],
      ['Anxiety', catEmotional, typeWellbeing],
    ];
    const subcategories = [];
    for (const [name, category_id, case_type_id] of subcategorySeed) {
      const { rows } = await client.query(
        `INSERT INTO subcategories (name, category_id, case_type_id, is_active)
         VALUES ($1, $2, $3, true) RETURNING id`,
        [name, category_id, case_type_id]
      );
      subcategories.push(rows[0]);
    }

    console.log('Seeding school_domains (for Google SSO demo)...');
    await client.query(
      `INSERT INTO school_domains (domain, school_id) VALUES ($1, $2)`,
      ['example-school-demo.org', schoolId]
    );

    console.log('Seeding demo users (one per access level)...');
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const demoUsers = [
      { name: 'Ava AppAdmin',   email: 'appadmin@demo.local',   role: 'admin',      access_level: 0, building_id: null,     is_admin: true  },
      { name: 'Cara Counselor', email: 'counselor@demo.local',  role: 'counselor',  access_level: 1, building_id: buildingA, is_admin: false },
      { name: 'Cole Coordinator', email: 'coordinator@demo.local', role: 'coordinator', access_level: 2, building_id: null, is_admin: false },
      { name: 'Dana District',  email: 'district@demo.local',   role: 'district',   access_level: 3, building_id: null,     is_admin: false },
      { name: 'Tom Teacher',    email: 'teacher@demo.local',    role: 'teacher',    access_level: 4, building_id: buildingA, is_admin: false },
    ];

    const userIds = {};
    for (const u of demoUsers) {
      const { rows } = await client.query(
        `INSERT INTO users (name, email, password_hash, role, school_id, building_id, access_level, is_active, is_admin, failed_login_attempts)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, 0)
         RETURNING id`,
        [u.name, u.email, passwordHash, u.role, schoolId, u.building_id, u.access_level, u.is_admin]
      );
      userIds[u.role] = rows[0].id;
    }

    console.log('Seeding students...');
    const studentRows = [
      ['Alex', 'Demo', 'Al', cohort6, natUS],
      ['Sam', 'Example', 'Sammy', cohort6, natTH],
      ['Jordan', 'Fictional', null, cohort7, natUK],
      ['Riley', 'Placeholder', 'Ry', cohort7, natAU],
      ['Casey', 'Sample', null, cohort10, natCA],
      ['Morgan', 'Testcase', 'Mo', cohort10, natUS],
      ['Taylor', 'Mockdata', null, cohort11, natTH],
      ['Jamie', 'Notreal', 'Jam', cohort11, natUK],
    ];
    const studentIds = [];
    for (const [first_name, last_name, nickname, cohort, nationality_id] of studentRows) {
      const { rows } = await client.query(
        `INSERT INTO students (school_id, building_id, first_name, last_name, nickname, cohort, nationality_id, entry_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE - INTERVAL '1 year')
         RETURNING id`,
        [schoolId, cohort === cohort6 || cohort === cohort7 ? buildingA : buildingB,
         first_name, last_name, nickname, cohort, nationality_id]
      );
      studentIds.push(rows[0].id);
    }

    console.log('Seeding cases...');
    const caseSeed = [
      { student: 0, category: catAcademic, sub: 0, type: typeAcademic, sev: sevMed,  status: 'in progress', reason: 'Grades have dropped noticeably this term.' },
      { student: 1, category: catAttendance, sub: 2, type: typeAcademic, sev: sevLow,  status: 'resolved',    reason: 'Several unexplained absences in the past month.' },
      { student: 2, category: catPeer, sub: 3, type: typeWellbeing, sev: sevMed,  status: 'on hold',     reason: 'Ongoing conflict with a group of classmates.' },
      { student: 3, category: catEmotional, sub: 4, type: typeWellbeing, sev: sevHigh, status: 'in progress', reason: 'Reports of persistent anxiety before exams.' },
      { student: 4, category: catAcademic, sub: 1, type: typeAcademic, sev: sevLow,  status: 'resolved',    reason: 'Missing several homework submissions.' },
    ];
    for (const c of caseSeed) {
      const { rows } = await client.query(
        `INSERT INTO cases (
           first_name, last_name, nickname, cohort, nationality_id, reason, status,
           category_id, entry_date, created_by, building_id, school_id, case_type_id,
           severity_id, student_id, privacy_policy_acknowledged, privacy_policy_acknowledged_at,
           created_at
         )
         SELECT first_name, last_name, nickname, cohort, nationality_id, $2, $3,
                $4, CURRENT_DATE - (random() * 60)::int, $5, building_id, school_id, $6,
                $7, id, true, NOW(), NOW() - (random() * 60 || ' days')::interval
         FROM students WHERE id = $1
         RETURNING id`,
        [studentIds[c.student], c.reason, c.status, c.category, userIds.counselor, c.type, c.sev]
      );
      const caseId = rows[0].id;

      await client.query(
        `INSERT INTO case_subcategories (case_id, subcategory_id) VALUES ($1, $2)`,
        [caseId, subcategories[c.sub].id]
      );

      await client.query(
        `INSERT INTO case_status_history (case_id, changed_by, old_status, new_status, comment)
         VALUES ($1, $2, NULL, $3, 'Case opened.')`,
        [caseId, userIds.counselor, c.status]
      );
    }

    console.log('Seeding alma_students (mock synced data)...');
    for (let i = 0; i < studentRows.length; i++) {
      const [first_name, last_name] = studentRows[i];
      await client.query(
        `INSERT INTO alma_students (
           alma_student_id, application_id, full_name, first_name, last_name,
           preferred_name, gender, cohort, nationality, is_active, building_name, school_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, $11)`,
        [
          `demo-${i + 1}`, 'demobuildinga', `${first_name} ${last_name}`, first_name, last_name,
          null, i % 2 === 0 ? 'Female' : 'Male', 'Grade 6', 'American', 'Primary Campus', schoolId,
        ]
      );
    }

    await client.query(
      `INSERT INTO sync_logs (status, records_updated, records_added, records_deactivated, triggered_by, completed_at)
       VALUES ('success', 0, $1, 0, 'seed-script', NOW())`,
      [studentRows.length]
    );

    console.log('Seeding a couple of notifications...');
    await client.query(
      `INSERT INTO notifications (receiver_id, message, created_by_id, type, is_read)
       VALUES ($1, 'Welcome to the StudentSafe demo — this is a sample notification.', NULL, 'event', false)`,
      [userIds.counselor]
    );

    await client.query('COMMIT');
    console.log(`Done. Demo login: any of ${demoUsers.map(u => u.email).join(', ')} / password "${DEMO_PASSWORD}"`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed, rolled back:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
