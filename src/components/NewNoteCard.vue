<template>
  <div class="new-note-card" @click="$emit('create')">
    <div class="plus-icon-wrapper">
      <Plus :size="28" class="plus-icon" />
    </div>
    <div class="card-text-group">
      <span class="card-title">Yeni Defter Aç</span>
      <span class="card-subtitle">Çizgili, kareli, noktalı veya düz pastel sayfa</span>
    </div>
  </div>
</template>

<script setup>
import { Plus } from '@lucide/vue';

defineEmits(['create']);
</script>

<style scoped>
.new-note-card {
  min-height: 250px;
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1.5px dashed var(--border-color);
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
}

.new-note-card:hover {
  border-style: solid;
  border-color: var(--color-primary);
  background: var(--bg-surface);
  transform: translateY(-4px);
  box-shadow: 0 16px 32px -8px var(--color-primary-soft);
}

.new-note-card:active {
  transform: scale(0.98);
}

.plus-icon-wrapper {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.new-note-card:hover .plus-icon-wrapper {
  background: var(--color-primary);
  color: #ffffff;
  transform: rotate(90deg) scale(1.06);
}

[data-theme="dark"] .new-note-card:hover .plus-icon-wrapper {
  color: #111118;
}

.card-text-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  font-size: 15.5px;
  font-weight: 700;
  color: var(--color-text-main);
}

.card-subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
