<template>
  <div class="report-preview-container">
    <div class="preview-controls no-print">
      <button class="btn-back" @click="$router.back()">
        <Icon icon="line-md:chevron-left" /> Back to Reports
      </button>
      <div class="control-group">
        <button class="control-btn" @click="zoomOut" title="Zoom Out">
          <Icon icon="line-md:minus" /> Zoom Out
        </button>
        <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
        <button class="control-btn" @click="zoomIn" title="Zoom In">
          <Icon icon="line-md:plus" /> Zoom In
        </button>
        <button class="control-btn btn-download" @click="printReport" title="Download PDF">
          <Icon icon="line-md:download" /> Download PDF
        </button>
        <button class="control-btn btn-print" @click="printReport" title="Print">
          <Icon icon="line-md:printer" /> Print
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state no-print">
      <Icon icon="line-md:loading-loop" /> Loading report data...
    </div>

    <div class="preview-wrapper" :style="{ transform: `scale(${zoom})`, transformOrigin: 'top center' }">
      <div class="a4-page">

        <!-- Header -->
        <div class="report-header">
          <div class="school-info">
            <h1>{{ report.schoolName }}</h1>
            <span class="case-type-badge">{{ report.caseTypeName }}</span>
          </div>
          <div class="report-meta">
            <h2>{{ report.title }}</h2>
            <p>Period: {{ formatDate(report.period.from) }} &ndash; {{ formatDate(report.period.to) }}</p>
            <p>Generated: {{ formatDate(report.generatedDate) }}</p>
          </div>
        </div>

        <div class="report-content">

          <!-- Section 1: Overview -->
          <div class="section">
            <h3 class="section-title">Overview</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th class="num-col">Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Reported Cases</td>
                  <td class="num-col highlight">{{ overview.total }}</td>
                </tr>
                <tr>
                  <td>Resolved Cases</td>
                  <td class="num-col">{{ overview.resolved }}</td>
                </tr>
                <tr>
                  <td>Open Cases</td>
                  <td class="num-col">{{ overview.open }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section 2: Cases by Status -->
          <div class="section" v-if="statusData.labels.length">
            <h3 class="section-title">Cases by Status</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>School / Building</th>
                  <th v-for="s in statusData.statuses" :key="s" class="num-col">{{ s }}</th>
                  <th class="num-col total-header">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="label in statusData.labels" :key="label">
                  <td>{{ label }}</td>
                  <td v-for="s in statusData.statuses" :key="s" class="num-col">
                    {{ statusData.dataMap[label]?.[s] ?? 0 }}
                  </td>
                  <td class="num-col total-col">
                    {{ rowTotal(statusData.statuses, statusData.dataMap[label]) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section 3: Cases by Severity -->
          <div class="section" v-if="severityData.labels.length">
            <h3 class="section-title">Cases by Severity</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>School / Building</th>
                  <th v-for="sev in severityData.severities" :key="sev" class="num-col">{{ sev }}</th>
                  <th class="num-col total-header">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="label in severityData.labels" :key="label">
                  <td>{{ label }}</td>
                  <td v-for="sev in severityData.severities" :key="sev" class="num-col">
                    {{ severityData.dataMap[label]?.[sev] ?? 0 }}
                  </td>
                  <td class="num-col total-col">
                    {{ rowTotal(severityData.severities, severityData.dataMap[label]) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section 4: Cases by Gender -->
          <div class="section" v-if="genderData.labels.length">
            <h3 class="section-title">Cases by Gender</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>School / Building</th>
                  <th v-for="g in genderData.genders" :key="g" class="num-col">{{ g }}</th>
                  <th class="num-col total-header">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="label in genderData.labels" :key="label">
                  <td>{{ label }}</td>
                  <td v-for="g in genderData.genders" :key="g" class="num-col">
                    {{ genderData.dataMap[label]?.[g] ?? 0 }}
                  </td>
                  <td class="num-col total-col">
                    {{ rowTotal(genderData.genders, genderData.dataMap[label]) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Section 5+6: Categories and Specifications side-by-side -->
          <div class="section two-col-section" v-if="categories.length || subcategories.length">
            <div v-if="categories.length" class="sub-section">
              <h3 class="section-title">Top Reported Categories</h3>
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="num-col rank-col">#</th>
                    <th>Category</th>
                    <th class="num-col">%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(cat, i) in categories" :key="cat.category">
                    <td class="num-col rank-col">{{ i + 1 }}</td>
                    <td>{{ cat.category }}</td>
                    <td class="num-col">{{ formatPct(cat.percentage) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="subcategories.length" class="sub-section">
              <h3 class="section-title">Top Reported Specifications</h3>
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="num-col rank-col">#</th>
                    <th>Specification</th>
                    <th class="num-col">%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(sub, i) in subcategories" :key="sub.subcategory_name">
                    <td class="num-col rank-col">{{ i + 1 }}</td>
                    <td>{{ sub.subcategory_name }}</td>
                    <td class="num-col">{{ formatPct(sub.percentage) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Section 7: Reporters -->
          <div class="section" v-if="reporters.length">
            <h3 class="section-title">Cases Reported by Staff</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>School</th>
                  <th class="num-col">Cases Reported</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in reporters" :key="r.user_name + r.school_name">
                  <td>{{ r.user_name }}</td>
                  <td>{{ r.school_name }}</td>
                  <td class="num-col">{{ r.report_count }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div class="report-footer">
            <p>Confidential &mdash; For authorized personnel only</p>
            <p>Generated by StudentSafe Demo</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import api from '@/services/api';

interface Report {
  id: string;
  title: string;
  generatedDate: string;
  period: { from: string; to: string };
  schoolId: string;
  schoolName: string;
  caseTypeId: number;
  caseTypeName: string;
}

interface StatusPivot {
  labels: string[];
  statuses: string[];
  dataMap: Record<string, Record<string, number>>;
}

interface SeverityPivot {
  labels: string[];
  severities: string[];
  dataMap: Record<string, Record<string, number>>;
}

interface GenderPivot {
  labels: string[];
  genders: string[];
  dataMap: Record<string, Record<string, number>>;
}

const route = useRoute();
const router = useRouter();

const zoom = ref(1);
const loading = ref(true);

const report = ref<Report>({
  id: '', title: '', generatedDate: '',
  period: { from: '', to: '' },
  schoolId: '', schoolName: '',
  caseTypeId: 1, caseTypeName: ''
});

const overview = ref({ total: 0, resolved: 0, open: 0 });
const statusData = ref<StatusPivot>({ labels: [], statuses: [], dataMap: {} });
const severityData = ref<SeverityPivot>({ labels: [], severities: [], dataMap: {} });
const genderData = ref<GenderPivot>({ labels: [], genders: [], dataMap: {} });
const categories = ref<{ category: string; percentage: number }[]>([]);
const subcategories = ref<{ subcategory_name: string; percentage: number }[]>([]);
const reporters = ref<{ user_name: string; school_name: string; report_count: number }[]>([]);

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const formatPct = (val: number) => (Math.round(val * 100) / 100).toFixed(2);

const rowTotal = (keys: string[], map?: Record<string, number>) => {
  if (!map) return 0;
  return keys.reduce((sum, k) => sum + (map[k] ?? 0), 0);
};

const loadReport = (): boolean => {
  const reportId = route.params.reportId as string;
  const saved = localStorage.getItem('reports');
  if (!saved) { router.push('/report-summary'); return false; }

  const found = JSON.parse(saved).find((r: Report) => r.id === reportId);
  if (!found) { router.push('/report-summary'); return false; }

  Object.assign(report.value, found);
  return true;
};

const fetchAllData = async () => {
  const schoolId = parseInt(report.value.schoolId, 10);
  const caseTypeId = report.value.caseTypeId;
  const params = { case_type_id: caseTypeId, school_id: schoolId };

  // Determine row labels (school abbreviations or building names)
  let labels: string[] = [];
  if (schoolId === 1) {
    const res = await api.get('/schools', { params: { exclude: 1 } });
    labels = res.data.map((s: { abbreviation: string }) => s.abbreviation);
  } else {
    const res = await api.get(`/schools/${schoolId}/buildings`);
    labels = res.data.map((b: { name: string }) => b.name);
  }

  const [
    countsRes,
    statusRes,
    severityRes,
    genderRes,
    catRes,
    subCatRes,
    reportersRes
  ] = await Promise.all([
    api.get('/cases/case-counts', { params: { ...params, period: 'year' } }),
    api.get('/cases/counts-by-status', { params }),
    api.get('/cases/counts-by-severity', { params }),
    api.get('/cases/counts-by-gender', { params }),
    api.get('/cases/top-categories', { params }),
    api.get('/cases/top-sub-categories', { params }),
    api.get('/cases/reporters', { params })
  ]);

  // Overview
  const { totals } = countsRes.data;
  overview.value = {
    total: totals.total_cases,
    resolved: totals.total_resolved,
    open: totals.total_open
  };

  // Status pivot
  const rawStatus: { label: string; status: string; case_count: unknown }[] = statusRes.data;
  const statuses = Array.from(new Set(rawStatus.map(d => d.status)));
  const statusMap: Record<string, Record<string, number>> = {};
  rawStatus.forEach(d => {
    if (!statusMap[d.label]) statusMap[d.label] = {};
    statusMap[d.label][d.status] = Number(d.case_count);
  });
  statusData.value = { labels, statuses, dataMap: statusMap };

  // Severity pivot
  const rawSev: { label: string; name: string; case_count: unknown }[] = severityRes.data;
  const severities = Array.from(new Set(rawSev.map(d => d.name)));
  const sevMap: Record<string, Record<string, number>> = {};
  rawSev.forEach(d => {
    if (!sevMap[d.label]) sevMap[d.label] = {};
    sevMap[d.label][d.name] = Number(d.case_count);
  });
  severityData.value = { labels, severities, dataMap: sevMap };

  // Gender pivot — API uses `name` for building/school and `label` for gender
  const rawGender: { name: string; label: string; case_count: unknown }[] = genderRes.data;
  const genders = Array.from(new Set(rawGender.map(d => d.label)));
  const genderMap: Record<string, Record<string, number>> = {};
  rawGender.forEach(d => {
    if (!genderMap[d.name]) genderMap[d.name] = {};
    genderMap[d.name][d.label] = Number(d.case_count);
  });
  genderData.value = { labels, genders, dataMap: genderMap };

  // Categories & subcategories
  categories.value = catRes.data;
  subcategories.value = subCatRes.data;

  // Reporters
  reporters.value = reportersRes.data;
};

onMounted(async () => {
  const ok = loadReport();
  if (!ok) return;
  try {
    await fetchAllData();
  } catch (err) {
    console.error('Failed to load report data:', err);
  } finally {
    loading.value = false;
  }
});

const zoomIn = () => { if (zoom.value < 2) zoom.value = Math.round((zoom.value + 0.1) * 10) / 10; };
const zoomOut = () => { if (zoom.value > 0.5) zoom.value = Math.round((zoom.value - 0.1) * 10) / 10; };
const printReport = () => window.print();
</script>

<style scoped>
/* ── Screen controls ─────────────────────────────── */
.report-preview-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.preview-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.btn-back {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.btn-download { background: #27ae60; }
.btn-print    { background: #95a5a6; }

.zoom-level {
  min-width: 50px;
  text-align: center;
  font-weight: 500;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-size: 16px;
}

/* ── Page layout ─────────────────────────────────── */
.preview-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.a4-page {
  width: 210mm;
  min-height: 297mm;
  background: white;
  padding: 18mm 20mm;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 11pt;
  color: #1a1a2e;
}

/* ── Report header ───────────────────────────────── */
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 2px solid #0a3186;
}

.school-info h1 {
  font-size: 18pt;
  font-weight: 700;
  color: #0a3186;
  margin: 0 0 6px 0;
}

.case-type-badge {
  display: inline-block;
  background: #e8eef9;
  color: #0a3186;
  border: 1px solid #b3c4e8;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 9pt;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.report-meta {
  text-align: right;
}

.report-meta h2 {
  font-size: 13pt;
  font-weight: 600;
  color: #0a3186;
  margin: 0 0 4px 0;
}

.report-meta p {
  margin: 2px 0;
  font-size: 9pt;
  color: #555;
}

/* ── Content sections ────────────────────────────── */
.report-content {
  margin-top: 10px;
}

.section {
  margin-bottom: 22px;
}

.section-title {
  font-size: 11pt;
  font-weight: 700;
  color: #0a3186;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 8px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid #c9d5ef;
}

/* ── Two-column layout for categories ───────────── */
.two-col-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.sub-section {
  min-width: 0;
}

/* ── Tables ──────────────────────────────────────── */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9.5pt;
}

.data-table th {
  background: #0a3186;
  color: white;
  padding: 7px 10px;
  text-align: left;
  font-weight: 600;
  font-size: 9pt;
}

.data-table td {
  padding: 6px 10px;
  border-bottom: 1px solid #e8ecf5;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:nth-child(even) {
  background: #f5f7fc;
}

.num-col {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.rank-col {
  width: 30px;
  color: #888;
  font-size: 8.5pt;
}

.highlight {
  font-weight: 700;
  color: #0a3186;
}

.total-col {
  font-weight: 700;
  background: #e8eef9 !important;
}

.total-header {
  background: #08277a !important;
}

/* ── Footer ──────────────────────────────────────── */
.report-footer {
  margin-top: 30px;
  padding-top: 10px;
  border-top: 1px solid #c9d5ef;
  text-align: center;
  font-size: 8pt;
  color: #888;
}

.report-footer p {
  margin: 2px 0;
}

/* ── Print styles (scoped — hides controls inside this component) ── */
@media print {
  .no-print { display: none !important; }
  .report-preview-container { padding: 0; background: white; }
  .preview-wrapper { padding: 0; transform: none !important; }
  .a4-page { box-shadow: none; width: 100%; min-height: auto; padding: 15mm 18mm; }
}
</style>

<!-- Non-scoped: reaches sidebar and app shell which live outside this component -->
<style>
@media print {
  .sidebar { display: none !important; }
  #app { display: block !important; }
  .main-content { padding: 0 !important; overflow: visible !important; height: auto !important; }
}

.metrics-grid{
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  width: 100%;
}

.metrics-grid > * {
  min-width: 0;
}
</style>
