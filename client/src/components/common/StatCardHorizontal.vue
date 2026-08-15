<template>
  <div class="stat-card-h" :class="`accent-${accent}`" :role="clickable ? 'button' : undefined" @click="clickable && $emit('click')">
    <div class="label">{{ label }}</div>
    <div class="value">{{ value }}</div>
    <div class="helper" :class="{ link: clickable }">{{ helperText }}<span v-if="clickable"> →</span></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: number | string;
  helperText: string;
  accent: 'blue' | 'purple' | 'green' | 'red';
  clickable?: boolean;
}>();

defineEmits<{ (e: 'click'): void }>();
</script>

<style scoped>
.stat-card-h {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  height: 100%;
  box-sizing: border-box;
  border-left: 4px solid transparent;
  transition: box-shadow var(--transition-slow), transform var(--transition-slow);
}

.stat-card-h[role='button'] {
  cursor: pointer;
}

.stat-card-h:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.helper {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.accent-blue { border-left-color: var(--color-accent-info); }
.accent-blue .helper { color: var(--color-accent-info); }

.accent-purple { border-left-color: var(--color-accent-purple); }
.accent-purple .helper { color: var(--color-accent-purple); }

.accent-green { border-left-color: var(--color-success); }
.accent-green .helper { color: var(--color-success); }

.accent-red { border-left-color: var(--color-severity-high); }
.accent-red .helper { color: var(--color-severity-high); }
</style>
