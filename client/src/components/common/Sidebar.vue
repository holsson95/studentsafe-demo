<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="logo">
      <img :src="logo" class="logo-sidebar">
      <h1 class="title">Student<br/>Safe</h1>
    </div>

    <!-- Search -->
    <form v-if="accessLevel === 1 || accessLevel === 2 || accessLevel === 3" class="search-container" @submit.prevent="handleSearch">
      <input class="search-input" type="text" placeholder="search" v-model="search"/>
      <span ><Icon icon="line-md:search" class="search-icon"/></span>
    </form>

    <!-- Navigation -->
    <nav class="nav">
      <RouterLink v-if="accessLevel === 1 || accessLevel === 2 || accessLevel === 3" :to="dashboardRoute" class="nav-item" active-class="active">
        <Icon icon="line-md:home-simple" class="icon"/>
        Dashboard
      </RouterLink>
      <div class="nav-label">Case Management</div>
      <div v-if="accessLevel === 1 || accessLevel === 2 || accessLevel === 4">
        <RouterLink to="/file-report" class="nav-item" active-class="active"><Icon icon="line-md:document-add" class="icon"/>File Report</RouterLink>
      </div>
      <div>
        <RouterLink to="/reports" class="nav-item" active-class="active"><Icon icon="line-md:clipboard-list" class="icon"/>Report List</RouterLink>
      </div>
      <div v-if="accessLevel === 1 || accessLevel === 2 || accessLevel === 3">
        <RouterLink to="/students" class="nav-item" active-class="active"><Icon icon="line-md:person" class="icon"/>Student History</RouterLink>
      </div>
      <!--Level 2 and 3 user analytics section-->
      <div v-if="accessLevel === 2 || accessLevel === 3">
        <div class="nav-label">Analytics</div>
        <div>
          <RouterLink to="/report-summary" class="nav-item" active-class="active">
            <Icon icon="line-md:folder-multiple" class="icon"/>Report Summary
          </RouterLink>
        </div>
      </div>

      <div v-if="accessLevel === 1 || accessLevel === 2 || accessLevel === 3" class="nav-label">System</div>
      <div v-if="accessLevel === 1 || accessLevel === 2 || accessLevel === 3">
        <RouterLink to="/notifications" class="nav-item" active-class="active"><Icon icon="line-md:bell" class="icon"/>Notifications</RouterLink>
      </div>
      <div v-if="accessLevel === 1 || accessLevel === 2 || accessLevel === 3">
        <RouterLink to="/privacy-policy" class="nav-item" active-class="active"><Icon icon="line-md:security" class="icon"/>Privacy Policy</RouterLink>
      </div>
      <div v-if="accessLevel === 1 || accessLevel === 2 || accessLevel === 3">
        <RouterLink to="/settings" class="nav-item" active-class="active"><Icon icon="line-md:cog" class="icon"/>Settings</RouterLink>
      </div>
    </nav>

    <!-- User Info -->
    <div v-if="accessLevel === 1 || accessLevel === 2 || accessLevel === 3">
      <RouterLink to="/settings" class="user-info">
        <div class="avatar">{{ userName.charAt(0) }}</div>
        <div>
          <div class="username">{{ userName }}</div>
          <div class="user-details">{{ role }}</div>
        </div>
        <div class="icon-wrapper4">
          <Icon icon="line-md:logout" class="icon4" @click.stop.prevent="requestLogout"/>
        </div>
      </RouterLink>
    </div>
    <div v-if="accessLevel === 4" class="user-info4">
        <div class="avatar">{{ userName.charAt(0) }}</div>
        <div>
          <div class="username">{{ userName }}</div>
          <div class="user-details">{{ role }}</div>
        </div>
        <div class="icon-wrapper4">
          <Icon icon="line-md:logout" class="icon4" @click.stop.prevent="requestLogout"/>
        </div>
    </div>

    <ConfirmModal
      v-model="showLogoutConfirm"
      title="Log out?"
      message="Are you sure you want to log out of your account?"
      confirm-text="Yes, log out"
      cancel-text="Cancel"
      variant="warning"
      @confirm="performLogout"
    />
  </aside>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api'
import logo from '@/assets/sc_logo2.png';
import ConfirmModal from './ConfirmModal.vue';
import { useLogout } from '@/composables/useLogout';
// import axios from 'axios';
// import { useRouter } from 'vue-router';

const router = useRouter();
const { showLogoutConfirm, requestLogout, performLogout } = useLogout();

const userName = ref('');
const role = ref('');
const dashboardRoute = ref('/dashboard'); // default for level 1
const accessLevel = ref(0);
const search = ref('');
let timer: ReturnType<typeof setTimeout>;

watch(search, (val) => {
  clearTimeout(timer);

  timer = setTimeout(() => {
    const trimmed = val.trim();

    if(trimmed.length >= 1) {
      router.replace({
        path: '/search',
        query: { query: trimmed }
      });
    }
  }, 300);
});

const handleSearch = () => {
  if(!search.value.trim()) return;
    router.push({ 
      path: '/search',
      query: { query: search.value.trim() }
    });
};

onMounted(async () => {
  try{
    const res = await api.get('users/me');
    const user = res.data;
    userName.value = user.name;
    role.value = user.role;
    accessLevel.value = user.access_level;
    if (user.access_level !== 1) {
      dashboardRoute.value = '/dashCPO'; 
    }
  } catch (err) {
    console.error('Failed to fetch data', err);
  }
});
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

.sidebar {
  width: 210px;
  height: 100vh;
  background: linear-gradient(180deg, var(--sidebar-gradient-top) 0%, var(--sidebar-gradient-mid) 35%, var(--sidebar-gradient-bottom) 100%);
  font-family: var(--font-family-main);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  box-shadow: 2px 0 8px var(--sidebar-shadow);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.logo-sidebar{
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: block;
}

.circle {
  width: 40px;
  height: 40px;
  background-color: var(--color-primary);
  border-radius: 50%;
}

.title {
  font-weight: var(--font-bold);
  font-size: var(--font-header);
  color: #ffffff;
  line-height: 1;
  margin: 0;
  flex-direction: column;
  justify-content: center;
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
}

.search-container {
  display: flex;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--sidebar-divider);
  box-shadow: none;
  padding: 0.3rem 0.7rem;
  border-radius: 9999px;
  align-items: center;
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: all 0.2s ease;
  width: 100%;
}

.search-container:hover{
  border-color: rgba(255, 255, 255, 0.25);
  width: 100%;
}

.search-container:focus-within{
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  width: 100%;
}

.search-input {
  border: none;
  outline: none;
  flex: 1;
  font-size: var(--font-body);
  min-width: 0;
  margin-left: 0.5rem;
  background: transparent;
  color: #ffffff;
}

.search-input::placeholder{
  color: rgba(255, 255, 255, 0.6);
}
.search-icon {
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
}

.nav {
  flex-grow: 1;
}

.nav-label {
  font-size: 0.7rem;
  color: rgba(232, 238, 249, 0.6);
  margin-top: 1rem;
  margin-bottom: 0.2rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--sidebar-divider);
}

.nav-item {
  font-size: var(--font-body);
  padding: 0.5rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: var(--sidebar-active-radius);
  cursor: pointer;
  color: var(--sidebar-text-inactive);
}

.nav-item:hover {
  background-color: var(--sidebar-active-hover-bg);
}

.nav-item.active {
  background-color: var(--sidebar-active-bg);
  color: var(--sidebar-icon-active);
}

.nav-item.active .icon{
    color: var(--sidebar-icon-active);
}


/* .nav .nav-item{
  margin-right: 2rem;
} */

.user-info {
  background-color: var(--sidebar-user-card-bg);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
}

.user-info4 {
  background-color: var(--sidebar-user-card-bg);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
}

.icon-wrapper4{
  margin-left: auto;
}

.avatar {
  width: 2rem;
  height: 2rem;
  background: white;
  color: var(--color-primary);
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.username {
  font-weight: var(--font-bold);
}

.user-details {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
}

.icon{
  width: 24;
  color: var(--sidebar-icon-inactive);
}

.icon4{
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;

}

.setting-button {
  background-color: #0a3186;
  color: #fff;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: 100%;
}
</style>
