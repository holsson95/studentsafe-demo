<template>
  <div id="app" :class="appClass">
    <button v-if="showSidebar" class="hamburger-btn" @click="sidebarOpen = !sidebarOpen"><Icon icon="mdi:menu" /></button>
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>
    <div v-if="showSidebar" class="sidebar-container" :class="{ open: sidebarOpen }">
      <Sidebar />
    </div>
    <main class="main-content" :class="{ 'no-padding': isFullScreen }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import Sidebar from './components/common/Sidebar.vue';
import { Icon } from '@iconify/vue';

// Determine route and user level
const user = JSON.parse(localStorage.getItem('user') || 'null');
const accessLevel = computed(() => {
  try{
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user ? user.access_level : null
  } catch {
    return null
  }
});
const route = useRoute();

const isOnboarding = computed(() => route.path === '/');
const isAdminPage = computed(() => route.path === '/admin');

const isFullScreen = computed(() => isOnboarding.value || isAdminPage.value);

const showSidebar = computed(() => {
  // No sidebar on onboarding or admin page for level 0
  if (isOnboarding.value || isAdminPage.value) return false;
  // Show sidebar for all other routes/users
  return true;
});

const sidebarOpen = ref(false);

const handleResize = () => {
  if (window.innerWidth > 768) {
    sidebarOpen.value = false; // Close sidebar on larger screens
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style>
#app {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 210px; /* same as your sidebar width */
  z-index: 999; /* keep it above main content */
  /* transform: translateX(-100%);
  transition: transform 0.3s ease-in-out; */
}

#app > Sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 210px; /* same as your sidebar width */
  z-index: 999; /* keep it above main content */
}
.main-content {
  flex: 1;
  overflow-y: auto;
  height: 100vh;
  padding: 1.5rem;
  margin-left:210px;
}

.main-content.no-padding {
  padding: 0;
  margin-left: 0;
  width: 100%;
  background-color: transparent;
}

#app:not(.full-screen) {
  display: flex;
}

.full-screen {
  display: block;
}


.no-padding {
  padding: 0;
  background-color: transparent;
}

.hamburger-btn, .sidebar-overlay{
  display: none;
}

@media (max-width: 1024px) and (min-width:769px){
  .sidebar-container{
    width: 170px;
  }
  .main-content {
    margin-left: 170px;
    overflow-y: auto;
  }
}

@media(max-width: 768px){
  .hamburger-btn{
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 12px;
    left: 12px;
    width: 42px;
    height: 42px;
    border: none;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 1101;
    cursor: pointer;
  }
  .sidebar-container{
    left: -100vw;
    transition: left 0.3s ease;
    z-index: 1100;
    width: 100vw;
    height: 100vh;
    top: 0;
  }
  .sidebar-container.open{
    left: 0;
  }
  .sidebar-overlay{
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1050;
  }
  .main-content{
    width: 100%;
    margin-left: 0;
    overflow-y: auto;
  }
}

</style>
