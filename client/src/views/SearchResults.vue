<template>
    <div class="search-page">
        <h2>Search results for: <strong>{{ query }}</strong></h2>
        <div v-if="loading">Searching...</div>

        <div v-else>
            <section v-if="results.students.length" class="results-section">
                <h3 class="section-title">Students</h3>
                <div class="results-grid">
                <div v-for="s in results.students" :key="s.id" class="search-item student-card" @click="$router.push(`/student-history/${s.id}`)">
                    <div class="student-name"><strong>{{ s.student_name }}</strong><span v-if="s.nickname" class="student-nickname">, {{ s.nickname }}</span></div>
                        <div class="student-nationality">{{ s.nationality }}</div>
                    <div class="student-info-group">
                        <div class="student-cohort">{{ s.cohort_name }}</div>
                        <div class="student-abbreviation">{{ s.school_name }}</div>
                    </div>
                </div>
                </div>
                <div class="view-more">
                    <button v-if="results.students.length && !loadingStudents" @click="fetchResults('students', true)">Load more</button>
                </div>
            </section>
            <section v-if="results.cases.length" class="results-section">
                <h3 class="section-title">Cases</h3>
                <div class="results-grid">
                <div v-for="c in results.cases" :key="c.id" class="search-item case-card" @click="$router.push(`/reportview/${c.id}`)">
                    <div class="case-top-row">
                        <div class="case-category">{{ c.category_name }}</div>
                        <div class="case-badges">
                        <button class="case-severity" :class="`severity-${(c.severity|| '').toLowerCase()}`">{{ c.severity || 'unknown' }} </button>
                        <button class="case-status">{{ c.status }}</button>
                        </div>
                    </div>
                    <div class="case-name"><strong>{{ c.student_name }}</strong><span v-if="c.nickname" class="case-nickname">, {{ c.nickname }}</span></div>
                    <div class="case-nationality">{{ c.nationality }}</div>
                    <div class="case-info-group">
                        <div class="case-cohort">{{ c.cohort_name }}</div>
                        <div class="case-date">{{ formatDate(c.created_at) }}</div>
                    </div>
                </div>
                </div>
                <div class="view-more">
                    <button v-if="results.cases.length && !loadingCases" @click="fetchResults('cases', true)">Load more</button>
                </div>
            </section>
            <div v-if="!hasResults">
                No results found.
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch }  from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const query = ref(route.query.query || '')
const loading = ref(false);
const results = ref({ students: [], cases: [] });
const limit = 12;
const caseOffset = ref(0);
const studentOffset = ref(0);
const loadingCases = ref(false);
const loadingStudents = ref(false);
const hasResults = computed(() => results.value.students.length || results.value.cases.length);

const fetchResults = async(type: 'cases' | 'students', append = false) => {
    if (!query.value) return;
    if(type === 'cases') loadingCases.value = true;
    if(type === 'students') loadingStudents.value = true;

    try{
        const res = await api.get('/search', {
            params: { query: query.value, limit, caseOffset: caseOffset.value, studentOffset: studentOffset.value, type
            }
        });
        if(type === 'cases') {
            results.value.cases.push(...res.data.cases);
            caseOffset.value += limit;
        }
        if(type === 'students') {
            results.value.students.push(...res.data.students);
            studentOffset.value += limit;
        }
    } finally {
        loadingCases.value = false;
        loadingStudents.value = false;
    }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const initialSearch = async() => {
    caseOffset.value = 0;
    studentOffset.value = 0;
    results.value = { students: [], cases: [] };
    await fetchResults('cases');
    await fetchResults('students');
};

watch( () => route.query.query, (newQuery) => {
    query.value = newQuery || '';
    if (query.value) initialSearch();
}, { immediate: true });
</script>

<style>

.search-page {
    padding: 1rem;
    width: 100%;
    font-family: var(--font-family-main);
}

.search-page h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.results-section{
    margin-top: 1.5rem;
}

.section-title{
    font-size: 1rem;
    font-weight: 600;
    color: #121212;
}

.results-grid{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(clamp(280px, 33.33%, 280px), 1fr));
    gap: 1rem;
    margin-top: 1rem;
    margin-left: auto;
    margin: auto;
}

.search-item{
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: background 0.2s ease, box-shadow 0.2s ease;
}

.search-item:hover{
    background-color: #f9fafb;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.view-more{
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

.view-more button {
    text-align: center;
    margin-top: 1rem;
    font-weight: bold;
    cursor: pointer;
    color: #666;
    border: none;
    background-color: transparent;
}

.student-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 90px;
}

.student-name, .case-name{
    font-size: 0.8rem;
    color: #111827;
}

.student-name strong, .case-name strong{
    font-weight: 600;
}

.student-nickname, .case-nickname{
    font-size: 0.8rem;
    font-weight: 400;
    color: #6b7280;
}

.student-info-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
}

.student-cohort{
    border-radius: 999px;
    font-weight: 400;
    font-size: 0.75rem;
}

.student-nationality{
    font-size: 0.75rem;
    font-weight: 400;
}

.student-abbreviation{
    font-size: 0.75rem;
    white-space: nowrap;
    font-weight: 400;
}

.case-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 90px;
}

.case-top-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.case-category{
    flex: 1;
    min-width: 0;
    font-size: 0.75rem;
    font-weight: 400;
    color: #374151;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.case-badges {
    display: flex;
    gap: 0.5rem;
    font-weight: 400rem;
}

.case-severity, .case-status {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 12px;
    border: none;
}

.case-info-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
}

.case-nationality{
    font-weight: 400;
    font-size: 0.7rem;
}

.case-cohort{
    border-radius: 999px;
    font-weight: 400;
    font-size: 0.75rem;
}

.case-date{
    font-size: 0.75rem;
    font-weight: 400;
}

.case-severity{
    background-color: white;
    color: #3730a3;
}

.severity-low{
    background:#0700db;
    color: white;
}

.severity-medium{
    background:#fea10b;
    color: white;
}

.severity-high{
    background:#db0004;
    color: white;
}

.case-status{
    background-color: transparent;
    border: solid 0.5px;
}

</style>
