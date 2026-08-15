<template>
  <div class="student-page">
    <!-- Top Student Info Card -->
    <div class="student-info-card">
      <div class="info-row top-row">
        <div class="info-col">
          <div class="label"><strong>Name</strong></div>
          <div class="value large">{{ student.name }}</div>
        </div>
        <div class="info-col">
          <div class="label"><strong>Nickname</strong></div>
          <div class="value large">{{ student.nickname }}</div>
        </div>
      </div>
      <hr />
      <div class="info-row bottom-row">
        <div class="info-col">
          <div class="label"><strong>Cohort</strong></div>
          <div class="value">{{ student.cohort }}</div>
        </div>
        <div class="info-col">
          <div class="label"><strong>Nationality</strong></div>
          <div class="value">{{ student.nationality }}</div>
        </div>
        <div class="info-col">
          <div class="label"><strong>School</strong></div>
          <div class="value">{{ student.school || "-"}}</div>
        </div>
        <div class="info-col">
          <div class="label"><strong>Student Status</strong></div>
          <div class="value">{{ student.status || "-"}}</div>
        </div>          
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <div
        v-for="tab in tabs"
        :key="tab"
        class="tab"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </div>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 'Case Reports'" class="case-reports-section">
      <div class="table-header case-columns">
        <!-- <div>Case No.</div> -->
        <div @click="sortTable('case','severity')">
            Severity
          <span v-if="caseSort.key === 'severity'">
            <Icon :icon="caseSort.direction === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'" class="sort-icon"/>
          </span>
        </div>
        <div @click="sortTable('case', 'category')">
          Category
        <span v-if="caseSort.key === 'category'">
            <Icon :icon="caseSort.direction === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'" class="sort-icon"/>
          </span>
        </div>
        <div @click="sortTable('case','status')">
          Status
        <span v-if="caseSort.key === 'status'">
            <Icon :icon="caseSort.direction === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'" class="sort-icon"/>
          </span>
        </div>
        <div @click="sortTable('case','date')">
            Date
          <span v-if="caseSort.key === 'date'">
            <Icon :icon="caseSort.direction === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'" class="sort-icon"/>
          </span>
        </div>
        <div @click="sortTable('case', 'submitted-by')">
          Submitted by
        <span v-if="caseSort.key === 'submitted-by'">
            <Icon :icon="caseSort.direction === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'" class="sort-icon"/>
          </span>
        </div>
        <!-- <div>Session Notes</div> -->
        <div></div>
      </div>

      <div
        class="table-row case-columns"
        v-for="(report, index) in sortedCaseReports"
        :key="index"
      >
        <!-- <div>{{ report.caseNo }}</div> -->
        <div>
          <span class="severity-pill" :class="report.severity.toLowerCase()">
            {{ report.severity }}
          </span>
        </div>
        <div>{{ report.category }}</div>
        <div>{{ report.status }}</div>
        <div>{{ report.date }}</div>
        <div>{{ report.submittedBy }}</div>
        <!-- <div>{{ report.sessionNoteDate }}</div> -->
        <div><router-link :to="{ name: 'CaseDetails', params: { caseId: Number(report.caseNo) }}" class="more-link" >more</router-link></div>
      </div>
    </div>
    <!-- Medical Records Tab -->
    <div v-if="activeTab === 'Medical Records'" class="medical-records-section">
    <div class="record-header">
        <h3></h3>
        <div class="record-actions">
        <button class="btn secondary">
            <Icon icon="line-md:upload" class="icon-upload"></Icon> Upload Session Notes
        </button>
        <button class="btn primary"
        @click="goToTreatmentPlan">
            <Icon icon="line-md:document-add" class="icon-sliders"></Icon> Create Treatment Plan
        </button>
        </div>
    </div>

    <div class="table-header medical-columns">
        <div @click="sortTable('medical', 'date')">
            Date
          <span v-if="medicalSort.key === 'date'">
            <Icon :icon="medicalSort.direction === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'" class="sort-icon"/>
          </span>
        </div>
        <div @click="sortTable('medical', 'title')">
          Title / Filename
          <span v-if="medicalSort.key === 'title'">
            <Icon :icon="medicalSort.direction === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'" class="sort-icon"/>
          </span>
        </div>
        <div @click="sortTable('medical', 'created-by')">
          Created by
          <span v-if="medicalSort.key === 'created-by'">
            <Icon :icon="medicalSort.direction === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'" class="sort-icon"/>
          </span>
        </div>
        <div></div>
        
    </div>

    <div
        class="table-row medical-columns"
        v-for="(record, index) in sortedMedicalRecords"
        :key="record.id" @click="goToTreatmentPlanDetails(record.id)" style="cursor:pointer;"
    >
        <div>{{ record.date }}</div>
        <div>{{ record.title }}</div>
        <div>{{ record.created_by_name }}</div>
        <div class="record-actions-icons">
        <Icon icon="line-md:download" class="icon-download"></Icon>
        <Icon icon="line-md:trash" class="icon-trash" @click.stop="deleteTreatmentPlan(record.id)"></Icon>
        </div>
    </div>
    </div>
    <!-- Session Notes Tab -->
    <div v-if="activeTab === 'Session Notes'" class="session-notes-section">
    <div class="record-header">
        <h3></h3>
        <div class="record-actions">
        <button class="btn secondary">
            <Icon icon="line-md:upload" class="icon-upload"></Icon> Upload Session Notes
        </button>
        <button class="btn primary" @click = "goToSessionNotes" >
            <Icon icon="line-md:document-add" class="icon-sliders"></Icon> Create Session Notes
        </button>
        </div>
    </div>

    <div class="table-header session-columns">
        <div @click="sortTable('session', 'date')">
          Date
          <span v-if="sessionNotesSort.key === 'date'">
            <Icon :icon="sessionNotesSort.direction === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'" class="sort-icon"/>
          </span>
        </div>
        <div @click="sortTable('session', 'title')">
          Title / Filename
        <span v-if="sessionNotesSort.key === 'title'">
            <Icon :icon="sessionNotesSort.direction === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'" class="sort-icon"/>
          </span>
        </div>
        <div @click="sortTable('session', 'created_by_name')">
          Created by
          <span v-if="sessionNotesSort.key === 'created_by_name'">
            <Icon :icon="sessionNotesSort.direction === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'" class="sort-icon"/>
          </span>
        </div>
        <div></div>
    </div>

    <div
        class="table-row session-columns"
        v-for="(note, index) in sortedSessionNotes"
        :key="index" @click="goToSessionNoteDetails(note.id)" style="cursor:pointer;"
    >
        <div>{{ note.date }}</div>
        <div>{{ note.title }}</div>
        <div>{{ note.created_by_name }}</div>
        <div class="record-actions-icons">
        <Icon icon="line-md:download" class="icon-download"></Icon>
        <Icon icon="line-md:trash" class="icon-trash"></Icon>
        </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';
import TreatmentPlan from './TreatmentPlan.vue';

const router = useRouter();
const route = useRoute();

const studentId = route.params.studentId;

interface MedicalRecord {
  id: number;
  date: string;
  title: string;
  created_by_name: string;
}

interface SessionNote {
  id: number;
  date: string;
  title: string;
  created_by_name: string;
}

interface CaseReport {
  caseNo: number;
  severity: string;
  category: string;
  status: string;
  date: string;
  submittedBy: string;
  sessionNoteDate?: string;
}

const student = ref({
  id: '',
  name: '',
  nickname: '',
  cohort: '',
  nationality:'',
  school: '',
  status: ''
});

const caseReports = ref<CaseReport[]>([]);
const sessionNotes = ref<SessionNote[]>([]);
const medicalRecords = ref<MedicalRecord[]>([]);

function goToTreatmentPlan() {
  router.push({ name: 'treatmentPlan', params: { studentId: student.value.id } });
}
function goToTreatmentPlanDetails(planId: number) {
  router.push({ name: 'TreatmentPlanDetails', params: { planId } });
}
function goToSessionNotes() {
  router.push({ name: 'sessionNotes', params: { studentId: student.value.id } });
}
function goToSessionNoteDetails(noteId: number) {
  router.push({ name: 'SessionNotesDetails', params: { noteId } });
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}
const caseSort = reactive<SortConfig>({ key: 'date', direction: 'desc' });
const medicalSort = reactive<SortConfig>({ key: 'date', direction: 'desc' });
const sessionNotesSort = reactive<SortConfig>({ key: 'date', direction: 'desc' });
const sortTable = (type: 'case' | 'medical' | 'session', key: string) => {
  const config = type === 'case' ? caseSort : type === 'medical' ? medicalSort : sessionNotesSort;
  if(config.key === key) {
    config.direction = config.direction === 'asc' ? 'desc' : 'asc';
  } else {
    config.key = key;
    config.direction = 'asc';
  }
};
const sortedCaseReports = computed(() => {
  return [...caseReports.value].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    if(caseSort.key === 'severity'){
      const severityOrder = {high: 3, medium: 2, low: 1};
      valueA = severityOrder[a.severity.toLowerCase() as keyof typeof severityOrder] || 0;
      valueB = severityOrder[b.severity.toLowerCase() as keyof typeof severityOrder] || 0;
    }
    else if(caseSort.key === 'date') {
      valueA = new Date(a.date).getTime();
      valueB = new Date(b.date).getTime();
    } else {
      valueA = (a as any)[caseSort.key]?.toString().toLowerCase() || '';
      valueB = (b as any)[caseSort.key]?.toString().toLowerCase() || '';
    }
    if(valueA < valueB) return caseSort.direction === 'asc' ? -1 : 1;
    if(valueA > valueB) return caseSort.direction === 'asc' ? 1 : -1;
  return 0;
  });
});

const sortedMedicalRecords = computed(() => {
  return [...medicalRecords.value].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    if(medicalSort.key === 'date') {
      valueA = new Date(a.date).getTime();
      valueB = new Date(b.date).getTime();
    } else if(medicalSort.key === 'title'){
      valueA = a.title?.toLowerCase() || '';
      valueB = b.title?.toLowerCase() || '';
    } else if (medicalSort.key === 'created_by_name') {
      valueA = a.created_by_name?.toLowerCase() || '';
      valueB = b.created_by_name?.toLowerCase() || '';
    }
    return medicalSort.direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
  });
});

const sortedSessionNotes = computed(() => {
  return [...sessionNotes.value].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    if(sessionNotesSort.key === 'date') {
      valueA = new Date(a.date).getTime();
      valueB = new Date(b.date).getTime();
    } else if(sessionNotesSort.key === 'title'){
      valueA = a.title?.toLowerCase() || '';
      valueB = b.title?.toLowerCase() || '';
    } else if (sessionNotesSort.key === 'created_by_name') {
      valueA = a.created_by_name?.toLowerCase() || '';
      valueB = b.created_by_name?.toLowerCase() || '';
    }
    return sessionNotesSort.direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
  });
});

const fetchStudent = async() => {
  try{
    const studentId = route.params.student;
    const response = await api.get(`/students/${studentId}`);
    console.log('halooo', response.data);
    student.value = response.data;
  } catch (err) {
    console.error('Error fetching data:', err);
  }
};

const fetchCases = async () => {
  try{
    const studentId = route.params.student;
    const response = await api.get(`/cases/student/${studentId}`);
    caseReports.value = response.data.map((cases: any) => ({
      caseNo: cases.id,
      severity: cases.severity || '-',
      category: cases. category || '-',
      status: cases.status || '-',
      date: new Date(cases.created_at).toLocaleDateString() || '-',
      submittedBy: cases.users || '-',
    }));
  } catch (err) {
    console.error('Error fetching data:', err);
  }
};

const fetchTreatmentPlan = async () => {
  try{
    const studentId = route.params.student;
    const response = await api.get(`/students/${studentId}/treatment-plan`);
    medicalRecords.value = response.data.map((record: any) => ({
      id: record.id,
      date: new Date(record.created_at).toLocaleDateString() || '-',
      title: `${new Date(record.created_at).toLocaleDateString()}-TreatmentPlan`,
      created_by_name: record.created_by_name || ''
    }));
  } catch (err) {
    console.error('Error fetching data:', err);
  }
};

const fetchSessionNotes = async() => {
  try{
    const studentId = route.params.student;
    const response = await api.get(`/students/${studentId}/session-notes`);
    sessionNotes.value = response.data.map((note: any) => ({
      id: note.id,
      date: new Date(note.created_at).toLocaleDateString() || '-',
      title: `${new Date(note.created_at).toLocaleDateString()}-SessionNotes`,
      created_by_name: note.created_by_name || ''
    }));
  } catch (err) {
    console.error('Error fetching data:', err);
  }
};

const deleteTreatmentPlan = async(id: number) => {
  const confirmDelete = confirm('Delete?');
  if(!confirmDelete) return;

  try{
    await api.delete(`/students/treatment-plan/${id}`);
    medicalRecords.value = medicalRecords.value.filter(
      (record) => record.id !== id
    );

    alert('Treatment plan deleted successfully!');
  } catch(err: any) {
    console.error('Error deleting treatment plan: ', err);
    
    if(err.response?.status === 403){
      alert('You can only delete treatment plans you created.')
    }
    alert('Failed to delete treatment plan.');
  }
};


const tabs = ['Case Reports', 'Medical Records', 'Session Notes'];
const activeTab = ref('Case Reports');

onMounted(() => {
  fetchStudent();
  fetchCases();
  fetchTreatmentPlan();
  fetchSessionNotes();
});
</script>

<style scoped>
.student-page{
  max-width: 1000px;
  margin: 0 auto;}
.medical-records-section {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.05);
}
.case-columns {
  grid-template-columns: repeat(6, 1fr);
}

.medical-columns,
.session-columns {
    display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  align-items: left;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.record-actions {
  display: flex;
  gap: 1rem;
}


.btn {
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.primary {
  background-color: #0a2d80;
  color: white;
}

.btn.secondary {
  background-color: transparent;
  border: 1px solid #aaa;
  color: #333;
}

.icon-upload::before {
}

.icon-sliders::before {
}

.icon-download::before {
  margin-right: 0.5rem;
  cursor: pointer;
}

.icon-trash::before {
  cursor: pointer;
}

.record-actions-icons {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.student-page {
  padding: 2rem;
  background-color: var(--color-background);
  color: #333;
}

.student-info-card {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.info-row {
  display: grid;
  gap: 2rem;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.top-row{
  grid-template-columns: 1fr 1fr;
}

.bottom-row {
  grid-template-columns: repeat(4, 1fr);
}

.info-col {
  display: flex;
  flex-direction: column;
}

.label {
  font-size:1rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.value {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.value.large {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.student-info-card hr{
  border: none;
  border-top: 1px solid #ccc;
  margin: 1.25 0;
}

.tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #ccc;
  margin-bottom: 1rem;
}

.tab {
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  font-weight: 500;
  border-bottom: 3px solid transparent;
}

.tab.active {
  border-bottom: 3px solid #0a2d80;
  background-color: #0a2d80;
  color: white;
  border-radius: 8px 8px 0 0;
}

.case-reports-section {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.05);
}
.session-notes-section {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.05);
}

.table-header,
.table-row {
  display: grid;
  gap: 1rem;
  padding: 0.75rem 1rem;
  align-items: center;
  font-size: 0.95rem;
}
.table-header {
  font-weight: bold;
  border-bottom: 1px solid #ccc;
}

.table-header div{
  cursor: pointer;
}

.table-row {
  background: white;
  border-radius: 8px;
  margin-top: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.severity-pill {
  padding: 4px 14px;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
}

.severity-pill.high {
  background-color: #d60000;
}

.severity-pill.medium {
  background-color: #ffa500;
}

.severity-pill.low {
  background-color: #0033cc;
}

.more-link {
  color: #333;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
}

</style>
