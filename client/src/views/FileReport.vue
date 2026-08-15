<template>
  <div class="report-form">
    <h2>Student Child Protection Report</h2>
    <hr />
    <!-- Top Row: Case Type + Status -->
    <div class="top-row">
      <div class="case-type-group">
      <span class="status-label">Case Type:</span>
        <label
          v-for="type in allCaseTypes"
          :key="type.id"
          class="case-type-option"
          :class="{ selected: selectedCaseType === type.id }"
        >
          <input type="radio" :value="type.id" v-model="selectedCaseType" />
          {{ type.name }}
        </label>
      </div>
      <div class="status-group">
      <span class="status-label">Status:</span>
        <select v-model="status">
          <option disabled value="">In Progress</option>
          <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>
    </div>

    <!-- Share With Row -->
    <div class="share-row">
      <span class="share-label">Share with:</span>
      <div class="share-input-group">
        <multiselect
          v-model="selectedCounselors"
          :options="availableCounselors"
          :multiple="true"
          placeholder="Select counselors"
          label="name"
          track-by="id"
          :disabled="accessLevel === 4"
        />
        <div class="share-hint" v-if="accessLevel === 4">
          <Icon icon="line-md:alert-circle-loop" class="icon"/>
          This case will be shared with building-specific CPO and school level CPOs.</div>
      </div>
    </div>

    <!-- Tab Switcher -->
    <div class="tab-header">
      <button
        :class="{ active: activeTab === 'personal' }"
        @click="activeTab = 'personal'"
      >Personal Information</button>
      <button
        :class="{ active: activeTab === 'report' }"
        @click="activeTab = 'report'"
      >Report Details</button>
    </div>

    <!-- B. Personal Details -->
    <div v-if="activeTab === 'personal'">
      <section>
        <!-- School Row -->
        <div class="row">
          <div class="input-group full-width">
            <label>School</label>
            <input type="text" :value="schoolName" disabled class="disabled-input" />
          </div>
        </div>

        <!-- Building & Cohort Row -->
        <div class="row">
          <div class="input-group">
            <label>Building</label>
            <select v-model="selectedBuilding" @change="handleBuildingChange">
              <option disabled value="">Select Building</option>
              <option v-for="building in buildings" :key="building.id" :value="building.id">
                {{ building.name }}
              </option>
            </select>
          </div>
          <div class="input-group">
            <label>Cohort</label>
            <select v-model="cohort" :disabled="!selectedBuilding">
              <option disabled value="">{{ selectedBuilding ? 'Select Cohort' : 'Select Building First ' }}</option>
              <option v-for="option in dropdownData.cohorts" :key="option.id" :value="option.id">
                {{ option.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Full Name Row with Autocomplete -->
        <div class="row name-row">
          <div class="input-group name-input">
            <label>Full Name (First Name and Last Name)</label>
            <div class="autocomplete-wrapper">
              <input
                type="text"
                v-model="fullNameSearch"
                @input="onNameInput"
                :readonly="!!selectedStudent || !selectedBuilding || !cohort"
                :dsiabled="!selectedBuilding || !cohort"
                :class="{ 'soft-inactive': !!selectedStudent || !selectedBuilding || !cohort }"
                :placeholder="!selectedBuilding ? 'Select Building First' : !cohort ?  'Select Cohort First' : 'Type to search student'"
              />
              <!-- Clear selection button -->
              <button
                v-if="selectedStudent"
                class="clear-selection-btn"
                @click="resetStudentFields"
                title="Clear student selection"
              >✕</button>
              <!-- Search hint when prerequisites not met -->
              <div v-if="!selectedBuilding || !cohort" class="search-hint-msg">
                Please select a building and cohort before searching.
              </div>
              <!-- Results dropdown -->
              <div v-if="showStudentDropdown && studentSearchResults.length > 0" class="autocomplete-dropdown">
                <div
                  v-for="student in studentSearchResults"
                  :key="student.id"
                  class="autocomplete-item"
                  @click="selectStudent(student)"
                >
                  {{ student.full_name }}
                  <span v-if="student.preferred_name" class="preferred-name">({{ student.preferred_name }})</span>
                  <span class="cohort-tag">— {{ student.cohort }}</span>
                </div>
              </div>
              <div v-if="showStudentDropdown && studentSearchResults.length === 0 && fullNameSearch.length >= 2" class="autocomplete-dropdown">
                <div class="autocomplete-item no-results">No student found</div>
              </div>
            </div>
          </div>
          <div class="input-group nickname-input">
            <label>Preferred Name / Nickname</label>
            <input type="text" v-model="nickname" disabled class="disabled-input" />
          </div>
          <div class="input-group sex-input">
            <label>Sex</label>
            <input type="text" v-model="sex" disabled class="disabled-input" />
          </div>
        </div>

        <!-- Nationality & Student Status Row -->
        <div class="row">
          <div class="input-group">
            <label>Nationality</label>
            <input type="text" v-model="nationalityDisplay" disabled class="disabled-input" />
          </div>
          <div class="input-group">
            <label>Student Status</label>
            <input type="text" v-model="enrollmentDate" disabled class="disabled-input" placeholder="dd / mm / yyyy" />
          </div>
        </div>
      </section>
    </div>

    <!-- C. Report Details -->
    <div v-if="activeTab=== 'report'">
        <section>
        <div class="row">
            <div class="input-group">
            <label>Category</label>
            <select v-model="category" :disabled="!selectedCaseType">
                <option disabled value="">{{ selectedCaseType ? 'Select Category' : 'Select Case Type First' }}</option>
                <option v-for="option in categories" :key="option.id" :value="option.id">{{ option.name }}</option>
            </select>
            </div>
            <!--Severity-->
            <div class="input-group">
            <label>Severity</label>
            <div class="severity-options">
            <button
                v-for="level in severityOptions"
                :key="level.id"
                :class="['severity-btn', { active: severity === level.id }]"
                @click="severity = level.id"
            >
                {{ level.label }} Risk
            </button>
          </div>
          <div v-if="severityHint" class="severity-hint">
          <Icon icon="line-md:lightbulb-filled" class="icon"/>
            {{  severityHint }}
          </div>
        </div>
            
        </div>

        <!-- Specification -->
        <div class="input-group">
            <label>Specification (tags)</label>
            <multiselect
            id="tagging"
            v-model="selectedSpecs"
            :options="specOptions"
            :multiple="true"
            :taggable="true"
            placeholder="Select or add specifications"
            track-by="name"
            label="name"
        />
          <divv class="search-hint-msg">
            Please select a category before selecting specifications.
          </divv>
        </div>

        <!-- Reason -->
        <div class="input-group">
            <label>Reason</label>
            <textarea v-model="reason" rows="4" placeholder="Input text"></textarea>
        </div>
        <!-- Media Upload -->
        <div class="input-group">
          <label>Upload Media & Documentation</label>
          <input type="file" multiple @change="handleFiles" />
        </div>
       
        </section>
    </div>
    <!-- Error display for missing fields -->
        <div v-if="formErrors.length" class="error-messages">
          <ul>
            <label>Error:</label>
            <li v-for="error in formErrors" :key="error">{{ error }}</li>
          </ul>
        </div>
        <div class="privacy-check">
          <label>
            <input type="checkbox" v-model="privacyPolicyAcknowledged" />
            I acknowledge that I have read and understood the <router-link to="/privacy-policy">Privacy Policy</router-link>.
          </label>
        </div>
    <!-- Buttons -->
    <div class="form-buttons-wrapper">
      
        <button v-if="activeTab === 'report'" @click="previousTab" class="prev-btn">Previous</button>

        <div class="form-buttons">
            <button type="button" @click="handleCancel" class="cancel-btn">Cancel</button>

            <template v-if="activeTab === 'personal'">
                <button type="button" @click="nextTab" class="next-btn">Next</button>
            </template>

            <template v-else>
                <button type="submit" class="submit-btn" @click="submitForm">Submit</button>
            </template>
        </div>
    </div>

    <ConfirmModal
      v-model="showCancelConfirm"
      title="Cancel this report?"
      message="Any information you've entered will be lost. Are you sure you want to cancel?"
      confirm-text="Yes, cancel"
      cancel-text="No, keep editing"
      variant="danger"
      @confirm="confirmCancel"
    />
    <LoadingModal v-model="isSubmitting" message="Submitting case report…" />
  </div>
</template>

<script setup lang="ts">
// import { ref, VueElement } from 'vue';
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import ConfirmModal from '../components/common/ConfirmModal.vue';
import LoadingModal from '../components/common/LoadingModal.vue';

const router = useRouter();
const showCancelConfirm = ref(false);
const isSubmitting = ref(false);

const activeTab = ref<'personal' | 'report'>('personal');
const allCaseTypes = ref<any[]>([]);
const selectedCaseType = ref<number | null>(null);

const nextTab = () => {
  activeTab.value = 'report';
};

const previousTab = () => {
  activeTab.value = 'personal';
};

const handleCancel = () => {
  showCancelConfirm.value = true;
};

const confirmCancel = () => {
  router.back();
};

const dropdownData = ref<{
  users: any[];
  nationality: { id: number; name: string }[];
  cohorts: { id: number; name: string }[];
}>({
  users: [],
  nationality: [],
  cohorts: []
});

const fetchAllCaseTypes = async() => {
  try{
    const { data } = await api.get('/cases/case-types');
    allCaseTypes.value = data;
  } catch(err){
    console.error('Failed to fetch data', err);
  }
};

const selectedCounselors = ref<any[]>([]);
const availableCounselors = ref<any[]>([]);

const school = ref<{ id: number; name: string } | null>(null);
const buildings = ref<{ id: number; name: string }[]>([]);
const cohort = ref<number | string>('');
const selectedBuilding = ref<number | string>('');
const category = ref<number | string>('');
const categories = ref<{ id: number; name: string }[]>([]);
const selectedSpecs = ref<{ id: number; name: string }[]>([]);
const specOptions = ref<{ id: number; name: string }[]>([]);

// Student search and auto-fill fields
const fullNameSearch = ref('');
const showStudentDropdown = ref(false);
const studentSearchResults = ref<any[]>([]);
const selectedStudent = ref<any>(null);
const sex = ref('');
const nationalityDisplay = ref('');
const privacyPolicyAcknowledged = ref(false);
const privacyPolicyAcknowledgedAt = ref<Date | null>(null);
watch(privacyPolicyAcknowledged, (checked) => {
  if(checked) {
    privacyPolicyAcknowledgedAt.value = new Date();
  } else {
    privacyPolicyAcknowledgedAt.value = null;
  }
});

// Debounce timer ref for the student name search input
let searchTimer: ReturnType<typeof setTimeout> | null = null;

// Computed property for school name
const schoolName = computed(() => {
  return school.value?.name || '';
});

// Handle building change
const handleBuildingChange = () => {
  if (selectedBuilding.value) {
    fetchCohorts(selectedBuilding.value);
    // Reset student data when building changes
    resetStudentFields();
  }
};

// Reset all student autofill fields (called on building/cohort change or manual clear)
const resetStudentFields = () => {
  if (searchTimer) { clearTimeout(searchTimer); searchTimer = null; }
  fullNameSearch.value = '';
  selectedStudent.value = null;
  nickname.value = '';
  sex.value = '';
  nationalityDisplay.value = '';
  enrollmentDate.value = '';
  showStudentDropdown.value = false;
  studentSearchResults.value = [];
};

// Debounced input handler — fires search 300ms after the user stops typing.
// Requires building AND cohort to be selected, and at least 2 characters.
const onNameInput = () => {
  if (searchTimer) clearTimeout(searchTimer);

  if (!selectedBuilding.value || !cohort.value) {
    showStudentDropdown.value = false;
    return;
  }

  if (fullNameSearch.value.length < 2) {
    showStudentDropdown.value = false;
    studentSearchResults.value = [];
    return;
  }

  searchTimer = setTimeout(async () => {
    try {
      const { data } = await api.get('/students/search', {
        params: {
          q:           fullNameSearch.value,
          building_id: selectedBuilding.value,
          cohort_id:   cohort.value,
        },
      });
      studentSearchResults.value = data;
      showStudentDropdown.value = true;
    } catch (err) {
      console.error('Student search failed', err);
      studentSearchResults.value = [];
    }
  }, 300);
};

// Autofill form fields from the selected Alma student record.
// Fields become read-only (disabled-input style) once a student is chosen.
const selectStudent = (student: any) => {
  selectedStudent.value = student;
  fullNameSearch.value   = student.full_name;
  nickname.value         = student.preferred_name || '';
  sex.value              = student.gender || '';
  nationalityDisplay.value = student.nationality || '';
  // enrollment_date is null from Alma for now (TODO: confirm Alma endpoint)
  enrollmentDate.value   = student.enrollment_date
    ? new Date(student.enrollment_date).toLocaleDateString()
    : '';
  showStudentDropdown.value = false;
  studentSearchResults.value = [];
};
const severityOptions = [
  {id: 1, label: 'High'},
  {id: 2, label: 'Medium'},
  {id: 3, label: 'Low'}
];
const statusOptions = ref(['In Progress', 'On Hold', 'Resolved'])
const status = ref('In Progress');
const accessLevel = ref<number | null>(null);

watch(category, (newCategoryId) => {
  console.log("Category ID: ", newCategoryId);
  if(newCategoryId) {
    fetchSpec();
  }
});

const fetchCohorts = async (buildingId?: number | string) => {
  try{
    console.log("Building ID: ", buildingId);
    const resCohorts = await api.get('/dropdown/cohorts?buildingId=' + buildingId);
    dropdownData.value.cohorts = resCohorts.data;
    cohort.value = '';
  } catch (err) {
    console.error('Failed to fetch cohorts', err);
  }
};

const fetchUsers = async() => {
  try{
    const resUsers = await api.get('/dropdown/users');
    availableCounselors.value = resUsers.data;
  } catch (err) {
    console.error('Failed to fetch data', err);
  }
};

watch(selectedBuilding, (newBuildingId) => {
  if(newBuildingId) {
    fetchCohorts(newBuildingId);
  }
});

// Reset student selection whenever cohort changes so stale data isn't carried over
watch(cohort, () => {
  if (selectedStudent.value) resetStudentFields();
});

const loadCategories = async () => {
  const params = selectedCaseType.value && selectedCaseType.value !== 3
    ? { caseTypeId: selectedCaseType.value }
    : {};
  const { data } = await api.get('/dropdown/categories', { params });
  categories.value = data;
};

const fetchSpec = async() => {
  if(!category.value) return;

  try{
    const resSpec = await api.get(`/dropdown/subcategories?categoryId=${category.value}`);
    specOptions.value = resSpec.data;
    selectedSpecs.value = [];
  } catch (err) {
    console.error('Failed to fetch data', err);
  }
};
watch(category, (newCategoryId) => {
  if(newCategoryId) {
    fetchSpec();
  }
});

watch(selectedCaseType, () => {
  category.value = '';
  selectedSpecs.value = [];
  loadCategories();
});

onMounted(async () => {
  await loadCategories();
})

onMounted(async () => {
  try {
  const res = await api.get('/dropdown');
  dropdownData.value = res.data;

  const resBuildings = await api.get('/dropdown/buildings');
  // Set school (for display) and buildings (for dropdown selection)
  school.value = resBuildings.data.school;
  buildings.value = resBuildings.data.buildings.map((b: any) => ({
    id: b.id,
    name: b.name,
  }));

  const resUsers = await api.get('/users/me');
  accessLevel.value = resUsers.data.access_level;

  fetchUsers();
  fetchAllCaseTypes();
  } catch (err) {

    console.error('Failed to fetch data', err);
  }
});

const enrollmentDate = ref('')
const nickname = ref('')
const severity = ref<number | null>(null);
const reason = ref('')
const formErrors = ref<string[]>([]);


const uploadedFiles = ref<File[]>([]);

// File handler
function handleFiles(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (files) uploadedFiles.value = Array.from(files);
}

const severityHint = computed(() => {
  switch (severity.value) {
    case 1: return 'Immediate attention required. Possible harm, abuse, or urgent risk. ';
    case 2: return 'Concerning behavior. Monitor closely and consider intervention.';
    case 3: return 'Minor concern. Record and observe behavior.';
    default: return '';
  }
});

const submitForm = async() => {
  // Clear previous errors
  formErrors.value = [];

  // Collect missing fields
  const missingFields = [];

  // Validate School Info
  if (!school.value) missingFields.push('School');
  // Note: Enrollment Date is sourced from Alma and is currently null (see TODO in almaService.js).
  // Not required for submission until the Alma enrollment endpoint is confirmed.

  // Validate Personal Details
  if (!selectedBuilding.value) missingFields.push('Building');
  if (!cohort.value) missingFields.push('Cohort');
  if (!fullNameSearch.value) missingFields.push('Full Name');

  // Validate Report Details
  if (!category.value) missingFields.push('Category');
  if (!severity.value) missingFields.push('Severity');
  if (!reason.value) missingFields.push('Reason');
  if(!privacyPolicyAcknowledged.value){
    missingFields.push('Privacy Policy Acknowledgment');
  }

  // If there are missing fields, show the error message
  if (missingFields.length) {
    formErrors.value = missingFields.map(f => `Missing: ${f}`);
    return;
  }

  // Use stored first/last from Alma when available; fall back to splitting the typed name
  const nameParts = fullNameSearch.value.trim().split(' ');
  const parsedFirstName = selectedStudent.value?.first_name || nameParts[0] || '';
  const parsedLastName  = selectedStudent.value?.last_name  || nameParts.slice(1).join(' ') || '';

  const formData = new FormData();
    formData.append('first_name', parsedFirstName);
    formData.append('last_name', parsedLastName);
    formData.append('nickname', nickname.value);
    formData.append('cohort', String(cohort.value));
    formData.append('nationality_id', selectedStudent.value?.nationality_id ? String(selectedStudent.value.nationality_id): '');
    formData.append('reason', reason.value);
    formData.append('status', formatStatus(status.value));
    formData.append('category_id', String(category.value));
    formData.append('entry_date', enrollmentDate.value);
    formData.append('shared_with_user_ids', JSON.stringify(accessLevel.value === 4 ? [] : selectedCounselors.value.map(u => u.id)));
    formData.append('case_type_id', String(selectedCaseType.value));
    formData.append('severity_id', String(severity.value));
    formData.append('subcategory', JSON.stringify(selectedSpecs.value.map(s => Number(s.id))));
    formData.append('building_id', String(selectedBuilding.value));
    formData.append('student_id', selectedStudent.value?.id ? String(selectedStudent.value.id) : '' );
    formData.append('privacy_policy_acknowledged', privacyPolicyAcknowledged.value ? 'true' : 'false');
    formData.append('privacy_policy_acknowledged_at', privacyPolicyAcknowledgedAt.value ? privacyPolicyAcknowledgedAt.value.toISOString() : '');

    uploadedFiles.value.forEach((file) => {
      formData.append('media', file);
    });
  isSubmitting.value = true;
  try{
    const res = await api.post('/cases', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('Case created: ', res.data);

    resetForm();
    router.push(`/reportview/${res.data.id}`);
  } catch(err) {
    console.error('Failed to create case: ', err);
    alert('Failed to create case.');
  } finally {
    isSubmitting.value = false;
  };
};

const formatStatus = (status: string) => {
  return status.toLowerCase().replace(/\s+/g, ' ');
};

watch(privacyPolicyAcknowledged, (checked) => {
  if(checked) {
    privacyPolicyAcknowledgedAt.value = new Date();
  } else {
    privacyPolicyAcknowledgedAt.value = null;
  }
});

const resetForm = () => {
  selectedCaseType.value = null;
  status.value = 'In Progress';
  selectedCounselors.value = [];
  selectedBuilding.value = '';
  cohort.value = '';
  fullNameSearch.value = '';
  selectedStudent.value = null;
  nickname.value = '';
  sex.value = '';
  nationalityDisplay.value = '';
  enrollmentDate.value = '';
  category.value = '';
  selectedSpecs.value = [];
  severity.value = null;
  reason.value = '';
  uploadedFiles.value = [];
  formErrors.value = [];
  activeTab.value = 'personal';
  privacyPolicyAcknowledged.value = false;
  privacyPolicyAcknowledgedAt.value = null;
};
</script>

<style scoped>

.tab-header {
  display: flex;
  border-bottom: 2px solid #ccc;
  margin-bottom: 1rem;
}

.tab-header button {
  background-color: #f4f2fd;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  color: #111;
  border-bottom: 2px solid transparent;
  transition: background-color 0.3s, border-bottom 0.3s, color 0.3s;
}

.tab-header button.active {
  background-color: #0a3186;
  color: white;
  border-bottom: 2px solid #0a3186;
}

.tab-header button:not(.active):hover {
  background-color: #e1dff4;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

.case-type-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.case-type-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.case-type-option:hover {
  background: #e1dff4;
}

.case-type-option.selected {
  background: #0a3186;
  color: white;
  border-color: #0a3186;
}

.case-type-option input[type="radio"] {
  margin: 0;
}

.status-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
}

.status-group select {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
}

.share-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 0;
}

.share-input-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.share-input-group :deep(.multiselect) {
  width: 100%;
}

.share-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.share-label, .status-label  {
  font-weight: 600;
  white-space: nowrap;
  padding-top: 0;
}

/* Full width input group */
.input-group.full-width {
  flex: 1 1 100%;
  min-width: 100%;
}

/* Name row specific styling */
.row.name-row {
  gap: 1rem;
}

.input-group.name-input {
  flex: 2;
  min-width: 280px;
}

.input-group.nickname-input {
  flex: 1;
  min-width: 150px;
}

.input-group.sex-input {
  flex: 0 0 100px;
  min-width: 100px;
}

/* Disabled input styling */
.disabled-input {
  background-color: #e5e5e5 !important;
  color: #666;
  cursor: not-allowed;
}

/* Autocomplete styles */
.autocomplete-wrapper {
  position: relative;
  width: 100%;
}

.autocomplete-wrapper input {
  width: 100%;
  box-sizing: border-box;
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.autocomplete-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.autocomplete-item:hover {
  background: #f4f2fd;
}

.autocomplete-item.no-results {
  color: #666;
  font-style: italic;
  cursor: default;
}

.autocomplete-item.no-results:hover {
  background: white;
}

.report-form {
  padding: 2rem;
  background: #f4f2fd;
  border-radius: 12px;
  max-width: 960px;
  margin: auto;
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
}

hr {
  border: none;
  border-top: 1px solid #ccc;
  margin-bottom: 1.5rem;
}

section {
  margin-bottom: 2rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.input-group {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

label {
  font-weight: 600;
  margin-bottom: 0.3rem;
}

input,
select,
textarea {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 0.5rem;
  font-size: 1rem;
  background: white;
}

textarea {
  resize: vertical;
}

small {
  font-size: 0.75rem;
  color: #666;
}


.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background-color: #0a3186;
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
}

.tag button {
  background: transparent;
  border: none;
  color: white;
  margin-left: 0.5rem;
  cursor: pointer;
}

.severity-options {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.severity-options button {
  padding: 0.5rem 1rem;
  border: 1px solid #999;
  border-radius: 20px;
  background: #ddd;
  cursor: pointer;
  font-weight: 600;
}

.severity-options .active {
  background: #0a3186;
  color: white;
  border-color: #0a3186;
}

.severity-hint{
  margin-top: 0.5rem;
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.submit-container {
  text-align: center;
  margin-top: 2rem;
}

.submit-container button {
  background-color: #0a3186;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.submit-container button:hover {
  background-color: #071f5c;
}
.form-buttons-wrapper{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
}
.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Button Styles */
.cancel-btn, .next-btn, .prev-btn, .submit-btn {
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: bold;
  border: 1px solid black;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.next-btn, .submit-btn {
  background-color: #0a2d80;
  color: white;
  border: none;
}

.cancel-btn:hover,
.prev-btn:hover {
  background-color: #f0f0f0;
}

.next-btn:hover,
.submit-btn:hover {
  background-color: #001f5f;
}
.error-messages {
  background-color: rgba(255, 0, 0, 0.1); /* Light red transparent background */
  color: red; /* Red font color */
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 0, 0, 0.3);
}
.error-messages ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Clear-selection button overlaid on the name input */
.clear-selection-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 0.85rem;
  color: #888;
  cursor: pointer;
  padding: 2px 4px;
  line-height: 1;
  z-index: 101;
}

.clear-selection-btn:hover {
  color: #333;
}

/* Hint shown when building/cohort not yet selected */
.search-hint-msg {
  font-size: 0.75rem;
  color: #888;
  margin-top: 4px;
  font-style: italic;
}

/* Preferred name + cohort labels inside dropdown rows */
.preferred-name {
  color: #555;
  margin-left: 4px;
}

.cohort-tag {
  font-size: 0.8rem;
  color: #0a3186;
  margin-left: 6px;
}

.share-hint, .severity-hint{
  display: flex;
  align-items: center;
  gap: 6px;
}

.soft-inactive{
  background-color: #ffffff;
  color: #333;
  opacity: 0.7;
  border: 1px solid #ccc;
  transition: opacity 0.2s ease;
}
</style>
