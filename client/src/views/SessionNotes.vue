<template>
  <div class="report-form">
    <h2>Session Notes</h2>
    <hr />
    <!-- Top Row -->
    <div class="top-row">
      <div class="checkboxes">
        <div v-for="type in allCaseTypes" :key="type.id">
          <label>
            <input type="radio" :value="type.id" v-model="selectedCaseType"/>
            {{ type.name }}
          </label>
        </div>
      </div>
      <div class="counselor-select">
        <span class="share-label">Share with:</span>
        <multiselect
          v-model="selectedCounselors"
          :options="availableCounselors"
          :multiple="true"
          placeholder="Select counselors"
          label="name"
          track-by="id"
        />
      </div>
    </div>
    
    <!-- Tab Switcher -->
    <div class="tab-header">
      <button
        :class="{ active: activeTab === 'overview' }"
        @click="activeTab = 'overview'"
      >Overview</button>
      <button
        :class="{ active: activeTab === 'notes' }"
        @click="activeTab = 'notes'"
      >Session Notes</button>
      <button
        :class="{ active: activeTab === 'media' }"
        @click="activeTab = 'media'"
      >Media & Documentation</button>
      <button
        :class="{ active: activeTab === 'followUp' }"
        @click="activeTab = 'followUp'"
      >Follow-Up</button>
    </div>

    <!-- Overview -->
    <div v-show= "activeTab ==='overview'">
        <section>
        <div class="input-group">
            <label>Concern Overview</label>
            <textarea v-model="reason" rows="4" placeholder="Input text"></textarea>
        </div>
        <label>People present in the session: </label>
        <tag-input 
            v-model="peoplePresent"
            mode = 'twoColumn'
            label= "People Present at the Session"
            :roles="allRoles"
        />
        </section>
    </div>

    <!-- Session Notes -->
    <div v-show="activeTab=== 'notes'">
        <section>
            <div class="input-group">
                <label>Observation Notes</label>
                <textarea v-model="notes" rows="4" placeholder="Input text"></textarea>
            </div>
            <div class="form-grid">
                <div class="form-item">
                    <label>Actions Taken</label>
                    <tag-input v-model="actions" mode = 'single' label="Actions Taken" />
                </div>
                <div class="form-item">
                    <label>Outcome</label>
                    <tag-input v-model="outcome" mode = 'single' label="Outcome" />
                </div>
            </div>
            <div class="form-item">
                <label>Future Actions</label>
                <tag-input v-model="future" mode = 'single' label="Future Actions" />
            </div>
        </section>
    </div>
    <!-- Media & Documentation -->
    <div v-show="activeTab=== 'media'">
        <section>
        <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop" @dragenter.prevent>
            <i class="upload-icon">Insert Icon</i> 
            <p class="upload-text">Choose a file or drag it here</p>
            <input type="file" multiple @change="handleFiles" />
        </div>
    </section>
    </div>
    <!-- Follow Up -->
    <div v-show="activeTab ==='followUp'">
        <section>
        <div class="input-group">
          <label>Date</label>
          <input type="date" v-model="sessionDate" />
        </div>
        <div class="input-group">
            <label>Notes</label>
            <textarea v-model="followUpNotes" rows="4" placeholder="Input text"></textarea>
        </div>
        </section>
    </div>
    <!-- Buttons -->
    <div class="form-buttons-wrapper">
      <div class="left-buttons">
        <button v-if="activeTab !== 'overview'" @click="previousTab" class="prev-btn">Previous</button>
        <span v-else class="prev-placeholder"></span>
      </div>
        <div class="form-buttons">
            <button type="button" @click="handleCancel" class="cancel-btn">Cancel</button>

            <template v-if="activeTab !== 'followUp'">
                <button type="button" @click="nextTab" class="next-btn">Next</button>
            </template>

            <template v-else>
                <button type="submit" class="submit-btn" @click="submitForm">Submit</button>
            </template>
        </div>
    </div>

    <ConfirmModal
      v-model="showCancelConfirm"
      title="Cancel this session note?"
      message="Any information you've entered will be lost. Are you sure you want to cancel?"
      confirm-text="Yes, cancel"
      cancel-text="No, keep editing"
      variant="danger"
      @confirm="confirmCancel"
    />
    <LoadingModal v-model="isSubmitting" message="Submitting session note…" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../services/api';
import {useRoute, useRouter} from 'vue-router';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import tagInput from '@/components/forms/TagInput.vue';
import ConfirmModal from '../components/common/ConfirmModal.vue';
import LoadingModal from '../components/common/LoadingModal.vue';
const route = useRoute();
const router = useRouter();
const studentId = Number(route.params.studentId);
const showCancelConfirm = ref(false);
const isSubmitting = ref(false);

const reason = ref('');
const concerns = ref([]);
const notes = ref('');
const actions = ref([]);
const outcome = ref([]);
const future = ref([]);
const sessionDate = ref('');
const followUpNotes = ref('');
const selectedCaseType = ref<number | null>(null);
const peoplePresent = ref([]);
const tabs = ['overview', 'notes', 'media', 'followUp'] as const;
type Tab = typeof tabs[number];

const activeTab = ref<Tab>('overview');

const nextTab = () => {
  const currentIndex = tabs.indexOf(activeTab.value);
  if (currentIndex < tabs.length - 1) {
    console.log("Switching to next tab: ", tabs[currentIndex + 1]);
    console.log("Current concerns: ", concerns.value);
    activeTab.value = tabs[currentIndex + 1];
  }
};

const previousTab = () => {
  const currentIndex = tabs.indexOf(activeTab.value);
  if (currentIndex > 0) {
    console.log("Switching to next tab: ", tabs[currentIndex - 1]);
    console.log("Current concerns: ", concerns.value);
    activeTab.value = tabs[currentIndex - 1];
  }
};

const handleCancel = () => {
  showCancelConfirm.value = true;
};

const confirmCancel = () => {
  router.back();
};

const availableCounselors = ref<any[]>([]);
const selectedCounselors = ref<any[]>([]);
const allCaseTypes = ref([]);
const allRoles = ref([]);

const fetchUsers = async() => {
  try{
    const resUsers = await api.get('/dropdown/users');
    availableCounselors.value = resUsers.data;
  } catch (err) {
    console.error('Failed to fetch data', err);
  }
};

const fetchCaseTypes = async() => {
  try{
    const res = await api.get('/cases/case-types');
    allCaseTypes.value = res.data;
  } catch (err) {
    console.error('Failed to fetch data', err);
  }
};

const fetchAllRoles = async() => {
  try{
  const resRoles = await api.get('/students/session-notes/roles');
  allRoles.value = resRoles.data;
  } catch (err) {
    console.error('Failed to fetch data', err);
  }
};

onMounted(() => {
  fetchUsers();
  fetchCaseTypes();
  fetchAllRoles();
});

watch(peoplePresent, (newPeople) => {
  console.log("Concerns array update: ", newPeople);
});

const childProtectionConcern = ref(false);
const counsellingConcern = ref(false);


const submitForm = async() => {
  isSubmitting.value = true;
  try{
    const payload = {
      student_id: studentId,
      case_type_id: selectedCaseType.value,
      overview: reason.value,
      observation_notes: notes.value,
      follow_up_date: sessionDate.value,
      notes: followUpNotes.value,
      sn_people_present: peoplePresent.value || [],
      sn_actions_taken: actions.value || [],
      sn_outcome: outcome.value || [],
      sn_future_actions: future.value || [],
      child_protection_concern:childProtectionConcern.value,
      counselling_concern: counsellingConcern.value,
      shared_with_user_ids: selectedCounselors.value.map(u => u.id)
    };
    const res = await api.post(`/students/${studentId}/session-notes`, payload);
    console.log('Session note created: ', res.data);
    router.back();
  } catch (err){
      console.error('Error submitting session note', err);
      alert('Failed to submit session notes');
    } finally {
      isSubmitting.value = false;
    }
}

const formErrors = ref<string[]>([]);

const uploadedFiles = ref<File[]>([]);

// File handler
function handleFiles(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (files) uploadedFiles.value = Array.from(files);
}

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
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.checkboxes{
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  flex: 1;
}

.checkboxes label {
  margin-right: 1rem;
  font-weight: 500;
}

.counselor-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 300px;
  flex: 1;
}

.share-label {
  font-weight: 600;
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

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background-color: #f0f2f5; /* light background similar to your image */
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s;
  position: relative;
  max-width: 100%;
  margin: 1rem 0;
}

.upload-area:hover {
  border-color: #999;
  background-color: #e0e0e0;
}

.upload-icon {
  font-size: 48px; /* size of the cloud icon, you can replace with SVG or other icon font */
  display: block;
  margin-bottom: 10px;
  color: #999;
}

.upload-text {
  font-weight: 600;
  color: #555;
  margin: 0;
  font-size: 16px;
}

.upload-area input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
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
    margin-top: 1.5rem;
}
.left-buttons{
  width: 100px;
}

.prev-placeholder{
  display: inline-block;
  width: 100%;
  height: 30px;
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

/* Container for all form rows */
.form-grid {
  display: flex;
  flex-wrap: wrap;               /* Wrap to the next line if necessary */
  gap: 20px;                     /* Space between items (rows and columns) */
}

/* Each form item (column) */
.form-item {
  flex: 1 1 calc(50% - 20px);    /* Two items per row, minus gap */
  display: flex;
  flex-direction: column;        /* Stack label/input vertically */
}

/* Optional: make sure label and input are styled nicely */
.form-item label {
  margin-bottom: 4px;
  font-weight: bold;
}
</style>
