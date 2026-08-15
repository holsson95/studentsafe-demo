<template>
  <div class="alert-strip">
    <div class="section left" @click="$emit('primary-click')">
      <Icon :icon="variant === 'link' ? 'mingcute:alert-line' : 'fluent:alert-16-regular'" class="section-icon" />
      <div>
        <div class="bold-text">{{ count }} cases need your attention</div>
        <div class="subtext">High priority cases</div>
      </div>
    </div>
    <div class="divider"></div>
    <div v-if="variant === 'link'" class="section right" @click="$router.push('/notifications')">
      <Icon icon="fluent:alert-16-regular" class="section-icon" />
      <div>
        <div class="bold-text">Stay informed</div>
        <div class="subtext">View all alerts and updates</div>
      </div>
      <Icon icon="line-md:chevron-small-right" class="chevron" />
    </div>
    <div v-else class="section right button-section">
      <button class="review-btn" @click="$emit('primary-click')">
        Review Now <Icon icon="line-md:chevron-small-right" class="chevron" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  variant: 'link' | 'button';
  count: number;
}>();

defineEmits<{ (e: 'primary-click'): void }>();
</script>

<style scoped>
.alert-strip {
  display: flex;
  align-items: center;
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: var(--space-4);
  gap: var(--space-4);
}

.section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  cursor: pointer;
}

.button-section {
  justify-content: flex-end;
  cursor: default;
}

.section-icon {
  font-size: 24px;
  color: var(--color-severity-high);
  flex-shrink: 0;
}

.bold-text {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.subtext {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.divider {
  width: 1px;
  align-self: stretch;
  background: var(--color-border);
}

.chevron {
  font-size: 20px;
  color: var(--color-text-secondary);
  margin-left: auto;
}

.right .chevron {
  color: var(--color-text-secondary);
}

.review-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-lg);
  padding: 0.6rem 1.1rem;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.review-btn:hover {
  background: var(--color-primary-hover);
}

.review-btn .chevron {
  color: #ffffff;
  margin-left: 0;
}
</style>
