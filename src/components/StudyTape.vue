<template>
  <div 
    class="study-tape-wrapper"
    :class="{ 
      'is-revealed': tape.isRevealed,
      'is-selected': isSelected,
      'drawing-locked': disabled
    }"
    :style="{
      transform: `translate3d(${localX}px, ${localY}px, 0)`,
      width: `${localWidth}px`
    }"
    @pointerdown.stop="handlePointerDown"
    @click.stop="toggleReveal"
  >
    <!-- Serrated Washi Tape Strip -->
    <div 
      class="tape-strip" 
      :style="stripStyle"
    >
      <!-- Subtle Paper Fiber Overlay -->
      <div class="tape-fiber-texture"></div>

      <!-- Flashcard Peek / Reveal Status Pill -->
      <div class="tape-state-pill" :title="tape.isRevealed ? 'Gizlemek için tıkla' : 'Görmek için tıkla (Çalışma Modu)'">
        <component :is="tape.isRevealed ? Eye : EyeOff" :size="12" />
        <span class="tape-hint">{{ tape.isRevealed ? 'Açık' : 'Gizli' }}</span>
      </div>

      <!-- Delete Button (Shown when selected) -->
      <button 
        v-if="isSelected && !disabled"
        class="tape-delete-btn"
        @pointerdown.stop
        @click.stop="$emit('delete', tape.id)"
        title="Bandı Kaldır"
      >
        &times;
      </button>

      <!-- Horizontal Width Resize Handle -->
      <div 
        v-if="isSelected && !disabled"
        class="tape-resize-handle"
        @pointerdown.stop="handleResizeStart"
        title="Genişliği Ayarla (Sürükle)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, inject } from 'vue';
import { Eye, EyeOff } from '@lucide/vue';

const stageScale = inject('stageScale', ref(1));

const props = defineProps({
  tape: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select', 'update', 'delete']);

const localX = ref(props.tape.x || 0);
const localY = ref(props.tape.y || 0);
const localWidth = ref(props.tape.width || 220);

watch(
  () => [props.tape.x, props.tape.y, props.tape.width],
  ([nx, ny, nw]) => {
    if (!isDragging && !isResizing) {
      localX.value = nx ?? 0;
      localY.value = ny ?? 0;
      localWidth.value = nw ?? 220;
    }
  }
);

const PATTERN_STYLES = {
  'tape_pastel_pink': 'repeating-linear-gradient(45deg, #FDA4AF, #FDA4AF 10px, #FFF1F2 10px, #FFF1F2 20px)',
  'tape_mint_grid': 'repeating-linear-gradient(0deg, #A7F3D0, #A7F3D0 1.5px, transparent 1.5px, transparent 12px), repeating-linear-gradient(90deg, #A7F3D0, #A7F3D0 1.5px, #ECFDF5 1.5px, #ECFDF5 12px)',
  'tape_gold_dots': 'radial-gradient(#F59E0B 22%, transparent 23%), radial-gradient(#F59E0B 22%, #FEF3C7 23%)',
  'tape_sky_gradient': 'linear-gradient(90deg, #BAE6FD, #C7D2FE)',
  'tape_lavender_floral': 'repeating-linear-gradient(135deg, #DDD6FE, #DDD6FE 8px, #FAF5FF 8px, #FAF5FF 16px)',
  'tape_caution_yellow': 'repeating-linear-gradient(-45deg, #FDE047, #FDE047 12px, #EAB308 12px, #EAB308 24px)',
  'tape_vintage_kraft': 'repeating-linear-gradient(90deg, #D97706, #D97706 6px, #B45309 6px, #B45309 12px)',
  'tape_sakura_bloom': 'repeating-linear-gradient(45deg, #FBCFE8, #FBCFE8 12px, #FCE7F3 12px, #FCE7F3 24px)'
};

const stripStyle = computed(() => {
  let bg = '';
  if (props.tape.css) {
    bg = props.tape.css;
  } else if (props.tape.pattern && PATTERN_STYLES[props.tape.pattern]) {
    bg = PATTERN_STYLES[props.tape.pattern];
  } else if (props.tape.color) {
    bg = props.tape.color;
  } else {
    bg = 'repeating-linear-gradient(45deg, #FDA4AF, #FDA4AF 10px, #FFF1F2 10px, #FFF1F2 20px)';
  }

  const styleObj = { background: bg };
  if (props.tape.pattern === 'tape_gold_dots' || bg.includes('radial-gradient')) {
    styleObj.backgroundSize = '14px 14px';
    styleObj.backgroundColor = '#FEF3C7';
  }
  return styleObj;
});

let isDragging = false;
let hasMoved = false;
let suppressNextClick = false;
let startX = 0;
let startY = 0;
let initialX = 0;
let initialY = 0;

let isResizing = false;
let initialWidth = 0;

function handlePointerDown(e) {
  if (props.disabled) return;
  emit('select', props.tape.id);

  isDragging = true;
  hasMoved = false;
  startX = e.clientX;
  startY = e.clientY;
  initialX = localX.value;
  initialY = localY.value;

  window.addEventListener('pointermove', onDragMove);
  window.addEventListener('pointerup', onDragEnd);
}

function onDragMove(e) {
  if (!isDragging) return;
  const s = stageScale.value || 1;
  const dx = (e.clientX - startX) / s;
  const dy = (e.clientY - startY) / s;
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasMoved = true;

  localX.value = Math.max(0, Math.round(initialX + dx));
  localY.value = Math.max(0, Math.round(initialY + dy));
}

function onDragEnd() {
  if (isDragging && hasMoved) {
    suppressNextClick = true;
    emit('update', {
      ...props.tape,
      x: localX.value,
      y: localY.value,
      width: localWidth.value
    });
  }
  isDragging = false;
  hasMoved = false;
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragEnd);
}

function handleResizeStart(e) {
  if (props.disabled) return;
  e.stopPropagation();
  isResizing = true;
  hasMoved = false;
  startX = e.clientX;
  initialWidth = localWidth.value || 220;

  window.addEventListener('pointermove', onResizeMove);
  window.addEventListener('pointerup', onResizeEnd);
}

function onResizeMove(e) {
  if (!isResizing) return;
  const s = stageScale.value || 1;
  const dx = (e.clientX - startX) / s;
  if (Math.abs(dx) > 1) hasMoved = true;
  const newWidth = Math.max(70, Math.min(800, initialWidth + dx));

  localWidth.value = Math.round(newWidth);
}

function onResizeEnd() {
  if (isResizing && hasMoved) {
    suppressNextClick = true;
    emit('update', {
      ...props.tape,
      x: localX.value,
      y: localY.value,
      width: localWidth.value
    });
  }
  isResizing = false;
  hasMoved = false;
  window.removeEventListener('pointermove', onResizeMove);
  window.removeEventListener('pointerup', onResizeEnd);
}

function toggleReveal() {
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }
  if (isDragging || isResizing) return;
  emit('update', {
    ...props.tape,
    x: localX.value,
    y: localY.value,
    width: localWidth.value,
    isRevealed: !props.tape.isRevealed
  });
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragEnd);
  window.removeEventListener('pointermove', onResizeMove);
  window.removeEventListener('pointerup', onResizeEnd);
});
</script>

<style scoped>
.study-tape-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  height: 34px;
  touch-action: none;
  z-index: 9;
  cursor: grab;
  user-select: none;
}

.study-tape-wrapper:active {
  cursor: grabbing;
}

.study-tape-wrapper.drawing-locked {
  pointer-events: none;
}

/* Washi Tape Strip with Realistic Serrated Torn Edges */
.tape-strip {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.16);
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s ease, filter 0.2s ease;
  overflow: visible;
  opacity: 0.94;

  /* Jagged / Serrated Torn Paper Edges on Left and Right */
  clip-path: polygon(
    0% 0%, 
    4px 20%, 
    0% 40%, 
    4px 60%, 
    0% 80%, 
    4px 100%, 
    100% 100%, 
    calc(100% - 4px) 80%, 
    100% 60%, 
    calc(100% - 4px) 40%, 
    100% 20%, 
    calc(100% - 4px) 0%
  );
}

.tape-strip:hover {
  transform: scaleY(1.05);
}

/* Fiber Texture */
.tape-fiber-texture {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 0);
  background-size: 4px 4px;
  pointer-events: none;
}

/* Revealed Flashcard State: Translucent peek */
.study-tape-wrapper.is-revealed .tape-strip {
  opacity: 0.15 !important;
  filter: grayscale(0.6);
  box-shadow: none;
}

.tape-state-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #1e293b;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(4px);
  padding: 2px 8px;
  border-radius: 999px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  pointer-events: none;
}

.tape-delete-btn {
  position: absolute;
  top: -9px;
  right: -9px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: 1.5px solid white;
  font-size: 15px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.tape-delete-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.tape-resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 10px;
  background: rgba(0, 0, 0, 0.25);
  cursor: ew-resize;
  border-radius: 0;
  transition: background 0.15s;
}

.tape-resize-handle:hover {
  background: rgba(0, 0, 0, 0.45);
}

.study-tape-wrapper.is-selected {
  outline: 2px dashed #3b82f6;
  outline-offset: 4px;
}
</style>
