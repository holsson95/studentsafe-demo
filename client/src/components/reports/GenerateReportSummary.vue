<template>
  <div class="report-summary-container">
    <header class="page-header">
      <h1>Report Summary</h1>
      <button class="btn-generate" @click="openReportModal">
        <Icon icon="line-md:plus" class="plus-icon" /> Generate Report
      </button>
    </header>

    <main class="reports-content">
      <div v-if="reports.length === 0" class="empty-state">
        <Icon icon="line-md:document-list-twotone" class="file-icon"/>
        <h3>No reports generated yet</h3>
        <p>Click "Generate Report" to create your first report</p>
      </div>

      <div v-else v-for="(yearReports, year) in reportsByYear" :key="year" class="year-section">
        <div class="year-header">{{ year }}</div>
        <table class="reports-table">
          <thead>
            <tr>
              <th>Generated Date</th>
              <th>Report Title</th>
              <th>School</th>
              <th>Period</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in yearReports" :key="report.id">
              <td>{{ formatDate(report.generatedDate) }}</td>
              <td>
                <span class="report-title" @click="viewReport(report.id)">
                  {{ report.title }}
                </span>
              </td>
              <td>{{ report.schoolName }}</td>
              <td>{{ formatDate(report.period.from) }} to {{ formatDate(report.period.to) }}</td>
              <td class="action-cell">
                <button class="action-btn btn-download" @click="downloadReport(report.id)">
                  <Icon icon="line-md:download" class="icon-download"></Icon>
                </button>
                <button class="action-btn btn-delete" @click="deleteReport(report.id)">
                  <Icon icon="line-md:trash" class="icon-trash"></Icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Generate Report Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="handleCloseModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Generate Report</h2>
          <button class="close-btn" @click="handleCloseModal">&times;</button>
        </div>
        <form @submit.prevent="generateReport">
          <div class="form-group">
            <label for="school">School</label>
            <select id="school" v-model="formData.schoolId" required>
              <option v-for="school in schools" :key="school.id" :value="school.id">
                {{ school.name }}
              </option>
            </select>
          </div>
          
          <div class="date-inputs">
            <div class="form-group">
              <label for="fromDate">From Date</label>
              <input type="date" id="fromDate" v-model="formData.fromDate" required>
            </div>
            <div class="form-group">
              <label for="toDate">To Date</label>
              <input type="date" id="toDate" v-model="formData.toDate" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="reportTitle">Report Title</label>
            <input type="text" id="reportTitle" v-model="formData.title" placeholder="Enter report title" required>
          </div>
          <!-- Case Type Selection -->
          <div class="form-group">
            <label>Case Type</label>
            <div class="radio-group">
              <label v-for="caseType in caseTypes" :key="caseType.id" class="radio-label">
                <input 
                  type="radio" 
                  :value="caseType.id" 
                  v-model="formData.caseTypeId"
                  class="radio-input"
                >
                <span class="radio-text">{{ caseType.name }}</span>
              </label>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="handleCloseModal">Cancel</button>
            <button type="submit" class="btn-submit">Generate Report</button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      v-model="showDiscardConfirm"
      title="Discard this report?"
      message="You have unsaved information for this report. Are you sure you want to cancel?"
      confirm-text="Yes, discard"
      cancel-text="No, keep editing"
      variant="danger"
      @confirm="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import api from '@/services/api';
import { defineComponent, ref, computed, onMounted } from 'vue';
import ConfirmModal from '../common/ConfirmModal.vue';

// Define interfaces
interface School {
  id: string;
  name: string;
  abbreviation: string;
}

interface Report {
  id: string;
  title: string;
  generatedDate: string;
  period: {
    from: string;
    to: string;
  };
  schoolId: string;
  schoolName: string;
  caseTypeId: number; 
  caseTypeName: string; 
}

interface FormData {
  schoolId: string;
  schoolName: string;
  fromDate: string;
  toDate: string;
  title: string;
  caseTypeId: number; 
}
interface CaseType {
  id: number;
  name: string;
}

//Eventually need to change to API and grab from database?
const caseTypes: CaseType[] = [
  { id: 1, name: 'CPO Cases'},
  { id: 2, name: 'Counseling Cases' },
  { id: 3, name: 'Both'}
];

// Reactive state
const schools = ref<School[]>([]);
const selectedSchoolId = ref('');
const reports = ref<Report[]>([]);
const showModal = ref(false);
const showDiscardConfirm = ref(false);
const loading = ref(true);
const formData = ref<FormData>({
  schoolId: '',
  schoolName: '',
  fromDate: '',
  toDate: '',
  title: '',
  caseTypeId: 1
});

// Computed properties
const reportsByYear = computed(() => {
  const grouped: { [year: string]: Report[] } = {};
  
  reports.value.forEach(report => {
    const year = report.generatedDate.split('-')[0];
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(report);
  });

  // Sort years in descending order
  const sortedYears = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a));
  const result: { [year: string]: Report[] } = {};
  
  sortedYears.forEach(year => {
    // Sort reports within each year by date (newest first)
    result[year] = grouped[year].sort((a, b) => 
      new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()
    );
  });

  return result;
});

// Methods
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const getSchoolName = (schoolId: string): string => {
  const school = schools.value.find(s => s.id === schoolId);
  return school ? school.name : 'Unknown School';
};

const openReportModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  // Reset form data
  formData.value = {
    schoolId: selectedSchoolId.value,
    schoolName: '',
    fromDate: '',
    toDate: '',
    title: '',
    caseTypeId: 1
  };
};

const handleCloseModal = () => {
  if (formData.value.title.trim() || formData.value.fromDate || formData.value.toDate) {
    showDiscardConfirm.value = true;
  } else {
    closeModal();
  }
};

const generateReport = () => {
  const selectedSchool = schools.value.find(s => s.id === formData.value.schoolId);
  const schoolName = selectedSchool ? selectedSchool.name : 'Unknown School';
  const selectedCaseType = caseTypes.find(ct => ct.id === formData.value.caseTypeId);
  const caseTypeName = selectedCaseType ? selectedCaseType.name : 'Unknown Case Type';

  console.log('Selected school ID:', formData.value.schoolId);
  console.log('Found school:', selectedSchool);
  console.log('School name to use:', schoolName);
  
  const newReport: Report = {
    id: Date.now().toString(),
    title: formData.value.title,
    generatedDate: new Date().toISOString().split('T')[0],
    period: { 
      from: formData.value.fromDate, 
      to: formData.value.toDate 
    },
    schoolId: formData.value.schoolId,
    schoolName: schoolName,
    caseTypeId: formData.value.caseTypeId, // Store case type ID
    caseTypeName: caseTypeName 
  };

  console.log('New report to be saved:', newReport);

  // Add the new report to the array
  reports.value.push(newReport);
  
  // Save to localStorage - make sure to use the updated array
  localStorage.setItem('reports', JSON.stringify(reports.value));
  
  // Verify what was saved
  const savedData = localStorage.getItem('reports');
  console.log('Saved to localStorage:', savedData);
  
  // Close the modal
  closeModal();
  
  // Navigate to the preview page
  console.log('Navigating to preview with ID:', newReport.id);
  router.push(`/report-preview/${newReport.id}`);
};


const viewReport = (reportId: string) => {
  console.log('Navigating to:', `/report-preview/${reportId}`);
  router.push(`/report-preview/${reportId}`);
};

const downloadReport = (reportId: string) => {
  alert(`Downloading report with ID: ${reportId}`);
};

const deleteReport = (reportId: string) => {
  if (confirm('Are you sure you want to delete this report?')) {
    reports.value = reports.value.filter(report => report.id !== reportId);
    localStorage.setItem('reports', JSON.stringify(reports.value));
  }
};

// Load data on mount
onMounted(async () => {
  try {
    
    const response =  await api.get('/schools'); 
    schools.value = response.data;
    
    // Set default school
    const defaultSchool = schools.value.find(s => s.name === 'All Schools');
    selectedSchoolId.value = defaultSchool ? defaultSchool.id : schools.value[0]?.id || '';
    // Set default school in form data
    formData.value.schoolId = selectedSchoolId.value;
    
    // Load reports from localStorage
    const savedReports = localStorage.getItem('reports');
    reports.value = savedReports ? JSON.parse(savedReports) : [];
    
    loading.value = false;
  } catch (error) {
    console.error('Failed to fetch data', error);
    loading.value = false;
  }
});
</script>

<style scoped>
.report-summary-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.page-header h1 {
  color: #2c3e50;
  font-weight: 600;
}

.btn-generate {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-generate:hover {
  background-color: #2980b9;
}

.icon-download::before {
  margin-right: 0.5rem;
  cursor: pointer;
}

.icon-trash::before {
  cursor: pointer;
}

.reports-content {
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 40px;
  color: #7f8c8d;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #bdc3c7;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.year-section {
  margin-bottom: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.year-header {
  background-color: #2c3e50;
  color: white;
  padding: 12px 20px;
  font-size: 18px;
  font-weight: 500;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table th,
.reports-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.reports-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.reports-table tr:last-child td {
  border-bottom: none;
}

.reports-table tr:hover {
  background-color: #f8f9fa;
}

.report-title {
  color: #3498db;
  cursor: pointer;
  font-weight: 500;
}

.report-title:hover {
  text-decoration: underline;
}

.action-cell {
  display: flex;
  gap: 15px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #7f8c8d;
  transition: color 0.3s;
}

.action-btn:hover {
  color: #3498db;
}

.btn-download:hover {
  color: #27ae60;
}

.btn-delete:hover {
  color: #e74c3c;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 20px;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.date-inputs {
  display: flex;
  gap: 15px;
}

.date-inputs .form-group {
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.btn-cancel {
  background-color: #e7e9ed;
  color: #2c3e50;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-submit {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-submit:hover {
  background-color: #2980b9;
}

/* Minimal radio button styles - Perfectly centered */
/* Minimal radio button styles - Centered */
.radio-group {
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-top: 8px;
  justify-content: center; /* Center the radio buttons horizontally */
  align-items: center; /* Center vertically */
}

.radio-label {
  display: flex;
  align-items: center; /* Keep radio and text on same line */
  cursor: pointer;
  padding: 8px 16px; /* Added horizontal padding for better spacing */
  transition: all 0.2s ease;
  justify-content: center; /* Center content within each label */
}

.radio-label:hover {
  color: #3498db;
}

.radio-input {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
  /* Ensure radio stays aligned with text */
  vertical-align: middle;
}

.radio-text {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
  /* Ensure text stays on same line as radio */
  line-height: 1;
  vertical-align: middle;
}

/* Selected style */
.radio-label input[type="radio"]:checked + .radio-text {
  color: #3498db;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 480px) {
  .radio-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .radio-label {
    justify-content: flex-start; /* Left align on mobile */
    padding: 8px 0; /* Remove horizontal padding on mobile */
  }
}

</style>
