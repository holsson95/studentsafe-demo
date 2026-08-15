<template>
  <div class="report-form">
    <div class="report-actions no-print">
      <button @click="isReportMode = !isReportMode" class="report-btn no-print">
        {{ isReportMode ? ' < Back to Tabs ' : ' View as Report ' }}
      </button>
      <div v-if="isReportMode === true">
        <button @click="printReport" class="print-btn no-print">
          <Icon icon="line-md:download" class="search-icon"/>
          Print / Save as PDF
        </button>
      </div>
      </div>
      <div :class="{ 'a4-layout': isReportMode }">
    <h2>Session Notes</h2>
    <hr />
    <!-- Top Row -->
    <div class="top-row">
      <div class="checkboxes">
        <div v-for="type in allCaseTypes" :key="type.id">
          <label>
            <input type="radio" :value="type.id" v-model="sessionNotesData.case_type_id" disabled/>
            {{ type.name }}
          </label>
        </div>
      </div>
    <div class="share-with">
      <span><Icon icon="line-md:account"></Icon> Shared with: </span>
      <span
        v-for="(user, index) in sessionNotesData.sharedUsers"
        :key="user.id"
        class="share-chip"
      >
        {{  user.name }}
      </span>
    </div>
    </div>
    
    <template v-if="!isReportMode">
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
            <p class="readonly-text"> {{ sessionNotesData.reason }}</p>
        </div>
        <div class="input-group">
        <label>People present in the session: </label>
        <ul class="tag-list">
            <li v-for="person in peoplePresent" :key="person"> {{ person }}</li>
        </ul>
    </div>
</section>
</div>

<div class="page-break"></div>

    <!-- Session Notes -->
    <div v-show="activeTab=== 'notes'">
        <section>
            <div class="input-group">
                <label>Observation Notes</label>
                <p class="readonly-text">{{ sessionNotesData.notes }}</p>
            </div>
            <div class="form-grid">
                <div class="form-item">
                    <label>Actions Taken</label>
                    <ul class="tag-list">
                        <li v-for="action in sessionNotesData.actions" :key="action"> {{ action }}</li>
                    </ul>
                </div>
                <div class="form-item">
                    <label>Outcome</label>
                    <ul class="tag-list">
                        <li v-for="item in sessionNotesData.outcome" :key="item"> {{ item }}</li>
                    </ul>
                </div>
            </div>
            <div class="form-item">
                <label>Future Actions</label>
                <ul class="tag-list">
                        <li v-for="item in sessionNotesData.future" :key="item"> {{ item }}</li>
                    </ul>
            </div>
        </section>
    </div>
    <!-- Media & Documentation -->
    <div v-show="activeTab=== 'media'">
        <section>
            <div class="media-list">
                <div v-for="file in sessionNotesData.mediaFiles" :key="file.id" class="media-item">
                    <a :href="file.url" target="_blank">{{ file.name }}</a>
                </div>
            </div>
    </section>
    </div>
    <!-- Follow Up -->
    <div v-show="activeTab ==='followUp'">
        <section>
        <div class="input-group">
          <label>Date</label>
            <p class="readonly-text">{{ sessionNotesData.sessionDate }}</p>
        </div>
        <div class="input-group">
            <label>Notes</label>
            <p class="readonly-text">{{ sessionNotesData.followUpNotes }}</p>
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

            <template v-if="activeTab !== 'followUp'">
                <button type="button" @click="nextTab" class="next-btn">Next</button>
            </template>
        </div>
    </div>
    </template>

    <template v-else>
      <section>
        <label>Concern Overview</label>
        <p>{{ sessionNotesData.reason }}</p>
        <label>People present</label>
        <ul>
          <li v-for="p in peoplePresent" :key="p">{{ p }}</li>
        </ul>
      </section>
      <section>
        <label> Observation notes</label>
        <p> {{ sessionNotesData.notes }}</p>
        <div class="form-grid">
          <div class="form-item">
            <label>Actions</label>
            <ul>
              <li v-for="a in sessionNotesData.actions" :key="a">{{ a }}</li>
            </ul>
          </div>
          <div class="form-item">
            <label>Outcome</label>
            <ul>
              <li v-for="o in sessionNotesData.outcome" :key="o">{{ o }}</li>
            </ul>
          </div>
          <div class="form-item">
            <label>Future Actions</label>
            <ul>
              <li v-for="f in sessionNotesData.future" :key="f">{{ f }}</li>
            </ul>
          </div>
        </div>
        </section>
          <section>
            <label>Media & Documentation</label>
            <div v-for="file in sessionNotesData.mediaFiles" :key="file.id">
              <a :href="file.url" target="_blank">{{ file.name }}</a>
            </div>
          </section>
          <section>
            <label>Follow-Up</label>
            <p><strong>Date:</strong> {{ sessionNotesData.sessionDate }}</p>
            <p><strong>Notes:</strong> {{ sessionNotesData.followUpNotes }}</p>
          </section>
    </template>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../services/api';
import {useRoute} from 'vue-router';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import tagInput from '@/components/forms/TagInput.vue';
const route = useRoute();
const studentId = Number(route.params.studentId);
const noteId = Number(route.params.noteId);
const isReportMode = ref(false);

const allCaseTypes = ref<any[]>([]);
const peoplePresent = ref<string[]>([]);
const tabs = ['overview', 'notes', 'media', 'followUp'] as const;
type Tab = typeof tabs[number];

const printReport = () => {
  isReportMode.value = true;
  window.print();
};

const activeTab = ref<Tab>('overview');

const nextTab = () => {
  const currentIndex = tabs.indexOf(activeTab.value);
  if (currentIndex < tabs.length - 1) {
    activeTab.value = tabs[currentIndex + 1];
  }
};

const previousTab = () => {
  const currentIndex = tabs.indexOf(activeTab.value);
  if (currentIndex > 0) {
    activeTab.value = tabs[currentIndex - 1];
  }
};

const handleCancel = () => {
  // Reset form or route to cancel logic
  alert("Form cancelled");
};

const sessionNotesData = ref({
    student_id: studentId,
    case_type_id: null,
    sharedUsers: [] as { id: number; name: string }[],
    reason: '',
    notes: '',
    actions: [] as string[],
    outcome: [] as string[],
    future: [] as string[],
    mediaFiles: null,
    sessionDate: '',
    followUpNotes: '',
});

const fetchCaseTypes = async() => {
    try{
        const res = await api.get('/cases/case-types');
        allCaseTypes.value = res.data;
    } catch (err) {
        console.error('Failed to fetch case types', err);
    }
};

const fetchSessionNotes = async() => {
    try{
        const res = await api.get(`/students/session-notes/${noteId}`);
        const data = res.data;
        sessionNotesData.value={
            student_id: data.student_id,
            case_type_id: data.case_type_id || null,
            sharedUsers: data.shared_users?.map(u => ({
              id: u.shared_with_user_id,
              name: u.shared_with_name
            })) || [],
            reason: data.overview || '',
            notes: data.observation_notes || '',
            actions: data.actions_taken || [],
            outcome: data.outcome || [],
            future: data.future_actions || [],
            mediaFiles: data.media_files || [],
            sessionDate: data.follow_up_date || '',
            followUpNotes: data.notes || ''
        };
        peoplePresent.value = (data.people_present || []).map((p: {name: string; role_name: string}) => `${p.name}  - ${p.role_name}`);

    } catch (err) {
        console.error('Failed to fetch session notes', err);
    }
};
onMounted(() => {
    fetchCaseTypes();
    if(!isNaN(noteId)) fetchSessionNotes();
});


// const formErrors = ref<string[]>([]);

// const uploadedFiles = ref<File[]>([]);

// // File handler
// function handleFiles(event: Event) {
//   const files = (event.target as HTMLInputElement).files;
//   if (files) uploadedFiles.value = Array.from(files);
// }

</script>

<style scoped>
.a4-layout{
  width:210mm;
  min-height: 297mm;
  margin: 10mm auto;
  padding: 20mm;
  background: white;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 12pt;
  line-height: 1.5;
}

.a4-layout + *{
  background: white;
}

.a4-layout section {
  margin-bottom: 2rem;
}

.a4-layout h2, .a4-layout label {
  font-weight: bold;
  display: block;
  margin-top: 1rem;
  margin-bottom: 0.25rem;
}

.a4-layout p{
  margin: 0 0 0.75rem 0;
}

.a4-layout .readonly-text{
  line-height: 1.6;
}
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

.share-chip {
  margin-right: .5rem;
}

.report-actions{
  display: flex;
  justify-content: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.print-btn{
  background-color: #0a2d80;
  color: white;
  border: none;
  font-size: 14px;
  padding: .5rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.1s;
  align-items: center;
  display: flex;
  gap: 0.25rem;
}

.print-btn:hover{
  background-color: #001f5f;
  transform: translateY(-1px);
}

.report-btn{
  background-color: white;
  border: 1px solid #ccc;
  font-size: 14px;
  padding: .5rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  align-items: center;
  display: flex;
  gap: 0.25rem;
}

.report-form {
  padding: 2rem;
  background: #f4f2fd;
  border-radius: 12px;
  max-width: 960px;
  margin: auto;
}

.report-form:has(.a4-layout){
  max-width: none;
  padding: 0;
}

.report-form:has(.a4-layout) .report-actions{
  width: 210mm;
  margin: 10mm auto 1rem auto;
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

.page-break {
  display: none;
}

@media print{
  body *{
    visibility: hidden;
  }
  .report-form, .report-form *{
    visibility: visible;
  }
  .report-form{
    padding: 0;
    background: white;
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;

  }
  .a4-layout{
    width: 100%;
    margin: 0;
    padding: 20mm;
    box-shadow: none;
    border: none;
  }
  section{
    page-break-inside: avoid;
  }
  .page-break{
    display: block;
    page-break-after: always;
  }
  .no-print{
    display: none !important;
  }
}
</style>
