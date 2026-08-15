<template>
  <div class="report-form">
    <h2>Student Child Protection Report</h2>
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
          track-by="name"
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
        :class="{ active: activeTab === 'goals' }"
        @click="activeTab = 'goals'"
      >Goals</button>
      <button
        :class="{ active: activeTab === 'strategies' }"
        @click="activeTab = 'strategies'"
      >Strategies & Interventions</button>
      <button
        :class="{ active: activeTab === 'metrics' }"
        @click="activeTab = 'metrics'"
      >Metrics for Success & Notes</button>
    </div>

    <!-- Overview -->
    <div v-show= "activeTab ==='overview'">
        <section>
        <div class="input-group">
            <label>Student Overview</label>
            <textarea v-model="overview" rows="4" placeholder="Input text"></textarea>
        </div>
        <div class="input-group">
            <label>Identified Concerns</label>
        <tag-input 
            v-model="concerns"
            mode = 'single'
            label="Identified Concerns"
        />
        </div>
        </section>
    </div>

    <!-- Goals -->
    <div v-show="activeTab=== 'goals'">
        <section>
            <div class="form-grid">
                <div class="form-item">
                    <label>Short Term Goals</label>
                    <tag-input v-model="shortTermGoals" mode = 'single' label="Emotional Support" />
                </div>
                <div class="form-item">
                    <label>Long Term Goals</label>
                    <tag-input v-model="longTermGoals" mode = 'single' label="Parental Involvement" />
                </div>
            </div>
        </section>
    </div>
    <!-- Strategies -->
    <div v-show="activeTab=== 'strategies'">
        <section>
            <div class="form-grid">
                <!-- First row -->
                <div class="form-item">
                    <label>Emotional Support</label>
                    <tag-input v-model="emotionalSupport" mode = 'single' label="Emotional Support" />
                </div>
                <div class="form-item">
                    <label>Parental Involvement</label>
                    <tag-input v-model="parentalInvolvement" mode = 'single' label="Parental Involvement" />
                </div>

                <!-- Second row -->
                <div class="form-item">
                    <label>Skill Development</label>
                    <tag-input v-model="skillDevelopment" mode = 'single' label="Skill Development" />
                </div>
                <div class="form-item">
                    <label>Peer Interaction</label>
                    <tag-input v-model="peerInteraction" mode = 'single' label="Peer Interaction" />
                </div>
        
                <!-- Third row -->
                <div class="form-item">
                    <label>Academic Support</label>
                    <tag-input v-model="academicSupport" mode = 'single' label="Academic Support" />
                </div>
                <div class="form-item">
                    <label>Follow-up</label>
                    <tag-input v-model="followUp" mode = 'single' label="Follow-up" />
                </div>
            </div>
        </section>
    </div>
    <!-- Overview -->
    <div v-show= "activeTab ==='metrics'">
        <section>
            <label>Metrics for Success</label>
            <tag-input 
            v-model="metrics"
            mode = 'single'
            label="Metrics"
        />
        <div class="input-group">
            <label>Notes</label>
            <textarea v-model="notes" rows="4" placeholder="Input text"></textarea>
        </div>
        </section>
    </div>
    <!-- Buttons -->
    <div class="form-buttons-wrapper">
      
        <button v-if="activeTab !== 'overview'" @click="previousTab" class="prev-btn">Previous</button>
        <span v-else class="prev-placeholder"></span>
        
        <div class="form-buttons">
            <button type="button" @click="handleCancel" class="cancel-btn">Cancel</button>

            <template v-if="activeTab !== 'metrics'">
                <button type="button" @click="nextTab" class="next-btn">Next</button>
            </template>

            <template v-else>
                <button type="submit" class="submit-btn" @click="submitForm">Submit</button>
            </template>
        </div>
    </div>

    <ConfirmModal
      v-model="showCancelConfirm"
      title="Cancel this treatment plan?"
      message="Any information you've entered will be lost. Are you sure you want to cancel?"
      confirm-text="Yes, cancel"
      cancel-text="No, keep editing"
      variant="danger"
      @confirm="confirmCancel"
    />
    <LoadingModal v-model="isSubmitting" message="Submitting treatment plan…" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';
import Multiselect from 'vue-multiselect';
import {useRoute, useRouter} from 'vue-router';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import tagInput from '@/components/forms/TagInput.vue';
import ConfirmModal from '../components/common/ConfirmModal.vue';
import LoadingModal from '../components/common/LoadingModal.vue';
const route = useRoute();
const router = useRouter();
const studentId = Number(route.params.studentId);
const showCancelConfirm = ref(false);
const isSubmitting = ref(false);

const overview = ref('');
const concerns = ref([]);
const shortTermGoals = ref([]);
const longTermGoals = ref([]);
const emotionalSupport = ref([]);
const parentalInvolvement = ref([]);
const skillDevelopment = ref([]);
const peerInteraction = ref([]);
const academicSupport = ref([]);
const metrics = ref([]);
const notes = ref('');
const followUp = ref('');

const tabs = ['overview', 'goals', 'strategies', 'metrics'] as const;
type Tab = typeof tabs[number];

const activeTab = ref<Tab>('overview');

const availableCounselors = ref([]);
const selectedCounselors = ref([]);
const allCaseTypes = ref([]);
const selectedCaseType = ref<number | null>(null);

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
  showCancelConfirm.value = true;
};

const confirmCancel = () => {
  router.back();
};

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

onMounted(() => {
  fetchUsers();
  fetchCaseTypes();
});

const submitForm = async() => {
  isSubmitting.value = true;
  try{
    const payload = {
      student_id: studentId,
      case_type_id: selectedCaseType.value,
      student_overview: overview.value,
      concerns: concerns.value,
      short_term_goals: shortTermGoals.value,
      long_term_goals: longTermGoals.value, 
      emotional_support: emotionalSupport.value,
      parental_involvement: parentalInvolvement.value,
      skill_development:skillDevelopment.value,
      peer_interaction: peerInteraction.value,
      academic_support: academicSupport.value,
      follow_up: followUp.value,
      metrics: metrics.value,
      notes: notes.value,
      shared_with_user_ids: selectedCounselors.value.map(c => c.id)
    };
    const res = await api.post(`/students/${studentId}/treatment-plan`, payload);
    console.log('Treatment Plan created: ', res.data);
    router.back();
  } catch (err){
      console.error('Error submitting treatment plan', err);
      alert('Failed to submit treatment plan');
    } finally {
      isSubmitting.value = false;
    }
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
