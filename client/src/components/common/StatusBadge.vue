<template>
  <span class="status-badge" :class="statusClass">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ status: string }>();

const normalized = computed(() => (props.status || '').toLowerCase().trim());

const statusClass = computed(() => {
  switch (normalized.value) {
    case 'in progress': return 'status-in-progress';
    case 'on hold': return 'status-on-hold';
    case 'resolved': return 'status-resolved';
    case 'new': return 'status-new';
    default: return 'status-default';
  }
});

const label = computed(() => {
  if (!props.status) return '';
  return props.status.replace(/\b\w/g, (c) => c.toUpperCase());
});
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}

.status-in-progress {
  background: var(--color-accent-purple-bg);
  color: var(--color-accent-purple);
}

.status-on-hold {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.status-resolved {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.status-new {
  background: var(--color-accent-info-bg);
  color: var(--color-accent-info);
}

.status-default {
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
}
</style>
