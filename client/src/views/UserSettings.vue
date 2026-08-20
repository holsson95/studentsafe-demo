<template>
  <div class="user-settings">
    <div class="page-header">
      <span class="page-title">My profile</span>
      <button class="menu-button" type="button" aria-label="More options">
        <Icon icon="mdi:dots-horizontal"/>
      </button>
    </div>

    <!-- Top banner -->
    <div class="banner">
      <!-- Profile info section -->
      <div class="profile-info">
        <!-- Profile Image -->
        <div class="avatar-wrapper">
          <label for="profile-upload">
            <div class="avatar-ring">
              <div
                class="avatar"
                :style="{ backgroundImage: profileImage ? `url(${profileImage})` : '' }"
              >
                <span v-if="!profileImage">{{ name.charAt(0) }}</span>
              </div>
            </div>
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              @change="onImageChange"
              hidden
            />
            <div class="camera-icon">
              <Icon icon="mdi-light:camera"/>
            </div>
          </label>
        </div>

        <!-- Text Info -->
        <div class="user-details">
          <div class="name-edit">
            <input
              v-if="editingName"
              v-model="name"
              class="name-input"
              @blur="editingName = false"
              @keyup.enter="editingName = false"
            />
            <h3 v-else>
              {{ name }}
              <span @click="editingName = true"><Icon icon="line-md:edit" class="edit-icon"/></span>
            </h3>
          </div>
          <p class="position">{{ role }}</p>
          <p class="school">{{ schoolBuilding }}</p>
        </div>
      </div>
    </div>

    <!-- Settings -->
     <div class="settings">
    <!-- Account Settings -->
    <section class="setting-section">
        <h4>Account settings</h4>

        <div class="setting-row">
          <div class="setting-label">
            <span>Password</span>
            <span class="setting-subtext">Last changed 3 months ago</span>
          </div>
          <button class="setting-button" @click="showPasswordDialog = true">Change</button>
        </div>

        <div class="setting-row">
          <div class="setting-label">
            <span>Two-factor authentication</span>
            <span class="setting-subtext">Require a code from an authenticator app.</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="twoFactor" />
            <span class="toggle-slider"></span>
          </label>
        </div>
    </section>

    <!-- Notification Settings -->
    <section class="setting-section">
        <h4>Notification settings</h4>

        <div class="setting-row">
          <div class="setting-label">
            <span>Send notifications by email</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="emailNotif" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-label">
            <span>Notify when new reports are added</span>
            <span class="setting-subtext">Get an alert when a case report comes in.</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="reportNotif" />
            <span class="toggle-slider"></span>
          </label>
        </div>
    </section>
    </div>
</div>
<!-- Password Change Dialog -->
<div v-if="showPasswordDialog" class="dialog-backdrop" @click.self="handleCancelPasswordDialog">
  <div class="dialog">
    <h3>Change Password</h3>
    <input type="password" placeholder="New password" v-model="newPassword" />
    <input type="password" placeholder="Confirm password" v-model="confirmPassword" />
    <div class="dialog-actions">
      <button @click="handleCancelPasswordDialog">Cancel</button>
      <button>Save</button>
    </div>

  </div>


</div>

<ConfirmModal
  v-model="showDiscardPasswordConfirm"
  title="Discard password change?"
  message="You've entered a password but haven't saved it. Are you sure you want to cancel?"
  confirm-text="Yes, discard"
  cancel-text="No, keep editing"
  variant="danger"
  @confirm="closePasswordDialog"
/>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api.ts';
import axios from 'axios';
import ConfirmModal from '../components/common/ConfirmModal.vue';

// Dummy user info
const name = ref('')
const editingName = ref(false)
const role = ref('')
const schoolBuilding = ref('')

const profileImage = ref<string | null>(null)

function onImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) profileImage.value = URL.createObjectURL(file)
}

const twoFactor = ref(false)
const emailNotif = ref(true)
const reportNotif = ref(false)

const showPasswordDialog = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const showDiscardPasswordConfirm = ref(false)

const closePasswordDialog = () => {
  showPasswordDialog.value = false;
  newPassword.value = '';
  confirmPassword.value = '';
};

const handleCancelPasswordDialog = () => {
  if (newPassword.value || confirmPassword.value) {
    showDiscardPasswordConfirm.value = true;
  } else {
    closePasswordDialog();
  }
};

const router = useRouter();

onMounted(async () => {
  try{
    const res = await api.get('/users/me');
    const user = res.data;

    name.value = user.name;
    role.value = user.role;
    schoolBuilding.value = user.schoolBuilding;
  } catch (err) {
    console.error('Failed to fetch data', err);
  }
});

</script>

<style scoped>
.user-settings {
  padding: 1.5rem;
  background: var(--color-bg-page);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-title {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: var(--radius-lg);
  background: var(--color-bg-card);
  box-shadow: var(--shadow-card);
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  cursor: pointer;
}

.menu-button:hover {
  background: var(--color-bg-hover);
}

.banner {
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  box-shadow: var(--shadow-card-elevated);
  padding: 1.75rem;
}

.profile-info {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  margin-right: 1.25rem;
}

.avatar-ring {
  width: 108px;
  height: 108px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-inverse);
  position: relative;
}

.camera-icon {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: #fff;
  border-radius: 999px;
  padding: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-primary);
  box-shadow: 0 0 4px rgba(0,0,0,0.2);
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-details {
  flex: 1;
  padding: 0;
}

.name-edit {
  display: flex;
  align-items: center;
}

.name-edit h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-inverse);
  margin: 0;
}

.name-input {
  font-size: 1.5rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  border: none;
}

.edit-icon {
  margin-left: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
}

.position {
  font-weight: 600;
  color: var(--color-text-inverse);
  margin: 0.35rem 0 0;
}

.school {
  color: rgba(255, 255, 255, 0.75);
  margin: 0.15rem 0 0;
}

.settings {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-section {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: 1.5rem;
}

.setting-section h4 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin: 0 0 1rem;
  color: var(--color-text-primary);
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--color-border-light);
}

.setting-row:last-child {
  border-bottom: none;
  padding-bottom: 0.25rem;
}

.setting-row:first-of-type {
  padding-top: 0.25rem;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.setting-subtext {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.setting-button {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-weight: 600;
  padding: 0.5rem 1.1rem;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
}

.setting-button:hover {
  background-color: var(--color-primary-hover);
}

.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: var(--color-border-light);
  border-radius: var(--radius-full);
  transition: background var(--transition-fast);
  cursor: pointer;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  top: 3px;
  background: #fff;
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
}

.toggle input:checked + .toggle-slider {
  background: var(--color-accent-info);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

/* Dialog styles */
.dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.dialog {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 300px;
  max-width: 90%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.dialog input {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.dialog-actions button {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-actions button:first-child {
  background: #eee;
}

.dialog-actions button:last-child {
  background: #0a3186;
  color: white;
}

@media (max-width: 768px) {
  .user-settings {
    padding: 1rem;
  }

  .banner {
    padding: 1.25rem;
  }

  .profile-info {
    flex-wrap: wrap;
  }

  .avatar-ring {
    width: 88px;
    height: 88px;
  }

  .name-edit h3 {
    font-size: 1.25rem;
  }

  .setting-section {
    padding: 1.25rem;
  }

  .setting-row {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}

</style>
