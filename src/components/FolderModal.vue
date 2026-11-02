<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card" @click.stop>
      <div class="modal-header">
        <h3>Yeni Klasör Oluştur</h3>
        <button type="button" class="close-btn" @click="$emit('close')" title="Kapat (ESC)">&times;</button>
      </div>

      <div class="modal-body">
        <label class="form-label">Klasör Adı</label>
        <input 
          type="text" 
          v-model="folderName" 
          placeholder="Örn: Ders Notları, Proje Fikirleri..." 
          class="form-input"
          ref="inputRef"
          @keyup.enter="handleSave"
        />

        <label class="form-label">Pastel Klasör Rengi</label>
        <div class="color-picker-row">
          <button 
            v-for="color in folderColors" 
            :key="color"
            class="color-option"
            :class="{ active: selectedColor === color }"
            :style="{ backgroundColor: color }"
            @click="selectedColor = color"
          ></button>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Vazgeç</button>
        <button class="btn btn-primary" :disabled="!folderName.trim()" @click="handleSave">
          Klasörü Oluştur
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const emit = defineEmits(['close', 'create']);

const folderName = ref('');
const selectedColor = ref('#8B5CF6');
const inputRef = ref(null);

const folderColors = [
  '#F472B6', // Sakura
  '#34D399', // Adaçayı
  '#60A5FA', // Buzul
  '#8B5CF6', // Lavanta
  '#FB923C', // Kayısı
  '#FBBF24', // Vanilya
  '#2DD4BF', // Lagün
  '#E879F9', // Mürdüm
  '#A8A29E'  // Keten
];

function handleSave() {
  if (folderName.value.trim()) {
    emit('create', { name: folderName.value.trim(), color: selectedColor.value });
    emit('close');
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    e.stopPropagation();
    e.stopImmediatePropagation();
    emit('close');
  }
}

onMounted(() => {
  inputRef.value?.focus();
  window.addEventListener('keydown', onKeydown, true);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown, true);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 12, 24, 0.36);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-surface);
  backdrop-filter: blur(28px) saturate(175%);
  border: 1px solid var(--border-glass);
  border-radius: 24px;
  box-shadow: 0 24px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  color: var(--color-text-main);
  animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  padding: 18px 22px 14px 22px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 16.5px;
  font-weight: 700;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  color: var(--color-text-muted);
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-subtle);
  color: var(--color-text-main);
  font-size: 13.5px;
  outline: none;
  transition: all 0.18s ease;
}

.form-input:focus {
  border-color: var(--color-primary);
  background: var(--bg-surface);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.color-picker-row {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 2px;
}

.color-option {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.85);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.18);
  transition: transform 0.15s ease;
}

.color-option:hover {
  transform: scale(1.15);
}

.color-option.active {
  transform: scale(1.22);
  box-shadow: 0 0 0 2.5px var(--color-primary);
}

.modal-footer {
  padding: 14px 22px 18px 22px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.btn-secondary {
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-color);
  color: var(--color-text-muted);
}

.btn-secondary:hover {
  color: var(--color-text-main);
}

.btn-primary {
  background: var(--color-primary);
  color: #ffffff;
}

[data-theme="dark"] .btn-primary {
  color: #111118;
}

.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
