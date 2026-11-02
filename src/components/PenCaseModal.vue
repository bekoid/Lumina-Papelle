<template>
  <div v-if="isOpen" class="pencase-modal-overlay" @click.self="$emit('close')">
    <div class="pencase-card" @click.stop>
      <div class="pencase-header">
        <div class="header-left">
          <div class="pencase-badge">
            <Feather :size="16" />
            <span>Kalem Çantası & Detaylı Uç Ayarı</span>
          </div>
        </div>
        <button type="button" class="close-btn" @click="$emit('close')" title="Kapat (ESC)">&times;</button>
      </div>

      <div class="pencase-body">
        <!-- 5 Quick Slots Row -->
        <div class="slots-section">
          <label class="section-label">Hızlı Kalem Yuvaları</label>
          <div class="slots-row">
            <button
              v-for="(slot, idx) in slots"
              :key="slot.id"
              class="slot-card-btn"
              :class="{ active: activeSlotIndex === idx }"
              @click="$emit('select-slot', idx)"
              :title="slot.name"
            >
              <div 
                class="slot-color-circle" 
                :style="{ 
                  backgroundColor: slot.color,
                  opacity: slot.opacity !== undefined ? slot.opacity : 1
                }"
              >
                <span class="slot-size-num">{{ Math.round(slot.size) }}</span>
              </div>
              <span class="slot-name-label">{{ slot.name }}</span>
            </button>
          </div>
        </div>

        <!-- Live Stroke Preview Box -->
        <div class="preview-section">
          <label class="section-label">Canlı Çizgi & Uç Önizlemesi</label>
          <div class="stroke-preview-box">
            <svg class="preview-svg" viewBox="0 0 380 60" preserveAspectRatio="none">
              <!-- S-curve line demonstrating the exact thickness, color, and opacity -->
              <path 
                d="M 30 30 Q 110 5 190 30 T 350 30" 
                fill="none" 
                :stroke="localColor" 
                :stroke-width="localSize" 
                :opacity="localOpacity"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div class="preview-info-pill">
              {{ localToolName }} • {{ localSize }}px ({{ (localSize * 0.35).toFixed(1) }}mm) • %{{ Math.round(localOpacity * 100) }} Opaklık
            </div>
          </div>
        </div>

        <!-- Pen Type Selector -->
        <div class="tool-type-section">
          <label class="section-label">Kalem Türü</label>
          <div class="tool-types-grid">
            <button
              type="button"
              class="type-btn"
              :class="{ active: localTool === 'pen' }"
              @click="setTool('pen')"
            >
              <PenTool :size="15" />
              <span>Tükenmez Kalem</span>
            </button>
            <button
              type="button"
              class="type-btn"
              :class="{ active: localTool === 'highlighter' }"
              @click="setTool('highlighter')"
            >
              <Highlighter :size="15" />
              <span>Fosforlu Kalem</span>
            </button>
            <button
              type="button"
              class="type-btn"
              :class="{ active: localTool === 'pencil' }"
              @click="setTool('pencil')"
            >
              <Edit3 :size="15" />
              <span>Kurşun Kalem</span>
            </button>
          </div>
        </div>

        <!-- Thickness (Incelik / Kalınlık) -->
        <div class="slider-control-group">
          <div class="slider-label-row">
            <span class="ctrl-title">Uç İnceliği / Kalınlığı</span>
            <span class="ctrl-val">{{ localSize }} px ({{ (localSize * 0.35).toFixed(1) }} mm)</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="40" 
            step="1"
            v-model.number="localSize" 
            class="range-slider"
            @input="emitChange"
          />
          <div class="quick-presets-row">
            <button 
              v-for="p in sizePresets" 
              :key="p.size"
              class="preset-pill"
              :class="{ selected: localSize === p.size }"
              @click="setSize(p.size)"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <!-- Opacity (Opaklık / Şeffaflık) -->
        <div class="slider-control-group">
          <div class="slider-label-row">
            <span class="ctrl-title">Opaklık / Şeffaflık</span>
            <span class="ctrl-val">%{{ Math.round(localOpacity * 100) }}</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="1.0" 
            step="0.05"
            v-model.number="localOpacity" 
            class="range-slider opacity-slider"
            @input="emitChange"
          />
          <div class="quick-presets-row">
            <button 
              v-for="op in opacityPresets" 
              :key="op.val"
              class="preset-pill"
              :class="{ selected: Math.abs(localOpacity - op.val) < 0.04 }"
              @click="setOpacity(op.val)"
            >
              {{ op.label }}
            </button>
          </div>
        </div>

        <!-- Color Palette (Renk Seçimi) -->
        <div class="color-picker-section">
          <div class="slider-label-row">
            <span class="ctrl-title">Mürekkep Rengi</span>
            <span class="ctrl-val">{{ localColor }}</span>
          </div>
          <div class="colors-palette-grid">
            <button
              v-for="clr in PRESET_COLORS"
              :key="clr"
              class="color-dot-btn"
              :class="{ active: localColor.toLowerCase() === clr.toLowerCase() }"
              :style="{ backgroundColor: clr }"
              @click="setColor(clr)"
              :title="clr"
            ></button>
            <!-- Custom HTML5 Color Input -->
            <label class="custom-color-picker-btn" title="Özel Renk Seç">
              <input 
                type="color" 
                v-model="localColor" 
                @input="emitChange" 
                class="hidden-color-input" 
              />
              <span class="rainbow-icon">🎨</span>
            </label>
          </div>
        </div>
      </div>

      <div class="pencase-footer">
        <button class="save-slot-btn" @click="saveToActiveSlot">
          💾 Bu Ayarları Yuvaya Kaydet (Yuva {{ activeSlotIndex + 1 }})
        </button>
        <button class="done-btn" @click="$emit('close')">
          Tamam
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { Feather, PenTool, Highlighter, Edit3 } from '@lucide/vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  activeSlotIndex: {
    type: Number,
    default: 0
  },
  slots: {
    type: Array,
    default: () => []
  },
  currentPen: {
    type: Object,
    default: () => ({
      tool: 'pen',
      color: '#1E293B',
      size: 3,
      opacity: 1.0
    })
  }
});

const emit = defineEmits(['close', 'update-pen', 'update-slot', 'select-slot']);

const localTool = ref(props.currentPen.tool || 'pen');
const localColor = ref(props.currentPen.color || '#1E293B');
const localSize = ref(props.currentPen.size || 3);
const localOpacity = ref(props.currentPen.opacity !== undefined ? props.currentPen.opacity : 1.0);

watch(() => props.currentPen, (newVal) => {
  if (newVal) {
    localTool.value = newVal.tool || 'pen';
    localColor.value = newVal.color || '#1E293B';
    localSize.value = newVal.size || 3;
    localOpacity.value = newVal.opacity !== undefined ? newVal.opacity : 1.0;
  }
}, { deep: true });

const PRESET_COLORS = [
  '#0F172A', '#475569', '#DC2626', '#EA580C', '#D97706',
  '#16A34A', '#0D9488', '#0284C7', '#2563EB', '#7C3AED',
  '#DB2777', '#F43F5E', '#FB7185', '#FBBF24', '#34D399',
  '#38BDF8', '#818CF8', '#C084FC', '#F472B6', '#FFFFFF'
];

const sizePresets = [
  { size: 2, label: '0.3mm İncecik' },
  { size: 3, label: '0.5mm Dolma' },
  { size: 6, label: '1.0mm İmza' },
  { size: 12, label: '2.5mm Başlık' },
  { size: 20, label: '5.0mm Fosfor' },
  { size: 32, label: '8.0mm Geniş' }
];

const opacityPresets = [
  { val: 0.25, label: '%25 Saydam' },
  { val: 0.40, label: '%40 Fosfor' },
  { val: 0.70, label: '%70 Eskiz' },
  { val: 1.00, label: '%100 Tam Net' }
];

const localToolName = computed(() => {
  if (localTool.value === 'highlighter') return 'Fosforlu Kalem';
  if (localTool.value === 'pencil') return 'Kurşun Kalem';
  return 'Tükenmez Kalem';
});

function setTool(tool) {
  localTool.value = tool;
  if (tool === 'highlighter') {
    if (localSize.value < 12) localSize.value = 20;
    if (localOpacity.value > 0.6) localOpacity.value = 0.40;
    if (localColor.value === '#0F172A' || localColor.value === '#000000') localColor.value = '#FBBF24';
  } else if (tool === 'pen') {
    if (localSize.value > 10) localSize.value = 3;
    localOpacity.value = 1.0;
    if (localColor.value === '#FBBF24') localColor.value = '#0F172A';
  } else if (tool === 'pencil') {
    if (localSize.value > 10) localSize.value = 4;
    localOpacity.value = 0.72;
    if (localColor.value === '#FBBF24') localColor.value = '#475569';
  }
  emitChange();
}

function setSize(sz) {
  localSize.value = sz;
  emitChange();
}

function setOpacity(op) {
  localOpacity.value = op;
  emitChange();
}

function setColor(clr) {
  localColor.value = clr;
  emitChange();
}

function emitChange() {
  emit('update-pen', {
    tool: localTool.value,
    color: localColor.value,
    size: localSize.value,
    opacity: localOpacity.value
  });
}

function saveToActiveSlot() {
  emit('update-slot', {
    index: props.activeSlotIndex,
    config: {
      tool: localTool.value,
      color: localColor.value,
      size: localSize.value,
      opacity: localOpacity.value,
      name: `${(localSize.value * 0.35).toFixed(1)}mm ${localToolName.value}`
    }
  });
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    emit('close');
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown, true));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown, true));
</script>

<style scoped>
.pencase-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 16px;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.pencase-card {
  width: 100%;
  max-width: 500px;
  background: var(--bg-surface, #ffffff);
  color: var(--color-text-main, #0f172a);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  flex-direction: column;
}

.pencase-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pencase-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 15px;
  color: var(--color-text-main, #0f172a);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 22px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #ef4444;
}

.pencase-body {
  padding: 16px 20px;
  overflow-y: auto;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted, #64748b);
  margin-bottom: 8px;
}

/* Slots Row */
.slots-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.slot-card-btn {
  background: var(--bg-hover, #f8fafc);
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 8px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.slot-card-btn:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.slot-card-btn.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.slot-color-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.18);
  border: 2px solid white;
}

.slot-size-num {
  font-size: 10px;
  font-weight: 800;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.slot-name-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-main, #334155);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70px;
}

/* Live Preview */
.stroke-preview-box {
  background: var(--bg-hover, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-svg {
  width: 100%;
  height: 48px;
}

.preview-info-pill {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 2px 10px;
  border-radius: 999px;
}

/* Tool Types Grid */
.tool-types-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.type-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--bg-hover, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-main, #334155);
  cursor: pointer;
  transition: all 0.15s;
}

.type-btn:hover {
  border-color: #3b82f6;
}

.type-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Sliders */
.slider-control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.slider-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ctrl-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-main, #0f172a);
}

.ctrl-val {
  font-size: 12px;
  font-weight: 700;
  color: #3b82f6;
}

.range-slider {
  width: 100%;
  accent-color: #3b82f6;
  cursor: pointer;
  height: 6px;
}

.quick-presets-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.preset-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  background: var(--bg-hover, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 6px;
  color: var(--color-text-muted, #64748b);
  cursor: pointer;
  transition: all 0.15s;
}

.preset-pill:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.preset-pill.selected {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Colors Grid */
.colors-palette-grid {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  gap: 6px;
  align-items: center;
}

.color-dot-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.15s;
}

.color-dot-btn:hover {
  transform: scale(1.2);
}

.color-dot-btn.active {
  transform: scale(1.25);
  box-shadow: 0 0 0 2px #3b82f6;
}

.custom-color-picker-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px dashed #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.hidden-color-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.rainbow-icon {
  font-size: 13px;
  line-height: 1;
}

/* Footer */
.pencase-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-color, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--bg-hover, #f8fafc);
}

.save-slot-btn {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  background: var(--bg-surface, white);
  border: 1px solid var(--border-color, #cbd5e1);
  padding: 7px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.save-slot-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.done-btn {
  background: #3b82f6;
  color: white;
  border: none;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.done-btn:hover {
  background: #2563eb;
}

/* Dark Mode */
[data-theme="dark"] .pencase-card {
  background: #1e222d;
  border-color: #333a4d;
}

[data-theme="dark"] .pencase-header,
[data-theme="dark"] .pencase-footer {
  border-color: #2e3446;
  background: #181b24;
}

[data-theme="dark"] .slot-card-btn,
[data-theme="dark"] .stroke-preview-box,
[data-theme="dark"] .type-btn,
[data-theme="dark"] .preset-pill {
  background: #181b24;
  border-color: #2e3446;
}

[data-theme="dark"] .preview-info-pill {
  background: #222736;
  border-color: #333a4d;
  color: #cbd5e1;
}

[data-theme="dark"] .slot-name-label,
[data-theme="dark"] .type-btn {
  color: #cbd5e1;
}

[data-theme="dark"] .save-slot-btn {
  background: #222736;
  color: #cbd5e1;
  border-color: #333a4d;
}
</style>
