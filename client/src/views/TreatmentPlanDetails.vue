<template>
  <div class="report-form">
    <div class="report-actions no-print">
      <button @click="isReportMode = !isReportMode" class="report-btn no-print">
        {{ isReportMode ? ' < Back to Tabs' : 'View as Report' }}
      </button>
      <div v-if="isReportMode">
        <button @click="printReport" class="print-btn no-print">
          <Icon icon="line-md:download" class="search-icon"/>
          Print / Save as PDF
        </button>
      </div>
      </div>
      <div :class="{ 'a4-layout': isReportMode }">    
      <h2>Student Child Protection Report</h2>
    <hr />
    <!-- Top Row -->
    <div class="top-row">
      <div class="checkboxes">
        <div v-for="type in allCaseTypes" :key="type.id">
          <label> 
            <input type="radio" v-model="treatmentPlanData.case_type_id" :value="type.id" :disabled="!!planId"/>
            {{ type.name }}
          </label>
        </div>
      </div>
    <div class="share-with">
      <span><Icon icon="line-md:account"></Icon> Shared with: </span>
      <span
        v-for="(user, index) in treatmentPlanData.sharedUsers"
        :key="user.id"
        class="share-chip"
      >
        {{ user.name }}
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
            <textarea v-model="treatmentPlanData.overview" rows="4" ></textarea>
        </div>
        <div class="input-group">
            <label>Identified Concerns</label>
        <tag-input 
            mode="single" :readonly="true" v-model="treatmentPlanData.concerns" />
        </div>
        <!-- <pre> {{ treatmentPlanData }}</pre> -->
        </section>
    </div>

    <!-- Goals -->
    <div v-show="activeTab=== 'goals'">
        <section>
            <div class="form-grid">
                <div class="form-item">
                    <label>Short Term Goals</label>
                    <tag-input mode="single" :readonly="true" v-model="treatmentPlanData.shortTermGoals"/>
                </div>
                <div class="form-item">
                    <label>Long Term Goals</label>
                    <tag-input :readonly="true" mode="single" v-model="treatmentPlanData.longTermGoals"/>
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
                    <tag-input :readonly="true" mode="single" v-model="treatmentPlanData.emotionalSupport"/>
                </div>
                <div class="form-item">
                    <label>Parental Involvement</label>
                    <tag-input :readonly="true" mode="single" v-model="treatmentPlanData.parentalInvolvement"/>
                </div>

                <!-- Second row -->
                <div class="form-item">
                    <label>Skill Development</label>
                    <tag-input :readonly="true" mode="single" v-model="treatmentPlanData.skillDevelopment"/>
                </div>
                <div class="form-item">
                    <label>Peer Interaction</label>
                    <tag-input :readonly="true" mode="single" v-model="treatmentPlanData.peerInteraction"/>
                </div>
        
                <!-- Third row -->
                <div class="form-item">
                    <label>Academic Support</label>
                    <tag-input :readonly="true" mode="single" v-model="treatmentPlanData.academicSupport"/>
                </div>
                <div class="form-item">
                    <label>Follow-up</label>
                    <tag-input :readonly="true" mode="single" v-model="treatmentPlanData.followUp"/>
                </div>
            </div>
        </section>
    </div>
    <!-- Overview -->
    <div v-show= "activeTab ==='metrics'">
        <section>
            <label>Metrics for Success</label>
            <tag-input :readonly="true" mode="single" 
            v-model="treatmentPlanData.metrics"/>
        <div class="input-group">
            <label>Notes</label>
            <textarea v-model="treatmentPlanData.notes" rows="4"></textarea>
        </div>
        </section>
    </div>
    <!-- Buttons -->
    <div class="form-buttons-wrapper">
      
        <button v-if="activeTab !== 'overview'" @click="previousTab" class="prev-btn">Previous</button>
        <span v-else class="prev-placeholder"></span>
        
        <div class="form-buttons">
                <button v-if="activeTab !== 'metrics'" type="button" @click="nextTab" class="next-btn">Next</button>
        </div>
    </div>
</template>

<template v-else>
  <div class="report-view">
    <section>
      <h3>Overview</h3>
      <p>{{ treatmentPlanData.overview }}</p>
      <h4>Identified Concerns</h4>
      <div class="tag-list">
        <span v-for="(c, i) in treatmentPlanData.concerns" :key="i" class="tag">
          {{ c }}
        </span>
      </div>
    </section>
    <section>
      <h3>Goals</h3>
      <h4>Short Term Goals</h4>
      <div class="tag-list">
        <span v-for="(g, i) in treatmentPlanData.shortTermGoals" :key="i" class="tag">
          {{ g }}
        </span>
      </div>
      <h4>Long Term Goals</h4>
      <div class="tag-list">
        <span v-for="(g, i) in treatmentPlanData.longTermGoals" :key="i" class="tag">
          {{ g }}
        </span>
      </div>
    </section>
    <section>
      <h3>Strategies & Interventions</h3>
      <div class="strategy-group">
        <h4>Emotional Support</h4>
        <div class="tag-list">
          <span v-for="(s, i) in treatmentPlanData.emotionalSupport" :key="i" class="tag">
            {{ s }}
          </span>
        </div>
      </div>
      <div class="strategy-group">
        <h4>Parental Involvement</h4>
        <div class="tag-list">
          <span v-for="(s, i) in treatmentPlanData.parentalInvolvement" :key="i" class="tag">
            {{ s }}
          </span>
        </div>
      </div>
      <div class="strategy-group">
        <h4>Skill Development</h4>
        <div class="tag-list">
          <span v-for="(s, i) in treatmentPlanData.skillDevelopment" :key="i" class="tag">
            {{ s }}
          </span>
        </div>
      </div>
      <div class="strategy-group">
        <h4>Peer Interaction</h4>
        <div class="tag-list">
          <span v-for="(s, i) in treatmentPlanData.peerInteraction" :key="i" class="tag">
            {{ s }}
          </span>
        </div>
      </div>
      <div class="strategy-group">
        <h4>Academic Support</h4>
        <div class="tag-list">
          <span v-for="(s, i) in treatmentPlanData.academicSupport" :key="i" class="tag">
            {{ s }}
          </span>
        </div>
      </div>
      <div class="strategy-group">
        <h4>Follow-up</h4>
        <div class="tag-list">
          <span v-for="(s, i) in treatmentPlanData.followUp" :key="i" class="tag">
            {{ s }}
          </span>
        </div>
        </div>
        </section>
        <section>
          <h3>Metrics for Success & Notes</h3>
          <div class="tag-list">
            <span v-for="(m, i) in treatmentPlanData.metrics" :key="i" class="tag">
              {{ m }}
            </span>
          </div>
          <h4>Notes</h4>
          <p>{{ treatmentPlanData.notes }}</p>
        </section>
      </div>
      </template>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, readonly } from 'vue';
import api from '../services/api';
import Multiselect from 'vue-multiselect';
import {useRoute, useRouter} from 'vue-router';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import tagInput from '@/components/forms/TagInput.vue';
const route = useRoute();
const router = useRouter();
const studentId = Number(route.params.studentId);
const planId = Number(route.params.planId);
const allCaseTypes = ref<any[]>([]);
const sharedUsers = ref([]);
console.log('Route.params:', route.params);
console.log('planId:', Number(route.params.planId));

const treatmentPlanData = ref({
    student_id: studentId,
    case_type_id: null,
    sharedUsers: [] as { id: number; name: string }[],
    overview: '',
    notes: '',
    concerns: [],
    shortTermGoals: [],
    longTermGoals: [],
    emotionalSupport: [],
    parentalInvolvement: [],
    skillDevelopment: [],
    peerInteraction: [],
    academicSupport: [],
    followUp: [],
    metrics: []
});

const tabs = ['overview', 'goals', 'strategies', 'metrics'] as const;
type Tab = typeof tabs[number];

const activeTab = ref<Tab>('overview');
const isReportMode = ref(false);

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

const fetchCaseTypes = async() => {
  try{
    const res = await api.get('/cases/case-types');
    allCaseTypes.value = res.data;
  } catch (err) {
    console.error('Failed to fetch data', err);
  }
};

const fetchTreatmentPlan = async () => {
    try{
        const res = await api.get(`/students/treatment-plans/${planId}`);
        const data = res.data;
        console.log('Fetched treatment plan', data);
            treatmentPlanData.value = {
                student_id: data.student_id,
                case_type_id: data.case_type_id || null,
                sharedUsers: data.shared_users?.map(u => ({
                  id: u.shared_with_user_id,
                  name: u.shared_with_name
                })) || [],
                overview: data.student_overview || '',
                notes: data.notes || '',
                concerns: data.concerns || [],
                shortTermGoals: data.short_term_goals || [],
                longTermGoals: data.long_term_goals || [],
                emotionalSupport: data.emotional_support || [],
                parentalInvolvement: data.parental_involvement || [],
                skillDevelopment: data.skill_dev || [],
                peerInteraction: data.peer_interaction || [],
                academicSupport: data.acad_support || [],
                followUp: data.follow_up || [],
                metrics: data.metrics || [],
            };
    } catch (err) {
        console.error('Failed to fetch treatment plan', err);
    }
};

const printReport = () => {
  isReportMode.value = true;
  window.print();
};

onMounted(() => {
  fetchCaseTypes();
  if(!isNaN(planId)){
  fetchTreatmentPlan();
  }
});

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
  margin-right: 0.5rem;
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

.left-buttons{
  width: 100px;
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

.page-break{
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
    min-height: 297mm;
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
