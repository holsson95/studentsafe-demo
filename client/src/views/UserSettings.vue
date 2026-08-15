<template>
  <div class="user-settings">
    <!-- Top banner -->
    <div class="banner"></div>

    <!-- Profile info section -->
    <div class="profile-info">
      <!-- Profile Image -->
      <div class="avatar-wrapper">
        <label for="profile-upload">
          <div
            class="avatar"
            :style="{ backgroundImage: profileImage ? `url(${profileImage})` : '' }"
          >
            <span v-if="!profileImage">{{ name.charAt(0) }}</span>
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
        <p>{{ schoolBuilding }}</p>
      </div>
    </div>

    <!-- Settings -->
     <div class="settings">
    <!-- Account Settings -->
    <section class="setting-section">
        <h4>Account Settings</h4>
        
        <div class="setting-row">
        <span>Change Password</span>
        <button class="setting-button" @click="showPasswordDialog = true">Change</button>
        </div>

        <div class="setting-row">
        <span>Two-Factor Authentication</span>
        <input type="checkbox" v-model="twoFactor" />
        </div>
    </section>

    <!-- Notification Settings -->
    <section class="setting-section">
        <h4>Notification Settings</h4>

        <div class="setting-row">
        <span>Send via Email</span>
        <input type="checkbox" v-model="emailNotif" />
        </div>

        <div class="setting-row">
        <span>Notify when new reports are added</span>
        <input type="checkbox" v-model="reportNotif" />
        </div>
    </section>
    <button class="setting-button" @click="requestLogout">Logout</button>
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

<ConfirmModal
  v-model="showLogoutConfirm"
  title="Log out?"
  message="Are you sure you want to log out of your account?"
  confirm-text="Yes, log out"
  cancel-text="Cancel"
  variant="warning"
  @confirm="performLogout"
/>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api.ts';
import axios from 'axios';
import ConfirmModal from '../components/common/ConfirmModal.vue';
import { useLogout } from '@/composables/useLogout';


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
const { showLogoutConfirm, requestLogout, performLogout } = useLogout();

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
  background: #f4f2fd;
}

.banner {
  height: 150px;
  border-radius: 12px;
  background-color: #0a3186;
  margin-bottom: -75px;
}

.profile-info {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  margin-top: 0.5rem;
}

.avatar-wrapper {
  position: relative;
  margin-right: 1rem;
  margin-top: 1rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 999px;
  background-color: #bbb;
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
  position: relative;
}

.camera-icon {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #fff;
  border-radius: 999px;
  padding: 0.25rem;
  font-size: 0.8rem;
  box-shadow: 0 0 4px rgba(0,0,0,0.2);
  width: 2rem;
  height: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}


.user-details {
  flex: 1;
  padding: 0;
  margin-top: 4rem;
}

.name-edit {
  display: flex;
  align-items: center;
}

.name-edit h3 {
  font-size: 1.5rem;
  margin: 0;
}

.name-input {
  font-size: 1.5rem;
  padding: 0.2rem 0.5rem;
}

.edit-icon {
  margin-left: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: #555;
}

.position {
  font-weight: 600;
  color: #666;
}
.settings {
  margin-top: 2rem;
  padding: 0 1rem;
}

.setting-section {
  margin-bottom: 2rem;
}

.setting-section h4 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #ddd;
}

.setting-button {
  background-color: #0a3186;
  color: #fff;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.setting-button:hover {
  background-color: #082866;
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



</style>
