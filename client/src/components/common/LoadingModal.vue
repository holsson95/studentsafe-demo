<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay">
      <div class="modal modal-sm modal-alert" role="alertdialog" aria-modal="true" aria-busy="true">
        <div class="modal-body modal-loading">
          <div>
            <div class="modal-loading-spinner"></div>
            <p class="modal-title" style="margin-top: var(--space-4)">{{ message }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ modelValue: boolean; message?: string }>(), {
  message: 'Submitting…',
});
</script>
