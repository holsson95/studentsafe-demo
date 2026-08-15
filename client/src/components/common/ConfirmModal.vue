<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="onCancel">
      <div class="modal modal-sm modal-alert" role="alertdialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-alert-icon" :class="iconClass">
            <Icon :icon="iconName" width="36" height="36" />
          </div>
        </div>
        <div class="modal-body">
          <h3 class="modal-title">{{ title }}</h3>
          <p v-if="message" class="modal-subtitle">{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="onCancel">{{ cancelText }}</button>
          <button type="button" class="btn" :class="confirmBtnClass" @click="onConfirm">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'warning' | 'danger' | 'info';
  }>(),
  {
    message: '',
    confirmText: 'Yes, continue',
    cancelText: 'No, go back',
    variant: 'warning',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

// modals.css defines .modal-alert-icon.success/.warning/.error/.info — "danger" maps to "error".
const iconClass = computed(() => (props.variant === 'danger' ? 'error' : props.variant));
const iconName = computed(() => {
  if (props.variant === 'danger') return 'line-md:alert-circle';
  if (props.variant === 'info') return 'line-md:alert-circle-loop';
  return 'line-md:alert';
});
const confirmBtnClass = computed(() => (props.variant === 'danger' ? 'btn-danger' : 'btn-primary'));

const onConfirm = () => {
  emit('update:modelValue', false);
  emit('confirm');
};

const onCancel = () => {
  emit('update:modelValue', false);
  emit('cancel');
};
</script>
