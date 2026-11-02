<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card" @click.stop>
      <div class="modal-header">
        <div class="title-group">
          <h3>Defter Kapağını Seç</h3>
          <p>Defterine özel lüks bir cilt ve doku belirle</p>
        </div>
        <button type="button" class="close-btn" @click="$emit('close')" title="Kapat (ESC)">&times;</button>
      </div>

      <div class="modal-body">
        <div class="covers-grid">
          <div 
            v-for="c in COVER_STYLES" 
            :key="c.id"
            class="cover-choice-card"
            :class="[
              `preview-${c.id}`,
              { active: selectedStyle === c.id }
            ]"
            @click="selectCover(c.id)"
          >
            <div class="mini-cover">
              <div class="mini-spine"></div>
              <div class="mini-plaque"></div>
            </div>
            <div class="cover-info">
              <span class="cover-name">{{ c.name }}</span>
              <span class="cover-desc">{{ c.badge }}</span>
            </div>
            <span v-if="selectedStyle === c.id" class="check-badge">✓</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Vazgeç</button>
        <button class="btn btn-primary" @click="handleSave">Kaydet</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { COVER_STYLES } from '../composables/useNotes.js';

const props = defineProps({
  currentCover: {
    type: String,
    default: 'leather-brown'
  }
});

const emit = defineEmits(['close', 'select']);

const selectedStyle = ref(props.currentCover || 'leather-brown');

function selectCover(styleId) {
  selectedStyle.value = styleId;
}

function handleSave() {
  emit('select', selectedStyle.value);
  emit('close');
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    e.stopPropagation();
    e.stopImmediatePropagation();
    emit('close');
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown, true));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown, true));
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 600px;
  background: var(--bg-surface, white);
  color: var(--color-text-main, #0f172a);
  border-radius: 20px;
  box-shadow: 0 25px 40px -10px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  border: 1px solid var(--border-color, #e2e8f0);
  animation: modalScale 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid var(--border-color, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-group h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.title-group p {
  margin: 2px 0 0 0;
  font-size: 13px;
  color: var(--color-text-muted, #64748b);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 20px 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.covers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.cover-choice-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid var(--border-color, #e2e8f0);
  background: var(--bg-surface-subtle, #f8fafc);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.cover-choice-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary, #3b82f6);
}

.cover-choice-card.active {
  border-color: var(--color-primary, #2563eb);
  background: rgba(37, 99, 235, 0.08);
}

/* Mini Cover Visual */
.mini-cover {
  width: 44px;
  height: 56px;
  border-radius: 2px 8px 8px 2px;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mini-spine {
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(0, 0, 0, 0.2);
}

.mini-plaque {
  width: 24px;
  height: 14px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 2px;
  margin-left: 4px;
}

/* Palette Previews for Mini Covers */
.preview-leather-brown .mini-cover { background: #78350F; }
.preview-leather-black .mini-cover { background: #1E293B; }
.preview-spiral-kraft .mini-cover { background: #D97706; }
.preview-marble-rose .mini-cover { background: linear-gradient(135deg, #FFE4E6, #FDA4AF); }
.preview-marble-mint .mini-cover { background: linear-gradient(135deg, #DCFCE7, #6EE7B7); }
.preview-linen-navy .mini-cover { background: #1E1B4B; }
.preview-linen-cream .mini-cover { background: #E7E5E4; }
.preview-pastel-sunset .mini-cover { background: linear-gradient(135deg, #FDE68A, #F472B6); }

.cover-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cover-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-main, #0f172a);
}

.cover-desc {
  font-size: 11px;
  color: var(--color-text-muted, #64748b);
}

.check-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary, #2563eb);
  color: white;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-footer {
  padding: 14px 24px;
  border-top: 1px solid var(--border-color, #f1f5f9);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.btn-secondary {
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-color);
  color: var(--color-text-main);
}

.btn-primary {
  background: var(--color-primary, #2563eb);
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}
</style>
